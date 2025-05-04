from typing import Dict, List, Optional, Union, Any
import os

from decouple import config
from django.template.loader import render_to_string
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, Attachment, FileContent, FileName, FileType, Disposition


class MailService:
    """
    A robust mail service using SendGrid for sending various types of emails
    with template rendering capabilities.
    """

    # Default sender domains - you might want to set these up in cPanel
    DEFAULT_DOMAINS = {
        'info': 'info@yourdomain.com',
        'support': 'support@yourdomain.com',
        'noreply': 'noreply@yourdomain.com',
        'admin': 'admin@yourdomain.com',
    }

    # Default templates directory
    TEMPLATES_DIR = 'emails/'

    def __init__(self, api_key=None):
        """
        Initialize the mail service with SendGrid API key.

        Args:
            api_key (str, optional): SendGrid API key. Defaults to settings.SENDGRID_API_KEY.
        """
        self.api_key = api_key or os.environ.get('SENDGRID_API_KEY') or config("SENDGRID_API_KEY")
        if not self.api_key:
            raise ValueError(
                "SendGrid API key is required. Set it as SENDGRID_API_KEY in settings or pass it directly.")

        self.sg_client = SendGridAPIClient(self.api_key)

    def _get_sender_email(self, sender_type: str = 'info') -> str:
        """
        Get sender email based on type.

        Args:
            sender_type (str): The type of sender (info, support, etc.)

        Returns:
            str: Full sender email address
        """
        if '@' in sender_type:
            # If full email is provided, use it
            return sender_type

        # Get from DEFAULT_DOMAINS or settings
        domains = getattr(settings, 'EMAIL_DOMAINS', self.DEFAULT_DOMAINS)
        email = domains.get(sender_type)

        if not email:
            # Fallback to default info email
            email = domains.get('info', 'info@yourdomain.com')

        return email

    def render_template(self, template_name: str, context: Dict[str, Any] = None) -> str:
        """
        Render an email template with given context.

        Args:
            template_name (str): Template name (without .html extension)
            context (dict, optional): Context data for the template. Defaults to {}.

        Returns:
            str: Rendered HTML content
        """
        context = context or {}
        template_path = f"{self.TEMPLATES_DIR}{template_name}.html"

        # Render template
        return render_to_string(template_path, context)

    def send_email(
            self,
            to_email: Union[str, List[str]],
            subject: str,
            html_content: str = None,
            text_content: str = None,
            template_name: str = None,
            template_context: Dict[str, Any] = None,
            from_email: str = 'info',
            attachments: List[Dict[str, Any]] = None,
            categories: List[str] = None,
            reply_to: str = None,
            cc: Union[str, List[str]] = None,
            bcc: Union[str, List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Send an email using SendGrid.

        Args:
            to_email (str or list): Recipient email address(es)
            subject (str): Email subject
            html_content (str, optional): HTML content of the email
            text_content (str, optional): Plain text content of the email
            template_name (str, optional): Name of template to render
            template_context (dict, optional): Context for template rendering
            from_email (str, optional): Sender email or sender type. Defaults to 'info'.
            attachments (list, optional): List of attachment dicts
            categories (list, optional): List of categories for tracking
            reply_to (str, optional): Reply-to email address
            cc (str or list, optional): CC recipient(s)
            bcc (str or list, optional): BCC recipient(s)

        Returns:
            dict: Response from SendGrid
        """
        # Convert single email to list
        if isinstance(to_email, str):
            to_email = [to_email]

        # Get sender email
        sender = self._get_sender_email(from_email)

        # If template is provided, render it
        if template_name and not html_content:
            html_content = self.render_template(template_name, template_context)


        # Fall back to text content if no HTML
        if not html_content and not text_content:
            raise ValueError("Either html_content, text_content, or template_name must be provided")

        # Default to HTML content converted to plain text if text_content not provided
        if html_content and not text_content:
            # Basic HTML to text conversion - you might want a better solution
            text_content = html_content.replace('<br>', '\n').replace('</p>', '\n\n')
            # Remove HTML tags (very basic)
            import re
            text_content = re.sub('<[^<]+?>', '', text_content)

        # Create message
        # message = Mail(
        #     from_email=Email(sender),
        #     subject=subject,
        # )
        message = Mail(
            from_email='info@lomtechnology.com',
            to_emails='abutimartin778@gmail.com',
            subject='Sending with Twilio SendGrid is Fun',
            html_content=html_content)

        # Add recipients
        # for email in to_email:
        #     message.add_to(To(email))

        # # Add content
        # if html_content:
        #     message.add_content(Content("text/html", html_content))
        # if text_content:
        #     message.add_content(Content("text/plain", text_content))

        # Add CC recipients
        # if cc:
        #     if isinstance(cc, str):
        #         cc = [cc]
        #     for email in cc:
        #         message.add_cc(To(email))
        #
        # # Add BCC recipients
        # if bcc:
        #     if isinstance(bcc, str):
        #         bcc = [bcc]
        #     for email in bcc:
        #         message.add_bcc(To(email))
        #
        # # Add reply-to
        # if reply_to:
        #     message.reply_to = Email(reply_to)
        #
        # # Add categories for tracking
        # if categories:
        #     for category in categories:
        #         message.add_category(category)
        #
        # # Add attachments
        # if attachments:
        #     for attachment_data in attachments:
        #         attachment = Attachment()
        #         attachment.file_content = FileContent(attachment_data['content'])
        #         attachment.file_name = FileName(attachment_data['filename'])
        #         attachment.file_type = FileType(attachment_data['mimetype'])
        #         attachment.disposition = Disposition('attachment')
        #         message.add_attachment(attachment)

        # Send email
        response = self.sg_client.send(message)

        return {
            'status_code': response.status_code,
            'body': response.body,
            'headers': response.headers
        }


