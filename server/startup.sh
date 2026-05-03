
# start docker container (mssql)
docker start mssql

sleep 5 # 5sec

cd ~/GeoMedia/server
python3 -m venv venv
source venv/bin/activate
pip install pydantic fastapi uvicorn pymssql cryptography
python3 server

