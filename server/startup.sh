#!/bin/bash
##
# root@GeoMedia-4GBUbuntu:~# sudo nano /etc/systemd/system/geomedia.service 
# sudo systemctl daemon-reload
# sudo systemctl start geomedia.service
# sudo systemctl status geomedia.service
#--------------
# # [Unit]
# # Description=GeoMedia Server backend on https port 9911
# # After=network.target

# # [Service]
# # Type=simple
# # ExecStart=/root/GeoMedia/server/startup.sh
# # WorkingDirectory=/root/GeoMedia/server
# # Restart=always
# # User=root
# # Environment=PYTHONUNBUFFERED=1

# # [Install]
# # WantedBy=multi-user.target



# start docker container (mssql)
docker start mssql

sleep 5 # wait


cd /root/GeoMedia/server
python3 -m venv venv
. venv/bin/activate  # Use `.` instead of `source`

pip install pydantic fastapi uvicorn pymssql cryptography

python3 server.py