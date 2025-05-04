from typing import Dict, Any

from django.conf import settings

from communication.mail import MailService


class Mail:
    """
    Facade for MailService providing easy access to common email types.
    """

    # Initialize the mail service
    _service: "MailService" = None

    @classmethod
    def get_service(cls):
        """Get or create the mail service instance."""
        if cls._service is None:
            cls._service = MailService()
        return cls._service

    @classmethod
    def send_password_reset(cls, to_email: str, reset_link: str, user_name: str = None, **kwargs):
        """
        Send password reset email.

        Args:
            to_email (str): Recipient email
            reset_link (str): Password reset link
            user_name (str, optional): User's name
            **kwargs: Additional parameters to pass to send_email
        """
        service = cls.get_service()

        # Default context
        context = {
            'reset_link': reset_link,
            'user_name': user_name or to_email.split('@')[0],
        }

        # Update with any additional context
        if 'template_context' in kwargs:
            context.update(kwargs.pop('template_context'))


        return service.send_email(
            to_email=to_email,
            subject="Reset Your Password",
            template_name="password_reset",
            template_context=context,
            from_email=kwargs.pop('from_email', 'support'),
            categories=['password_reset'],
            **kwargs
        )

    @classmethod
    def send_verification_email(cls, to_email: str, verification_link: str, user_name: str = None, **kwargs):
        """
        Send email verification.

        Args:
            to_email (str): Recipient email
            verification_link (str): Email verification link
            user_name (str, optional): User's name
            **kwargs: Additional parameters to pass to send_email
        """
        service = cls.get_service()

        # Default context
        context = {
            'verification_link': verification_link,
            'user_name': user_name or to_email.split('@')[0],
        }

        # Update with any additional context
        if 'template_context' in kwargs:
            context.update(kwargs.pop('template_context'))

        return service.send_email(
            to_email=to_email,
            subject="Verify Your Email Address",
            template_name="email_verification",
            template_context=context,
            from_email=kwargs.pop('from_email', 'noreply'),
            categories=['email_verification'],
            **kwargs
        )

    @classmethod
    def send_welcome_email(cls, to_email: str, user_name: str = None, **kwargs):
        """
        Send welcome email to new users.

        Args:
            to_email (str): Recipient email
            user_name (str, optional): User's name
            **kwargs: Additional parameters to pass to send_email
        """
        service = cls.get_service()

        # Default context
        context = {
            'user_name': user_name or to_email.split('@')[0],
        }

        # Update with any additional context
        if 'template_context' in kwargs:
            context.update(kwargs.pop('template_context'))

        return service.send_email(
            to_email=to_email,
            subject="Welcome to Our Platform!",
            template_name="welcome_email",
            template_context=context,
            from_email=kwargs.pop('from_email', 'info'),
            categories=['welcome'],
            **kwargs
        )

    @classmethod
    def send_notification(cls, to_email: str, subject: str, message: str, **kwargs):
        """
        Send a general notification email.

        Args:
            to_email (str): Recipient email
            subject (str): Email subject
            message (str): Message content
            **kwargs: Additional parameters to pass to send_email
        """
        service = cls.get_service()

        # Default context
        context = {
            'message': message,
            'subject': subject,
        }

        # Update with any additional context
        if 'template_context' in kwargs:
            context.update(kwargs.pop('template_context'))

        return service.send_email(
            to_email=to_email,
            subject=subject,
            template_name="notification",
            template_context=context,
            from_email=kwargs.pop('from_email', 'info'),
            categories=['notification'],
            **kwargs
        )

    @classmethod
    def send_custom_email(cls, to_email: str, subject: str, template_name: str, context: Dict[str, Any], **kwargs):
        """
        Send a custom email using specified template.

        Args:
            to_email (str): Recipient email
            subject (str): Email subject
            template_name (str): Template name to use
            context (dict): Context data for template
            **kwargs: Additional parameters to pass to send_email
        """
        service = cls.get_service()

        return service.send_email(
            to_email=to_email,
            subject=subject,
            template_name=template_name,
            template_context=context,
            **kwargs
        )

    @classmethod
    def send_raw_email(cls, **kwargs):
        """
        Send a raw email with full control over parameters.

        Args:
            **kwargs: All parameters to pass to send_email
        """
        service = cls.get_service()
        return service.send_email(**kwargs)
