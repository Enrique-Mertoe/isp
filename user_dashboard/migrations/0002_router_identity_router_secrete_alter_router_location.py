# Generated by Django 5.2 on 2025-04-22 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='router',
            name='identity',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='router',
            name='secrete',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='router',
            name='location',
            field=models.CharField(max_length=255, null=True),
        ),
    ]
