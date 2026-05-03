import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import json

# Load the SMTP config 
with open('./config.json') as f:
    config = json.load(f)

def send_email_otp(recipient, data):
    try:
        # SMTP settings from config
        smtp_config = config["EMAIL"]["SMTP"]
        host = smtp_config["host"]
        port = smtp_config["port"]
        user = smtp_config["auth"]["user"]
        password = smtp_config["auth"]["pass"]
        
        # Prepare the email
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "GeoMedia app - OTP"
        msg["From"] = f"GeoMedia app <{user}>"
        msg["To"] = recipient
        
        # Load the HTML template
        with open("./email_body.html", "r", encoding="utf-8") as f:
            html_body = f.read()
        
        # Replace placeholders
        html_body = html_body.replace("$USERNAME", str(data.get("USERNAME", "")))
        html_body = html_body.replace("$OTP", str(data.get("OTP", "")))

        # Attach HTML content
        msg.attach(MIMEText(html_body, "html"))

        # Establish connection with the Gmail SMTP server using STARTTLS
        with smtplib.SMTP(host, port) as server:
            # Upgrade connection to secure using STARTTLS
            server.starttls(context=ssl.create_default_context())
            server.login(user, password)  # Login using the provided credentials
            server.sendmail(user, recipient, msg.as_string())  # Send the email

        return [True, "Email sent successfully"]

    except Exception as error:
        print(f"Error: {error}")
        return [False, str(error)]