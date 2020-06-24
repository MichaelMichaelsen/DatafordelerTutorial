(function() {
    // Set Kortforsyningen token, replace with your own token
    var username = 'JDUNVQSAUB';
    var password = 'Nuga10s..';
    var authstring = '?username=' + username + '&password=' + password;
    //var authstring = '?username=' + username;

    // Set the attribution (the copyright statement shown in the lower right corner)
    // We do this as we want the same attributions for all layers
    var myAttributionText = '&copy; <a target="_blank" href="https://download.kortforsyningen.dk/content/vilk%C3%A5r-og-betingelser">Styrelsen for Dataforsyning og Effektivisering</a>';
 
 
    // Make custom projection using proj4 and proj4leaflet
    var crs = new L.Proj.CRS('EPSG:25832',
	'+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', {
        resolutions: [1638.4,819.2,409.6,204.8,102.4,51.2,25.6,12.8,6.4,3.2,1.6,0.8,0.4,0.2]
    });

    // Make the map object using the custom projection
    var map = new L.Map('map', {
        crs: crs,
        center: [55.8, 11.4], // Set center location
        zoom: 11, // Set zoom level,
    });

    // Define layers
    // Skærmkort [WMTS:orto_foraar]
    var ortofoto = L.tileLayer.wms('https://services.datafordeler.dk/GeoDanmarkOrto/orto_foraar_wmts/1.0.0/WMTS' + authstring, {
        layers: 'orto_foraar_wmts',
        format: 'image/jpeg',
        attribution: myAttributionText
    });
    
    // Skærmkort [WMTS:topo_skaermkort]
    var topo = L.tileLayer.wms('https://services.datafordeler.dk/DKskaermkort/topo_skaermkort_WMTS/1.0.0/WMTS' + authstring, {
        layers: 'topo_skaermkort',
        format: 'image/png',
        attribution: myAttributionText
    }).addTo(map);
    
    // Matrikelskel overlay [WMS:mat]
    var matrikel = L.tileLayer.wms('https://services.datafordeler.dk/Matrikel/MatrikelGaeldendeOgForeloebigWMS/1.0.0/WMS', {
        transparent: true,
        layers: 'MatrikelSkel,Centroide',
        username: username,
        password: password,
        format: 'image/png',
        attribution: myAttributionText,
        continuousWorld: true,
        minZoom: 9
    }); // addTo means that the layer is visible by default

    // Hillshade overlay [WMS:dhm]
    var hillshade = L.tileLayer.wms('https://services.datafordeler.dk/DHMterraen/dhm_terraen/1.0.0/WMTS', {
        transparent: true,
        layers: 'dhm_terraen_skyggekort_transparent_overdrevet',
        username: username,
        password: password,
        format: 'image/png',
        attribution: myAttributionText,
        continuousWorld: true,
    });

    // Define layer groups for layer control
    // var baseLayers = {
    //     "Ortofoto": ortofoto,
    //     "Skærmkort": topo
    // };
    var baseLayers = {
        "Ortofoto": ortofoto
    };

    var overlays = {
        "Matrikel": matrikel,
        "Hillshade": hillshade
    };

    // Add layer control to map
    // L.control.layers(baseLayers, overlays).addTo(map);    
    L.control.layers(baseLayers).addTo(map);    

    // Add scale line to map
    L.control.scale({imperial: false}).addTo(map); // disable feet units

    var gsFeatures = []; // This is the array to hold the GeoSearch feeatures
    
    // Function to clear the map from GeoSearch features
    var clearMap = function() {
        for (var i in gsFeatures) {
            if (gsFeatures.hasOwnProperty(i)) {
                map.removeLayer(gsFeatures[i]);
            }
        }
        gsFeatures.length = 0;
    }


    // Make a typeahead of the input search field using Bootstrap 3 Typeahead
    $('input.typeahead').typeahead({
        displayText:  function (item){
            return item.presentationString; // this is the attribute of the JSON response to show in the dropdown
        },
        source:  function (query, process) {
            return $.get("https://services.kortforsyningen.dk/Geosearch", { 
                search: query,
                resources: "adresser", // the resource to search within - check valid resources on https://kortforsyningen.dk/indhold/geonoegler-geosearch 
                token: kftoken,
                crs: 'EPSG:4326'
            }, 
            function (response) { // This method is being called when data was received from GeoSearch
                if(response.data) {
                    return process(response.data);
                }
            });
        },
        afterSelect: function(item) { 
            // when an item in the dropdown was selected try to show the geometry of the item
            if(item.geometryWkt) {
                clearMap(); // remove any previous geometries from map
                var wkt = new Wkt.Wkt(); // make a new instance of the Wicket class
                wkt.read(item.geometryWkt); // read WKT from GeoSearch
                var obj = wkt.toObject(map.defaults); // Make a Leaflet object
                
                // Add to map, distinguish multigeometries (Arrays) from objects
                if (Wkt.isArray(obj)) {
                    for (i in obj) {
                        if (obj.hasOwnProperty(i) && !Wkt.isArray(obj[i])) {
                            obj[i].addTo(map);
                            gsFeatures.push(obj[i]);
                        }
                    }
                } else {
                    obj.addTo(map);
                    gsFeatures.push(obj);
                }

                // Pan the map to the feature, distinguish between points and other geometries
                if (obj.getBounds !== undefined && typeof obj.getBounds === 'function') {
                    map.fitBounds(obj.getBounds());
                } else {
                    if (obj.getLatLng !== undefined && typeof obj.getLatLng === 'function') {
                        map.panTo(obj.getLatLng());
                    }
                }
            }
        }
    });

})();    
