# Generated by Django 5.2 on 2025-04-15 05:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0015_alter_ispprovider_user'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='package',
            name='isp',
        ),
    ]
