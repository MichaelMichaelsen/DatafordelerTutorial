(function() {

    //  Workaround for 1px lines appearing in some browsers due to fractional transforms
    //  and resulting anti-aliasing.
    //  https://github.com/Leaflet/Leaflet/issues/3575
    if (window.navigator.userAgent.indexOf('Chrome') > -1) {
        var originalInitTile = L.GridLayer.prototype._initTile;
        L.GridLayer.include({
            _initTile: function (tile) {
                originalInitTile.call(this, tile);
                var tileSize = this.getTileSize();
                tile.style.width = tileSize.x + 1 + 'px';
                tile.style.height = tileSize.y + 1 + 'px';
            }
        });
    }

    // Set Kortforsyningen token, replace with your own token
    var username = 'JDUNVQSAUB';
    var password = 'Nuga10s..';
    var authstring = '?username=' + username + '&password=' + password;
    //var authstring = '?username=' + username;


    // Set the attribution (the copyright statement shown in the lower right corner)
    // We do this as we want the same attributions for all layers
    var myAttributionText = '&copy; <a target="_blank" href="https://datafordeler.dk">Styrelsen for Dataforsyning og Effektivisering</a>';


    // Make the map object using the custom projection
    //proj4.defs('EPSG:25832', "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs");
    var crs = new L.Proj.CRS('EPSG:25832',
	'+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', {
        resolutions: [1638.4,819.2,409.6,204.8,102.4,51.2,25.6,12.8,6.4,3.2,1.6,0.8,0.4,0.2],
        origin: [120000,6500000],
        bounds: L.bounds([120000, 5661139.2],[1378291.2, 6500000])
    });


    // Make the map object using the custom projection
    var map = new L.Map('map', {
        crs: crs,
        continuousWorld: true,
        center: [55.8, 11.4], // Set center location
        zoom: 1, // Set zoom level
        minzoom: 0,
        maxzoom: 8
    });

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
    });


    // Skærmkort [WMTS:topo_skaermkort]
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

    // Matrikelskel overlay [WMS:mat]
    var matrikel = L.tileLayer.wms('https://services.datafordeler.dk/MATRIKEL/MatrikelGaeldendeOgForeloebigWMS/1.0.0/WMS'  + authstring , {
        transparent: 'TRUE',
        layers: 'Jordstykke_Gaeldende',
        format: 'image/png',
        attribution: myAttributionText,
        continuousWorld: true,
        version: '1.3.0',
        minZoom: 1
    });

    // Hillshade overlay [WMS:dhm]
    var hillshade = L.tileLayer.wms('https://services.datafordeler.dk/DHMskyggekort/dhm_terraen_skyggekort/1.0.0/WMTS' + authstring, {
        transparent: 'TRUE',
        layers: 'dhm_terraen_skyggekort',

        format: 'image/png',
        attribution: myAttributionText,
        continuousWorld: true,
    });

    // Define layer groups for layer control
    // var baseLayers = {
    //     "Ortofoto WMTS": ortofotowmts,
    //     "Skærmkort WMTS": toposkaermkortwmts
    // };
    var baseLayers = {
        "Ortofoto WMTS": ortofotowmts,
        "Skærmkort WMTS": toposkaermkortwmts
    };

    // var overlays = {
    //     "Matrikel": matrikel,
    //     "Hillshade": hillshade
    // };

    var overlays = {
        "Matrikel": matrikel,
        "Hillshade": hillshade
    };
    // Add layer control to map
    L.control.layers(baseLayers,overlays).addTo(map);

    // Add scale line to map
    L.control.scale({imperial: false}).addTo(map); // disable feet units

})();
