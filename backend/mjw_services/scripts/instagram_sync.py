"""
Weekly Instagram photo sync script.

Downloads photos from Instagram and uploads them to S3.
Records provenance (source account, original URL, Instagram timestamp) in the database.

Required env vars:
    INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USERNAME
    PHOTOS_S3_BUCKET
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION

Optional env vars:
    PHOTOS_BASE_URL  — override the public base URL (e.g. a CloudFront domain)

Run via cron or ECS scheduled task:
    python scripts/instagram_sync.py
"""

import os
import sys
import re
import django
import requests
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mjw_services.settings")
django.setup()

from gold_rate_admin.models import Photo

INSTAGRAM_API_BASE = "https://graph.instagram.com/v22.0"
MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_sns_client():
    import boto3
    return boto3.client(
        'sns',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION', 'ap-south-1'),
    )


def get_s3_client():
    import boto3
    account_id = os.getenv('CLOUDFLARE_ACCOUNT_ID')
    return boto3.client(
        's3',
        endpoint_url=f'https://{account_id}.r2.cloudflarestorage.com',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name='auto',
    )


def notify_error(message):
    topic_arn = os.getenv('SNS_TOPIC_ARN', 'arn:aws:sns:ap-south-1:263095946180:GoldRateAlerts')
    try:
        get_sns_client().publish(
            TopicArn=topic_arn,
            Message=message,
            Subject="Instagram Sync Failed",
        )
    except Exception as e:
        print(f"Could not send SNS notification: {e}")


def fetch_all_media(user_id, access_token):
    """Fetch all IMAGE and CAROUSEL_ALBUM media from Instagram with pagination."""
    url = (
        f"{INSTAGRAM_API_BASE}/{user_id}/media"
        f"?fields=id,media_type,media_url,permalink,timestamp"
        f"&access_token={access_token}"
    )
    items = []
    while url:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        for item in data.get('data', []):
            if item.get('media_type') in ('IMAGE', 'CAROUSEL_ALBUM'):
                items.append(item)
        url = data.get('paging', {}).get('next')
    return items


def s3_key(instagram_id, media_url):
    """Derive a stable S3 object key from the Instagram ID and URL extension."""
    ext_match = re.search(r'\.(jpg|jpeg|png|webp)', media_url, re.IGNORECASE)
    ext = ext_match.group(0).lower() if ext_match else '.jpg'
    return f"photos/{instagram_id}{ext}"


def download_image_bytes(media_url):
    """Download image and return (bytes, content_type). Raises if too large."""
    response = requests.get(media_url, timeout=60, stream=True)
    response.raise_for_status()

    content_length = response.headers.get('content-length')
    if content_length and int(content_length) > MAX_IMAGE_SIZE_BYTES:
        response.close()
        raise ValueError(f"Image too large: {content_length} bytes")

    chunks = []
    total = 0
    for chunk in response.iter_content(chunk_size=8192):
        total += len(chunk)
        if total > MAX_IMAGE_SIZE_BYTES:
            raise ValueError(f"Image exceeded {MAX_IMAGE_SIZE_BYTES} bytes during download")
        chunks.append(chunk)

    content_type = response.headers.get('content-type', 'image/jpeg').split(';')[0]
    return b''.join(chunks), content_type


def upload_to_s3(s3_client, bucket, key, data, content_type):
    """Upload bytes to R2. Public access is controlled at the bucket level
    in the Cloudflare dashboard — no per-object ACL needed."""
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
        CacheControl='public, max-age=604800',  # 1 week
    )


# ---------------------------------------------------------------------------
# Main sync
# ---------------------------------------------------------------------------

def sync_photos():
    user_id = os.getenv('INSTAGRAM_USER_ID')
    access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
    username = os.getenv('INSTAGRAM_USERNAME', 'unknown')
    bucket = os.getenv('PHOTOS_S3_BUCKET')

    if not user_id or not access_token:
        raise ValueError("INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN must be set")
    if not bucket:
        raise ValueError("PHOTOS_S3_BUCKET must be set")

    s3 = get_s3_client()

    print("Fetching media list from Instagram...")
    media_items = fetch_all_media(user_id, access_token)
    print(f"Found {len(media_items)} images/carousels")

    new_count = 0
    skip_count = 0
    error_count = 0

    for item in media_items:
        instagram_id = item['id']

        if Photo.objects.filter(instagram_id=instagram_id).exists():
            skip_count += 1
            continue

        media_url = item.get('media_url', '')
        if not media_url:
            print(f"  Skipping {instagram_id}: no media_url")
            error_count += 1
            continue

        key = s3_key(instagram_id, media_url)

        try:
            print(f"  Downloading {instagram_id}...")
            image_bytes, content_type = download_image_bytes(media_url)
            print(f"  Uploading to s3://{bucket}/{key}")
            upload_to_s3(s3, bucket, key, image_bytes, content_type)
        except Exception as e:
            print(f"  Failed {instagram_id}: {e}")
            error_count += 1
            continue

        raw_ts = item.get('timestamp', '')
        try:
            instagram_timestamp = datetime.fromisoformat(raw_ts.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            instagram_timestamp = datetime.now(tz=timezone.utc)

        Photo.objects.create(
            instagram_id=instagram_id,
            filename=key,                          # S3 object key
            media_type=item.get('media_type', 'IMAGE'),
            instagram_url=media_url,               # original Instagram CDN URL
            instagram_permalink=item.get('permalink', ''),
            instagram_timestamp=instagram_timestamp,
            instagram_username=username,
        )
        new_count += 1

    print(f"Sync complete: {new_count} new, {skip_count} already stored, {error_count} errors")
    return error_count


if __name__ == "__main__":
    try:
        errors = sync_photos()
        if errors:
            notify_error(f"Instagram sync completed with {errors} upload errors. Check logs.")
    except Exception as e:
        print(f"Instagram sync failed: {e}")
        notify_error(f"Instagram sync failed: {e}")
        sys.exit(1)
