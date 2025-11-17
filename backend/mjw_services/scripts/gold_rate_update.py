import os
import sys
import django
import requests
import math
from django.utils import timezone
import re

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
        return re.sub(r"\s+", " ", s.strip().lower())

    try:
        response = requests.get(api_url)
        data = response.json()



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


        if gold999WithGst is None:
            raise ValueError("Couldn't find matching gold price data")

        gold24ktPrice = (
            float(gold999WithGst["ask"]) / 10
            if gold999WithGst and gold999WithGst["ask"].isdigit()
            else 0
        ) / 1.03

        gold22ktPrice = (920 / 999) * gold24ktPrice if gold24ktPrice != 0 else 0
        gold18ktPrice = (750 / 999) * gold24ktPrice if gold24ktPrice != 0 else 0

        adjustedGold18ktPrice = price_adjustment(gold18ktPrice * 1.008)
        adjustedGold22ktPrice = price_adjustment(
            gold22ktPrice * 1.008
        )  # Increased by 1.3%
        adjustedGold24ktPrice = price_adjustment(
            gold24ktPrice * 1.03
        )  # Increased by 3% starting 22/10 on account of high gold price. 

        # Remove the today = timezone.now().date() line from here

        metal_prices["rate_18kt"] = math.floor(adjustedGold18ktPrice)
        metal_prices["rate_22kt"] = math.floor(adjustedGold22ktPrice)
        metal_prices["rate_24kt"] = math.floor(adjustedGold24ktPrice)
        metal_prices["arihant_rate_22kt"] = math.floor(gold22ktPrice)
        metal_prices["arihant_rate_24kt"] = math.floor(gold24ktPrice)
        metal_prices["arihant_rate_18kt"] = math.floor(gold18ktPrice)

        print("Successfully updated gold rate")
    except Exception as e:
        print(f"Error updating gold rate: {str(e)}")

    try:
        response = requests.get(silver_api_url)
        data = response.json()
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


        silver999price = (
            float(silver["ask"]) / 10 if silver and silver["ask"].isdigit() else 0
        ) / 1.03
        metal_prices["arihant_silver"] = math.floor(silver999price)
        metal_prices["rate_silver"] = math.floor(silver999price) * 1.12/100 #keep silver price per gram
        print("Successfully updated silver rate")
    except Exception as e:
        print(f"Error updating gold rate: {str(e)}")

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
