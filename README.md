# GeoMedia

> Master Thesis for <a href="https://www.unipd.it/offerta-didattica/corso-di-laurea-magistrale/scienze?ordinamento=2025&key=SC2598&tipo=LM&scuola=SC">Computer Science</a> at University of Padua. (LM-18)

- Author: Alberto Morini
- Relator: Professor Claudio Enrico Palazzi
- Correlator: Lorenzo Perinello

> The first version of this project was implemented with <a href="https://ionicframework.com/">IonicFramework<a/> and <a href="https://pigeon-maps.js.org/">Piegon Maps</a>, for Wireless Network for Mobile Application course.
<br/>

_See the Ionic branch for that version_

Presented at <a href="https://goodit2025.idlab.uantwerpen.be/">GoodIT 2025 </a> (Antwerp, Belgium)
- Full research available on <a href="https://www.research.unipd.it/handle/11577/3575540">UNIPD site</a>


## Concept
GeoMedia insert itself among the others Online Social Networks (OSNS), offering another way to share content in order to discover new places by adding a comment or a multimedia file in the current user location.
In fact, the app provides just a geographical map, where users can fill it by posting not just photos or videos, but also recorded audio, music, files, or just textual comment. So, users are in charge of enriching the map of a city by creating a post, then for example, giving others the opportunity to discover secrets
spots or facts about a place.


GeoMedia makes users interact with the real world by retrieving the current location and then fetching the server to gets the contents around them.
The method to compute the distance among the current user location and the position of the limited content within the kilometers chosen, is an implementation of Vincenty’s formulae

### Architecture design

This project reflect the "three tier architecture" (https://www.ibm.com/think/topics/three-tier-architecture), providing a specific actor for each scope:
- Presentation layer: Android application, which allows users to sign in or create an account, then to see others users' post and sharing some
- Application layer: A simple HTTP server which lsiten the requests and store/retreive the data
- Data layer: A DBMS thus to store, clean, check and manipulate data.

![Architecture](/docs/img/Architecture.png)


## Dependendices and tecnologies

### Client application:

made with ReactNative implementing several packages like:
- expo
- react-native-maps
- @react-native-community/geolocation
- @shopify/flash-list
- expo-secure-store
- react-native-gesture-handler
- react-native-vision-camera
- *check  package.json for all dependencies*

Allowing users to take picture or share file inside the application, then download or share them with others apps; navigating through a native map (Google/Apple) or changing the server environment on fly.


### Server layer

The HTTP REST server is created with NodeJS, thus to provide robust and highly performant API to retrieve and store data.

The only external package used is: npm i tedious (required to connecto to MSSQL database)

### Data layer

The DBMS chosen is Microsoft SQL Server (MSSQL), which is a solid and higly used solution to store and manage data.
-----------------------------

## MSSQL

```sh
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=" -e "MSSQL_PID=Evaluation" -p 1433:1433  --name sql2025 --hostname sql2025 -d mcr.microsoft.com/mssql/server:2025-latest

```

