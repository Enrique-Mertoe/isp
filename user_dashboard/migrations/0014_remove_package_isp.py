from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('user_dashboard', '0013_rename_company_ispprovider_remove_detail_dob_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='package',
            name='isp',
        ),
    ] 