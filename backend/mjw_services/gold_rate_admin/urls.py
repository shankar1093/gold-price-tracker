from django.urls import path
from .views import get_gold_rate

urlpatterns = [
    path('gold-rate/', get_gold_rate, name='get_gold_rate'),
]