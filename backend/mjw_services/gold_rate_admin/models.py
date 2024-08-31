from django.db import models

# Create your models here.

class Rate(models.Model):
    date = models.DateField(unique=True)
    rate_22kt = models.IntegerField()
    rate_24kt = models.IntegerField()
    arihant_rate_22kt = models.IntegerField(default=6850)
    arihant_rate_24kt = models.IntegerField(default=7500)

    def __str__(self):
        return f"{self.date} - 22kt: {self.rate_22kt}, 24kt: {self.rate_24kt}, Arihant 22kt: {self.arihant_rate_22kt}, Arihant 24kt: {self.arihant_rate_24kt}"

    class Meta:
        ordering = ['-date']