from django.contrib import admin
from django.db import transaction
from .models import Rate, Photo, BookingLock, MetalInventory


@admin.action(description='Mark selected bookings as delivered')
def mark_delivered(modeladmin, request, queryset):
    with transaction.atomic():
        confirmed = queryset.filter(status='confirmed')
        total = sum(confirmed.values_list('quantity_grams', flat=True))
        if total > 0:
            inventory = MetalInventory.objects.select_for_update().get(metal='gold_999')
            inventory.committed_grams -= total
            inventory.available_grams -= total
            inventory.save()
        confirmed.update(status='delivered')


@admin.action(description='Cancel selected confirmed bookings')
def cancel_confirmed(modeladmin, request, queryset):
    with transaction.atomic():
        confirmed = queryset.filter(status='confirmed')
        total = sum(confirmed.values_list('quantity_grams', flat=True))
        if total > 0:
            inventory = MetalInventory.objects.select_for_update().get(metal='gold_999')
            inventory.committed_grams -= total
            inventory.save()
        confirmed.update(status='cancelled')


@admin.register(BookingLock)
class BookingLockAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'quantity_grams', 'rate_999', 'total_value', 'status', 'created_at', 'expires_at']
    list_filter = ['status']
    ordering = ['-created_at']
    actions = [mark_delivered, cancel_confirmed]
    readonly_fields = ['rate_999', 'quantity_grams', 'customer_name', 'created_at', 'expires_at', 'total_value']


@admin.register(MetalInventory)
class MetalInventoryAdmin(admin.ModelAdmin):
    list_display = ['metal', 'available_grams', 'reserved_grams', 'committed_grams', 'free_grams']


@admin.register(Rate)
class RateAdmin(admin.ModelAdmin):
    list_display = ['date', 'rate_22kt', 'rate_24kt', 'rate_24kt_9999', 'rate_18kt', 'rate_silver', 'is_manual_override', 'updated_at']
    list_filter = ['is_manual_override']
    ordering = ['-date']


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ['instagram_id', 'instagram_username', 'media_type', 'is_active', 'instagram_timestamp']
    list_filter = ['is_active', 'instagram_username']
    ordering = ['-instagram_timestamp']
