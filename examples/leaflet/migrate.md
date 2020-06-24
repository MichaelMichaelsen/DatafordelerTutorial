# Migration Guidelines

## Description
This document contains a short list of services from Kortforsyning (KF) and Datafordeler (DAF). 

The purpose is to make it easy to migrate a web-page using leaflet from Kortforsyning til Datafordeler.

## Overview of different calls

### GeoDanmark Ortofoto
#### Capabilities

#### Kortforsyning 
https://services.datafordeler.dk/GeoDanmarkOrto/orto_foraar_wmts/1.0.0/WMTS
Baseurl 'https://services.kortforsyningen.dk/orto_foraar'

```javascript
var ortofotowmts = L.tileLayer('https://services.kortforsyningen.dk/orto_foraar?token=' + kftoken + '&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar&style=default&format=image/jpeg&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}', {
    minZoom: 0,
    maxZoom: 13,
    attribution: myAttributionText,
    crossOrigin: true,
    zoom: function () {
        var zoomlevel = map._animateToZoom ? map._animateToZoom : map.getZoom();
        console.log("WMTS: " + zoomlevel);
        if (zoomlevel < 10)
            return 'L0' + zoomlevel;
        else
            return 'L' + zoomlevel;
    }
}).addTo(map);
```

#### Datafordeler

Baseurl 'https://services.datafordeler.dk/GeoDanmarkOrto/orto_foraar_wmts/1.0.0/WMTS'

```javascript
let url = 'https://services.datafordeler.dk/GeoDanmarkOrto/orto_foraar_wmts/1.0.0/WMTS' + authstring + 
'&request=GetTile&version=1.0.0&service=WMTS&Layer=orto_foraar_wmts&style=default&format=image/jpeg&TileMatrixSet=KortforsyningTilingDK&TileMatrix={zoom}&TileRow={y}&TileCol={x}'

var ortofotowmts = L.tileLayer(url , {
    minZoom: 0,
    maxZoom: 8,
    attribution: myAttributionText,
    crossOrigin: true,
    zoom: function () {
        var zoomlevel = map._animateToZoom ? map._animateToZoom : map.getZoom();
        // console.log("WMTS: " + zoomlevel);
        return zoomlevel;
    }
}).addTo(map);
```
Note, that one cannot return the zoom as L00, L01, L02 as in KF. The argument for the funtion zoom must be an integer.

### Skærmkort

#### Kortforsyning

Baseurl https://services.kortforsyningen.dk/topo_skaermkort

```javascript
var toposkaermkortwmts = L.tileLayer.wms('https://services.kortforsyningen.dk/topo_skaermkort', {
    layers: 'dtk_skaermkort',
    token: kftoken,
    format: 'image/png',
    attribution: myAttributionText
});

```

#### Datafordeler

Baseurl https://services.datafordeler.dk/GeoDanmarkOrto/orto_foraar_wmts/1.0.0/WMTS

```javascript
let url1 = `https://services.datafordeler.dk/DKskaermkort/topo_skaermkort_WMTS/1.0.0/WMTS?username=${username}&password=${password}` +
            '&request=GetTile&version=1.0.0&layer=topo_skaermkort&format=image/png&style=default&service=WMTS&TileMatrixSet=View1&TileMatrix={zoom}&TileRow={y}&TileCol={x}'
var toposkaermkortwmts = L.tileLayer(url1, {
    layers: 'topo_skaermkort',
    format: 'image/png',
    minZoom: 0,
    maxZoom: 14,
    version: '1.0.0',
    attribution: myAttributionText,
    zoom: function () {
        var zoomlevel = map._animateToZoom ? map._animateToZoom : map.getZoom();
        // console.log("WMTS: " + zoomlevel);
        return zoomlevel;
    }
}).addTo(map);

```