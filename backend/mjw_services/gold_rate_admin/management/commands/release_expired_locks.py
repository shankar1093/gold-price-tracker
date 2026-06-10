from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from gold_rate_admin.models import BookingLock, MetalInventory


class Command(BaseCommand):
    help = 'Release inventory reserved by expired booking locks'

    def handle(self, *args, **options):
        now = timezone.now()

        with transaction.atomic():
            expired_locks = (
                BookingLock.objects
                .select_for_update(skip_locked=True)
                .filter(status='pending', expires_at__lt=now)
            )
            grams_to_release = sum(expired_locks.values_list('quantity_grams', flat=True))
            count = len(expired_locks)

            if count == 0:
                self.stdout.write('No expired locks to release.')
                return

            expired_locks.update(status='expired')

            inventory = MetalInventory.objects.select_for_update().get(metal='gold_999')
            inventory.reserved_grams -= grams_to_release
            inventory.save()

        self.stdout.write(self.style.SUCCESS(f'Released {count} expired lock(s).'))
