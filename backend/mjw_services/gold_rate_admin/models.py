from django.db import models

# Create your models here.

class Rate(models.Model):
    date = models.DateField()
    rate_22kt = models.FloatField()
    rate_24kt = models.FloatField()
    arihant_rate_22kt = models.FloatField(default=6850)
    arhiant_rate_24kt = models.FloatField(default=7500)

    def __str__(self):
        return str(self.date) + " - " + str(self.rate_22kt) + " - " + str(self.rate_24kt) + " - " + str(self.arihant_rate_22kt) + " - " + str(self.arhiant_rate_24kt)