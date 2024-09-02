import os
import sys
import django
import requests
import math
from django.utils import timezone

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set up Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mjw_services.settings")
django.setup()

# Now you can import your models
from gold_rate_admin.models import Rate

def price_adjustment(price):
    return int(round(price / 5) * 5)

def update_gold_rate():
    backendUrl = "http://rust-backend:8080"  # Adjust this as needed
    api_url = f"{backendUrl}/gold_price"

    try:
        response = requests.get(api_url)
        data = response.json()
        gold995WithGst = next(
            (
                item
                for item in data
                if "gold 995 with gst" in item.get("description", "").lower()
            ),
            None,
        )

        if gold995WithGst is None:
            raise ValueError("Couldn't find matching gold price data")

        gold24ktPrice = (
            float(gold995WithGst["ask"]) / 10
            if gold995WithGst and gold995WithGst["ask"].isdigit()
            else 0
        )/1.03

        gold22ktPrice = (920 / 995) * gold24ktPrice if gold24ktPrice != 0 else 0

        adjustedGold22ktPrice = price_adjustment(gold22ktPrice * 1.013)  # Increased by 1.3%
        adjustedGold24ktPrice = price_adjustment(gold24ktPrice * 1.013)  # Increased by 1.3%

        today = timezone.now().date()  # Get the current date

        Rate.objects.update_or_create(
            date=today,  # Use the date object directly
            defaults={
                "rate_22kt": math.floor(adjustedGold22ktPrice),
                "rate_24kt": math.floor(adjustedGold24ktPrice),
                "arihant_rate_22kt": math.floor(gold22ktPrice),
                "arihant_rate_24kt": math.floor(gold24ktPrice),
            },
        )

        print("Successfully updated gold rate")
    except Exception as e:
        print(f"Error updating gold rate: {str(e)}")

if __name__ == "__main__":
    update_gold_rate()


