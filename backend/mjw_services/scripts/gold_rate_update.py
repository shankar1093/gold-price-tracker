import os
import sys
import django
import requests
import math
from django.utils import timezone
import re

# Pre-compile regex pattern to avoid repeated compilation
WHITESPACE_PATTERN = re.compile(r"\s+")

# Lazy-load boto3 to save ~5-10MB memory in happy path
_sns_client = None


def get_sns_client():
    """Lazy-load SNS client only when needed (on errors)."""
    global _sns_client
    if _sns_client is None:
        import boto3
        _sns_client = boto3.client(
            'sns',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'ap-south-1')
        )
    return _sns_client

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mjw_services.settings")
django.setup()

# Now you can import your models
from gold_rate_admin.models import Rate

GOLD_999_SEARCH_TERMS = [
    "gold 999 with gst",
    "gold 999 imported with gst",
    "gold 999 indian-bis with gst",
    "gold 999 imp (lbma) with gst"
]


def price_adjustment(price):
    return int(round(price / 5) * 5)


# Max response size: 1MB (price data should be ~10KB)
MAX_RESPONSE_SIZE = 1 * 1024 * 1024


def fetch_json_safe(url, timeout=30):
    """Fetch JSON with size validation to prevent memory exhaustion."""
    response = requests.get(url, timeout=timeout, stream=True)
    response.raise_for_status()

    # Check content-length if available
    content_length = response.headers.get('content-length')
    if content_length and int(content_length) > MAX_RESPONSE_SIZE:
        response.close()
        raise ValueError(f"Response too large: {content_length} bytes")

    # Read with size limit
    content = response.content
    if len(content) > MAX_RESPONSE_SIZE:
        del content
        raise ValueError(f"Response exceeded {MAX_RESPONSE_SIZE} bytes")

    data = response.json()
    # Explicitly close and cleanup response
    response.close()
    del response
    return data


def update_metal_rate():
    backendUrl = "http://rust-backend:8080"  # Adjust this as needed
    api_url = f"{backendUrl}/gold_price"
    silver_api_url = f"{backendUrl}/silver_price"
    today = timezone.now().date()  # Move this line here, outside the try blocks
    metal_prices = {
        "rate_18kt": None,
        "rate_22kt": None,
        "rate_24kt": None,
        "rate_silver": None,
        "arihant_rate_22kt": None,
        "arihant_rate_24kt": None,
        "arihant_rate_18kt": None,
        "arihant_silver": None,
    }
    def norm(s: str) -> str:
        return WHITESPACE_PATTERN.sub(" ", s.strip().lower())

    try:
        data = fetch_json_safe(api_url)

        gold999WithGst = next(
            (
                item
                for item in data
                if any(
                    term in norm(item.get("description", "").lower())
                    for term in GOLD_999_SEARCH_TERMS
                )
            ),
            None,
        )

        # Cleanup data after extracting what we need
        del data

        if gold999WithGst is None:
            raise ValueError("Couldn't find matching gold price data")

        gold24ktPrice = (
            float(gold999WithGst["ask"]) / 10
            if gold999WithGst and gold999WithGst["ask"].isdigit()
            else 0
        ) / 1.03

        # Cleanup after extracting price
        del gold999WithGst

        gold22ktPrice = (920 / 999) * gold24ktPrice if gold24ktPrice != 0 else 0
        gold18ktPrice = (750 / 999) * gold24ktPrice if gold24ktPrice != 0 else 0

        adjustedGold18ktPrice = price_adjustment(gold18ktPrice * 1.008)
        adjustedGold22ktPrice = price_adjustment(
            gold22ktPrice * 1.011
        )  # Increased by 1.1%
        adjustedGold24ktPrice = price_adjustment(
            gold24ktPrice * 1.05
        )  # Increased by 5% starting 11/17 on account of stability in gold price.

        metal_prices["rate_18kt"] = math.floor(adjustedGold18ktPrice)
        metal_prices["rate_22kt"] = math.floor(adjustedGold22ktPrice)
        metal_prices["rate_24kt"] = math.floor(adjustedGold24ktPrice)
        metal_prices["arihant_rate_22kt"] = math.floor(gold22ktPrice)
        metal_prices["arihant_rate_24kt"] = math.floor(gold24ktPrice)
        metal_prices["arihant_rate_18kt"] = math.floor(gold18ktPrice)

        print("Successfully updated gold rate")
    except Exception as e:
        get_sns_client().publish(
            TopicArn="arn:aws:sns:ap-south-1:263095946180:GoldRateAlerts",
            Message=f"Error updating gold rate: {str(e)}",
            Subject="Gold Rate Update Failed, Check the arihant 999 gold description"
        )
        print(f"Error updating gold rate: {str(e)}")

    try:
        data = fetch_json_safe(silver_api_url)
        SILVER_SEARCH_TERMS = [
            "silver 999 with gst",
        ]
        silver = next(
            (
                item
                for item in data
                if any(
                    term in norm(item.get("description", "").lower())
                    for term in SILVER_SEARCH_TERMS
                )
            ),
            None,
        )

        # Cleanup data after extracting what we need
        del data

        silver999price = (
            float(silver["ask"]) / 10 if silver and silver["ask"].isdigit() else 0
        ) / 1.03

        # Cleanup after extracting price
        del silver

        metal_prices["arihant_silver"] = math.floor(silver999price)
        metal_prices["rate_silver"] = math.floor(silver999price) * 1.12/100 #keep silver price per gram
        print("Successfully updated silver rate")
    except Exception as e:
        print(f"Error updating silver rate: {str(e)}")

    Rate.objects.update_or_create(
        date=today,  # Use the date object directly
        defaults={
            "rate_18kt": metal_prices["rate_18kt"],
            "rate_22kt": metal_prices["rate_22kt"],
            "rate_24kt": metal_prices["rate_24kt"],
            "rate_silver": metal_prices["rate_silver"],
            "arihant_rate_22kt": metal_prices["arihant_rate_22kt"],
            "arihant_rate_24kt": metal_prices["arihant_rate_24kt"],
            "arihant_rate_18kt": metal_prices["arihant_rate_18kt"],
            "arihant_rate_silver": metal_prices["arihant_silver"],
        },
    )


if __name__ == "__main__":
    update_metal_rate()
