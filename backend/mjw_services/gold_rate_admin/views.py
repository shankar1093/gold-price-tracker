from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from .models import Rate

def index(request):
    return HttpResponse("Hello, world. You're at the mjw_services index.")

def get_gold_rate(request):
    today = timezone.now().date()
    try:
        # First, try to get today's rate
        rate = Rate.objects.get(date=today)
    except Rate.DoesNotExist:
        # If today's rate doesn't exist, get the most recent rate
        rate = Rate.objects.order_by('-date').first()
        
        if not rate:
            return JsonResponse({'error': 'No rate available'}, status=404)

    return JsonResponse({
        'date': rate.date,
        'rate_22kt': rate.rate_22kt,
        'rate_24kt': rate.rate_24kt,
        'arihant_rate_22kt': rate.arihant_rate_22kt,
        'arihant_rate_24kt': rate.arihant_rate_24kt,
    })
