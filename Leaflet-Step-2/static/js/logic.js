//Including faultlines for the second part of the challenge
// Store both API endpoints in to URLs 
var Url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-08-15&endtime=" +
    "2020-08-22&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
var GeoUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Using d3 to read json and create features
d3.json(Url, function(data) {

    createFeatures(data.features);
});

d3.json(GeoUrl, function(dataGeo) {

    createFeatures2(dataGeo.features);
});

// Color selection for the eartquake intensity

function getColor(d) {
    return d > 5 ? '#F06B6B' :
        d > 4 ? '#F0A76B' :
        d > 3 ? '#F3BA4D' :
        d > 2 ? '#F4DB4E' :
        d > 1 ? '#E1F34D' :
        '#B7F44E';
};

function createFeatures(earthquakeData) {
    // Create function to read data (place and time of the earthquake) 
    // and place it into the popup
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + (feature.properties.mag));
    }
    // Make a GeoJson layer with the above function to place the circles
    // and determine circles graphic characteristics
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(features, latlng) {
            return L.circle(latlng, {
                radius: features.properties.mag * 20000 + 10000,
                fillColor: getColor(features.properties.mag),
                fillOpacity: 0.8,
                opacity: 0.7,
                weight: 1,
                color: ''
            });
        }
    });
    // Creating map with earthquakes layer
    createMap(earthquakes);
}

// Adding the faultlines data with the new endpoint

var faultlines = [];

function createFeatures2(dataGeo) {
    var geodata = L.geoJSON(dataGeo, {
        pointToLayer: function(features, latlng) {}
    });
    faultlines = geodata;
}
// Create a layer control
// To control layers visualization we include a control feature on the map

var legend = L.control({ position: "bottomright" });
legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ["0-1", "1-2", "2-3", "3-4", "4-5", "+5"];
    var colors = ['#B7F44E', '#E1F34D', '#F4DB4E', '#F3BA4D', '#F0A76B', '#F06B6B'];

    for (var i = 0; i < limits.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' + limits[i] + '<br>'
    };

    return div;
};


function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var Satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v9",
        accessToken: API_KEY
    });
    var Outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/outdoors-v9",
        accessToken: API_KEY
    });
    var GrayScale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/light-v9",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": Satellite,
        "Outdoors": Outdoors,
        "GrayScale": GrayScale
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes,
        Faultlines: faultlines
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [Satellite, earthquakes, faultlines]
    });


    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    legend.addTo(myMap);
}