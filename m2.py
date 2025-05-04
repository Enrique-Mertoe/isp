#!/usr/bin/env python
"""
Standalone script to test email functionality without running Django server.
Run this from your project's root directory.
"""
import os
import sys
import django

from communication import Mail


def test_password_reset_email():
    """Test sending a password reset email."""
    print("Testing password reset email...")

    response = Mail.send_password_reset(
        to_email="abutimartin778@gmail.com",  # Replace with your email
        reset_link="https://yoursite.com/reset-password/test-token/",
        user_name="Test User"
    )

    print(f"Status Code: {response['status_code']}")
    if response['status_code'] == 202:
        print("Email sent successfully!")
    else:
        print(f"Error sending email: {response['body']}")


def test_verification_email():
    """Test sending a verification email."""
    print("Testing verification email...")

    response = Mail.send_verification_email(
        to_email="abutimartin778@gmail.com",  # Replace with your email
        verification_link="https://yoursite.com/verify/test-token/",
        user_name="Test User"
    )

    print(f"Status Code: {response['status_code']}")
    if response['status_code'] == 202:
        print("Email sent successfully!")
    else:
        print(f"Error sending email: {response['body']}")


def test_custom_email():
    """Test sending a custom email with template."""
    print("Testing custom email...")

    response = Mail.send_custom_email(
        to_email="abutimartin778@gmail.com",  # Replace with your email
        subject="Test Custom Email",
        template_name="notification",  # Use an existing template
        context={
            "message": "This is a test message from the standalone script.",
            "user_name": "Test User"
        }
    )

    print(f"Status Code: {response['status_code']}")
    if response['status_code'] == 202:
        print("Email sent successfully!")
    else:
        print(f"Error sending email: {response['body']}")


test_password_reset_email()
test_verification_email()
test_custom_email()
if __name__ == "__main__":
    # Check if there's a command line argument specifying which test to run
    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        if test_name == "reset":
            test_password_reset_email()
        elif test_name == "verify":
            test_verification_email()
        elif test_name == "custom":
            test_custom_email()
        else:
            print(f"Unknown test: {test_name}")
            print("Available tests: reset, verify, custom")
    else:
        # Run all tests
        test_password_reset_email()
        test_verification_email()
        test_custom_email()
