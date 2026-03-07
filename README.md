
# GeoMedia

Work in progress, Thesis for University of Padua (Computer Science Master Degree) 


## MSSQL

```sh
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=" -e "MSSQL_PID=Evaluation" -p 1433:1433  --name sql2025 --hostname sql2025 -d mcr.microsoft.com/mssql/server:2025-latest

```