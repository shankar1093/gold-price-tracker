from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
import json
from datetime import datetime
from .models import Rate, Photo, BookingLock, MetalInventory
import os
import requests
from datetime import timedelta
from django.db import transaction


@require_http_methods(["GET"])
def get_photos(request):
    from django.conf import settings

    base_url = settings.PHOTOS_BASE_URL.rstrip("/")
    photos = Photo.objects.filter(is_active=True)
    urls = [f"{base_url}/{photo.filename}" for photo in photos]
    return JsonResponse(urls, safe=False)


def index(request):
    return HttpResponse("Hello, world. You're at the mjw_services index.")


def get_metal_rates(request):
    today = timezone.now().date()
    try:
        # First, try to get today's rate
        rate = Rate.objects.get(date=today)
    except Rate.DoesNotExist:
        # If today's rate doesn't exist, get the most recent rate
        rate = Rate.objects.order_by("-date").first()

        if not rate:
            return JsonResponse({"error": "No rate available"}, status=404)

    return JsonResponse(
        {
            "date": rate.date,
            "rate_22kt": rate.rate_22kt,
            "rate_24kt": rate.rate_24kt,
            "rate_18kt": rate.arihant_rate_18kt,
            "rate_silver": rate.rate_silver,
            "arihant_rate_22kt": rate.arihant_rate_22kt,
            "arihant_rate_24kt": rate.arihant_rate_24kt,
            "arihant_rate_18kt": rate.arihant_rate_18kt,
            "arihant_silver": rate.arihant_rate_silver,
        }
    )


def get_metal_rate_by_date_range(request, start_date, end_date):
    rates = Rate.objects.filter(date__range=(start_date, end_date))
    return JsonResponse(
        {
            "rates": list(rates.values()),
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def admin_login(request):
    try:
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return JsonResponse(
                {"error": "Username and password are required"}, status=400
            )

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse(
                {
                    "success": True,
                    "message": "Login successful",
                    "username": user.username,
                }
            )
        else:
            return JsonResponse({"error": "Invalid credentials"}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def admin_logout(request):
    logout(request)
    return JsonResponse({"success": True, "message": "Logout successful"})


@require_http_methods(["GET"])
def admin_status(request):
    if request.user.is_authenticated:
        return JsonResponse({"authenticated": True, "username": request.user.username})
    return JsonResponse({"authenticated": False})


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def manual_rate_update(request):
    try:
        data = json.loads(request.body)
        date_str = data.get("date")

        if not date_str:
            date = timezone.now().date()
        else:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()

        # Get or create the rate for the date
        rate, created = Rate.objects.get_or_create(
            date=date,
            defaults={
                "rate_18kt": data.get("rate_18kt", 7500),
                "rate_22kt": data.get("rate_22kt", 6850),
                "rate_24kt": data.get("rate_24kt", 7500),
                "rate_silver": data.get("rate_silver", 106),
                "arihant_rate_18kt": data.get("arihant_rate_18kt", 7500),
                "arihant_rate_22kt": data.get("arihant_rate_22kt", 6850),
                "arihant_rate_24kt": data.get("arihant_rate_24kt", 7500),
                "arihant_rate_silver": data.get("arihant_rate_silver", 106),
                "is_manual_override": True,
                "updated_by": request.user.username,
            },
        )

        # If not created, update the existing record
        if not created:
            if "rate_18kt" in data:
                rate.rate_18kt = data["rate_18kt"]
            if "rate_22kt" in data:
                rate.rate_22kt = data["rate_22kt"]
            if "rate_24kt" in data:
                rate.rate_24kt = data["rate_24kt"]
            if "rate_silver" in data:
                rate.rate_silver = data["rate_silver"]
            if "arihant_rate_18kt" in data:
                rate.arihant_rate_18kt = data["arihant_rate_18kt"]
            if "arihant_rate_22kt" in data:
                rate.arihant_rate_22kt = data["arihant_rate_22kt"]
            if "arihant_rate_24kt" in data:
                rate.arihant_rate_24kt = data["arihant_rate_24kt"]
            if "arihant_rate_silver" in data:
                rate.arihant_rate_silver = data["arihant_rate_silver"]

            rate.is_manual_override = True
            rate.updated_by = request.user.username
            rate.save()

        return JsonResponse(
            {
                "success": True,
                "message": "Rate updated successfully",
                "rate": {
                    "date": rate.date,
                    "rate_18kt": rate.rate_18kt,
                    "rate_22kt": rate.rate_22kt,
                    "rate_24kt": rate.rate_24kt,
                    "rate_silver": rate.rate_silver,
                    "arihant_rate_18kt": rate.arihant_rate_18kt,
                    "arihant_rate_22kt": rate.arihant_rate_22kt,
                    "arihant_rate_24kt": rate.arihant_rate_24kt,
                    "arihant_rate_silver": rate.arihant_rate_silver,
                    "is_manual_override": rate.is_manual_override,
                    "updated_by": rate.updated_by,
                },
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_booking(request):
    data = json.loads(request.body)
    quantity_grams = int(data.get("quantity_grams"))
    customer_name = data.get("customer_name", "Shankar Rao")
    rust_url = os.getenv("RUST_BACKEND_URL", "http://localhost:8080")
    response = requests.get(f"{rust_url}/live_rate")
    rate_999 = response.json()["rate_999_per_10gram"]

    with transaction.atomic():
        inventory = MetalInventory.objects.select_for_update().get(metal="gold_999")
        if inventory.free_grams < quantity_grams:
            return JsonResponse({"error": "Insufficient inventory"}, status=409)

        inventory.reserved_grams += quantity_grams
        inventory.save()

        lock = BookingLock.objects.create(
            rate_999=rate_999,
            quantity_grams=quantity_grams,
            customer_name=customer_name,
            expires_at=timezone.now() + timedelta(seconds=60),
        )

        return JsonResponse(
            {
                "lock_id": lock.id,
                "rate_999": lock.rate_999,
                "quantity_grams": lock.quantity_grams,
                "total_value": lock.total_value,
                "expires_at": str(lock.expires_at),
            }
        )


@csrf_exempt
@require_http_methods(["POST"])
def confirm_booking(request, lock_id):
    with transaction.atomic():
        try:
            lock = BookingLock.objects.select_for_update().get(id=lock_id, status='pending')
        except BookingLock.DoesNotExist:
            return JsonResponse({'error': 'Booking lock not found or already processed'}, status=404)

        if lock.is_expired():
            lock.status = 'expired'
            lock.save()
            inventory = MetalInventory.objects.get(metal='gold_999')
            inventory.reserved_grams -= lock.quantity_grams
            inventory.save()
            return JsonResponse({'error': 'Booking lock has expired'}, status=410)

        inventory = MetalInventory.objects.select_for_update().get(metal='gold_999')
        inventory.reserved_grams -= lock.quantity_grams
        inventory.available_grams -= lock.quantity_grams
        inventory.save()

        lock.status = 'confirmed'
        lock.save()

        return JsonResponse({
            'lock_id': lock.id,
            'rate_999': lock.rate_999,
            'quantity_grams': lock.quantity_grams,
            'total_value': lock.total_value,
            'status': lock.status,
        })
