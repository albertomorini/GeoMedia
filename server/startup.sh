#!/bin/bash
##
# root@GeoMedia-4GBUbuntu:~# sudo nano /etc/systemd/system/geomedia.service 
# # [Unit]
# # Description=GeoMedia Server backend on https port 9911
# # After=network.target

# # [Service]
# # Type=simple
# # ExecStart=/root/geomedia/server/startup.sh
# # WorkingDirectory=/root/geomedia/server
# # Restart=always
# # User=root
# # Environment=PYTHONUNBUFFERED=1

# # [Install]
# # WantedBy=multi-user.target



# start docker container (mssql)
docker start mssql

sleep 5 # 5sec

cd ~/GeoMedia/server
python3 -m venv venv
source venv/bin/activate
pip install pydantic fastapi uvicorn pymssql cryptography
python3 server

