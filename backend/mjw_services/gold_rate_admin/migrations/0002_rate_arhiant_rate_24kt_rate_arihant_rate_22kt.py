# Generated by Django 5.0.7 on 2024-07-14 18:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gold_rate_admin', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='rate',
            name='arhiant_rate_24kt',
            field=models.FloatField(default=7500),
        ),
        migrations.AddField(
            model_name='rate',
            name='arihant_rate_22kt',
            field=models.FloatField(default=6850),
        ),
    ]
