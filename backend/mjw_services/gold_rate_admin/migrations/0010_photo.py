from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gold_rate_admin', '0009_rate_is_manual_override_updated_by_updated_at'),
    ]

    operations = [
        migrations.CreateModel(
            name='Photo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('instagram_id', models.CharField(max_length=100, unique=True)),
                ('filename', models.CharField(max_length=255)),
                ('media_type', models.CharField(max_length=50)),
                ('instagram_url', models.URLField(max_length=2000)),
                ('instagram_permalink', models.URLField(blank=True, max_length=500, null=True)),
                ('instagram_timestamp', models.DateTimeField()),
                ('instagram_username', models.CharField(max_length=100)),
                ('downloaded_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['-instagram_timestamp'],
            },
        ),
    ]
