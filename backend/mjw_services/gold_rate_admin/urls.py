from django.urls import path
from .views import get_metal_rate_by_date_range, get_metal_rates

urlpatterns = [
    path('metal-rate/', get_metal_rates, name='get_metal_rates'),
    path('metal-rate/<str:start_date>/<str:end_date>/', get_metal_rate_by_date_range, name='get_metal_rate_by_date_range'),
]