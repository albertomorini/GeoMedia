import json
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os


# ----------------------------------------------------
# LOAD CONFIG
with open("./config.json", "r", encoding="utf-8") as f:
    config = json.load(f)


SMTP_CONFIG = config["EMAIL"]["SMTP"]


# ----------------------------------------------------
# SEND OTP EMAIL
def send_email_otp(recipient, data):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "GeoMedia app - OTP"
        msg["From"] = f"{SMTP_CONFIG.get('auth', {}).get('user', 'GeoMedia app')}"

        msg["To"] = recipient

        # ------------------------------------------------
        # LOAD HTML TEMPLATE
        with open("./email_body.html", "r", encoding="utf-8") as f:
            html_body = f.read()

        html_body = html_body.replace("$USERNAME", str(data.get("USERNAME", "")))
        html_body = html_body.replace("$OTP", str(data.get("OTP", "")))

        msg.attach(MIMEText(html_body, "html"))

        # ------------------------------------------------
        # SMTP CONNECTION
        host = SMTP_CONFIG["host"]
        port = SMTP_CONFIG.get("port", 587)

        context = ssl.create_default_context()

        server = smtplib.SMTP(host, port)
        server.starttls(context=context)

        # login if credentials exist
        if "auth" in SMTP_CONFIG:
            server.login(
                SMTP_CONFIG["auth"]["user"],
                SMTP_CONFIG["auth"]["pass"]
            )

        response = server.sendmail(
            SMTP_CONFIG["auth"]["user"],
            recipient,
            msg.as_string()
        )

        server.quit()

        print(response)

        return [True, "Email sent successfully"]

    except Exception as error:
        return [False, str(error)]