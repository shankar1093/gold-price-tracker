from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from .models import Rate

def index(request):
    return HttpResponse("Hello, world. You're at the mjw_services index.")

def get_gold_rate(request):
    today = timezone.now().strftime('%Y-%m-%d')
    try:
        rate = Rate.objects.get(date=today)
        return JsonResponse({
            'date': rate.date,
            'rate_22kt': rate.rate_22kt,
            'rate_24kt': rate.rate_24kt,
            'arihant_rate_22kt': rate.arihant_rate_22kt,
            'arihant_rate_24kt': rate.arihant_rate_24kt,
        })
    except Rate.DoesNotExist:
        return JsonResponse({'error': 'No rate available for today'}, status=404)
