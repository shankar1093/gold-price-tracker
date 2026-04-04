from django.urls import path
from .views import (
    get_metal_rate_by_date_range,
    get_metal_rates,
    admin_login,
    admin_logout,
    admin_status,
    manual_rate_update,
    get_photos,
)

urlpatterns = [
    path('metal-rate/', get_metal_rates, name='get_metal_rates'),
    path('metal-rate/<str:start_date>/<str:end_date>/', get_metal_rate_by_date_range, name='get_metal_rate_by_date_range'),
    path('admin/login/', admin_login, name='admin_login'),
    path('admin/logout/', admin_logout, name='admin_logout'),
    path('admin/status/', admin_status, name='admin_status'),
    path('admin/manual-rate/', manual_rate_update, name='manual_rate_update'),
    path('photos/', get_photos, name='get_photos'),
]