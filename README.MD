# Geo Media
<style>

img{ width: 500px; }
</style>
This is my project for WNMA Course at University of Padua (Master Degree in Computer Science).

Wireless Network for Mobile Application course held by Professor Claudio Enrico Palazzi, aims to study and understand network in mobile application, optimizing and improving traffic and sensors.



## Concept

### Architecture design

This project reflect the "three tier architecture" (https://www.ibm.com/think/topics/three-tier-architecture), providing a specific actor for each scope:
- **Presentation layer**: Android application, which allows users to sign in or create an account, then to see others users' post and sharing some
- **Application layer**: A simple HTTP server which lsiten the requests and store/retreive the data
- **Data layer**: A DBMS thus to store, clean, check and manipulate data.

![Architecture](/docs/img/Architecture.png)

## Dependendices and tecnologies

### Client application:

made with React using the "Ionic Framework" as graphic wrapper and then compiled for Android platforf.
Usign Capacitor thus to get users' location and to store file (download posts' media) into the mobile phones

- https://capacitorjs.com/docs/apis/filesystem
- https://capacitorjs.com/docs/apis/geolocation
- https://ionicframework.com/
- https://react.dev/

The map is provided via "Pigeon Maps" React-Component
- https://pigeon-maps.js.org/

### Server layer

The server is created with NodeJS, just using the native Node module "http" which allows to easily create an http server, providing endpoints to handle the requests

Otherwise, the package 'tedious' (`npm i tedious`) is required to connecto to MSSQL Database

### Data layer

The DBMS chosen is Microsoft SQL Server (MSSQL), which is a solid and very used solution to store and manage data.


## Pictures

**Location permission**

![permission](docs/img/Screenshot_20250402-233423.png)

**Map**

![mapoverview](docs/img/Map.png)

**Post view**

![postview](docs/img/PostView.png)


**Post creation**

![postcreation](docs/img/Screenshot_20250402-234025.png)


**User account**

![usersettings](docs/img/Screenshot_20250402-234048.png)




