# Generated by Django 5.2 on 2025-04-13 02:37

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0004_alter_package_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='created_at',
            field=models.DateField(default=datetime.date.today),
        ),
    ]
