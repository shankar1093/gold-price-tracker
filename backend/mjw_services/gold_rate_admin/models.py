from django.db import models


class Photo(models.Model):
    instagram_id = models.CharField(max_length=100, unique=True)
    filename = models.CharField(max_length=255)
    media_type = models.CharField(max_length=50)  # IMAGE or CAROUSEL_ALBUM
    instagram_url = models.URLField(
        max_length=2000
    )  # original Instagram CDN URL (provenance)
    instagram_permalink = models.URLField(max_length=500, blank=True, null=True)
    instagram_timestamp = (
        models.DateTimeField()
    )  # when the photo was posted to Instagram
    instagram_username = models.CharField(max_length=100)  # source account (provenance)
    downloaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-instagram_timestamp"]

    def __str__(self):
        return f"{self.instagram_id} ({self.instagram_username}) - {self.filename}"


class Rate(models.Model):
    date = models.DateField(unique=True)
    rate_18kt = models.IntegerField(default=7500)
    rate_22kt = models.IntegerField()
    rate_24kt = models.IntegerField()
    rate_silver = models.IntegerField(default=106)
    arihant_rate_22kt = models.IntegerField(default=6850)
    arihant_rate_24kt = models.IntegerField(default=7500)
    arihant_rate_18kt = models.IntegerField(default=7500)
    arihant_rate_silver = models.IntegerField(default=106)
    is_manual_override = models.BooleanField(default=False)
    updated_by = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.date} - 22kt: {self.rate_22kt}, 24kt: {self.rate_24kt}, 18kt: {self.rate_18kt},silver: {self.rate_silver},Arihant 18kt: {self.arihant_rate_24kt}, Arihant 22kt: {self.arihant_rate_22kt}, Arihant 24kt: {self.arihant_rate_24kt},Arihant Silver: {self.arihant_rate_silver},"

    class Meta:
        ordering = ["-date"]

class MetalInventory(models.Model):
    metal = models.CharField(max_length=20)  # "gold_999"
    available_grams = models.IntegerField()   # what you're willing to sell today
    reserved_grams = models.IntegerField(default=0)  # locked but not confirmed yet
    
    @property
    def free_grams(self):
        return self.available_grams - self.reserved_grams

class BookingLock(models.Model):
    rate_999 = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    status = models.CharField(
        max_length=20, default="pending"
    )  # pending, confirmed, expired
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    quantity_grams = models.IntegerField()

    def save(self, *args, **kwargs):
        if self.quantity_grams % 100 != 0:
            raise ValueError("Quantity must be a multiple of 100 grams")
        super().save(*args, **kwargs)

    @property
    def total_value(self):
        return self.rate_999 * self.quantity_grams

    def is_expired(self):
        from django.utils import timezone

        return timezone.now() > self.expires_at
