from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from gold_rate_admin.models import BookingLock, MetalInventory


class Command(BaseCommand):
    help = 'Release inventory reserved by expired booking locks'

    def handle(self, *args, **options):
        now = timezone.now()
        expired_locks = BookingLock.objects.filter(status='pending', expires_at__lt=now)
        count = expired_locks.count()

        if count == 0:
            self.stdout.write('No expired locks to release.')
            return

        with transaction.atomic():
            inventory = MetalInventory.objects.select_for_update().get(metal='gold_999')
            for lock in expired_locks:
                inventory.reserved_grams -= lock.quantity_grams
                lock.status = 'expired'
                lock.save()
            inventory.save()

        self.stdout.write(self.style.SUCCESS(f'Released {count} expired lock(s).'))
