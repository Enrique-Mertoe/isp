# Generated by Django 5.2 on 2025-05-04 12:17

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_dashboard', '0005_client_address'),
    ]

    operations = [
        migrations.CreateModel(
            name='SystemUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('address', models.TextField()),
                ('phone', models.CharField(max_length=50)),
                ('performance', models.IntegerField()),
                ('email', models.EmailField(max_length=254)),
                ('role', models.CharField(choices=[('manager', 'Manager'), ('technician', 'Technician'), ('admin', 'Admin'), ('support', 'Support')], default='technician', max_length=50)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='isp_account', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AlterField(
            model_name='router',
            name='isp',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='routers', to='user_dashboard.systemuser'),
        ),
        migrations.AlterField(
            model_name='user',
            name='isp',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='user_dashboard.systemuser'),
        ),
        migrations.DeleteModel(
            name='ISPProvider',
        ),
    ]
