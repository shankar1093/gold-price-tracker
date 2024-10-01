from django.urls import path
from .views import get_gold_rate, get_gold_rate_by_date_range

urlpatterns = [
    path('gold-rate/', get_gold_rate, name='get_gold_rate'),
    path('gold-rate/<str:start_date>/<str:end_date>/', get_gold_rate_by_date_range, name='get_gold_rate_by_date_range'),
]