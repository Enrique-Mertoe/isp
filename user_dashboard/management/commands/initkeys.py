import os
import random
import string
from django.core.management.base import BaseCommand
from cryptography.fernet import Fernet


class Command(BaseCommand):
    help = 'Initializes or updates missing keys in .env file'

    def generate_random_key(self, length=50):
        """Generate a random key of specified length."""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

    def generate_fernet_key(self):
        """Generate a Fernet key."""
        return Fernet.generate_key().decode()

    def update_key_in_env(self, key, value, env_content):
        """Update or add the key-value pair in the .env file with quotes around values."""
        # Ensure the value is wrapped in quotes
        value = f'"{value}"'

        # Check if key already exists, if so, replace its value
        if key in env_content:
            env_content = env_content.replace(f"{key}={self.get_key_value(key, env_content)}", f"{key}={value}")
        else:
            env_content += f'\n{key}={value}\n'
        return env_content

    def get_key_value(self, key, env_content):
        """Extract the value of a key from the .env content."""
        for line in env_content.splitlines():
            if line.startswith(key):
                return line.split('=', 1)[1].strip().strip('"')  # Remove quotes if present
        return None

    def save_updated_env(self, env_content):
        """Save the updated .env content back to the file."""
        with open('.env', 'w') as f:
            f.write(env_content)

    def handle(self, *args, **kwargs):
        """Command handler."""
        env_file = '.env'

        # Check if the .env file exists
        if not os.path.exists(env_file):
            self.stdout.write(self.style.ERROR('.env file not found'))
            return

        with open(env_file, 'r') as f:
            env_content = f.read()

        # Check if FERNET_KEY exists or needs to be updated
        fernet_key = self.get_key_value('FERNET_KEY', env_content)
        if not fernet_key:
            fernet_key = self.generate_fernet_key()
            self.stdout.write(self.style.SUCCESS('Generated a new FERNET_KEY'))
        else:
            fernet_key = self.generate_fernet_key()  # Always regenerate the key
            self.stdout.write(self.style.SUCCESS('Updated FERNET_KEY'))

        # Check if DJANGO_SECRET_KEY exists or needs to be updated
        django_secret_key = self.get_key_value('DJANGO_SECRET_KEY', env_content)
        if not django_secret_key:
            django_secret_key = self.generate_random_key(50)
            self.stdout.write(self.style.SUCCESS('Generated a new DJANGO_SECRET_KEY'))
        else:
            django_secret_key = self.generate_random_key(50)  # Always regenerate the key
            self.stdout.write(self.style.SUCCESS('Updated DJANGO_SECRET_KEY'))

        # Update or add the keys with quotes
        env_content = self.update_key_in_env('FERNET_KEY', fernet_key, env_content)
        env_content = self.update_key_in_env('DJANGO_SECRET_KEY', django_secret_key, env_content)

        # Save the updated .env file
        self.save_updated_env(env_content)
        self.stdout.write(self.style.SUCCESS('Keys have been updated in the .env file'))
