//Your code here
// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-08-15&endtime=" +
    "2020-08-22&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";
function getColor(d) {
        return d > 5 ? '#F06B6B' :
               d > 4  ? '#F0A76B' :
               d > 3  ? '#F3BA4D' :
               d > 2  ? '#F4DB4E' :
               d > 1   ? '#E1F34D' :
                          '#B7F44E';
};
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {

    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + (feature.properties.mag));
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function(features,latlng){
            return L.circle(latlng,{
              radius: features.properties.mag *20000 + 10000 ,
              color: 'black',
              fillColor: getColor(features.properties.mag),
              fillOpacity: 0.8,
              opacity: 0.7,
              weight: 1

        }); 
    }
        
        
    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
    //  earthquakes.addLayer(circle); //
}

var legend = L.control({position: "bottomright"});
    legend.onAdd = function(){
      var div = L.DomUtil.create("div","info legend");
      var limits = ["0-1","1-2","2-3","3-4","4-5","+5"];
      var colors = ['#B7F44E','#E1F34D','#F4DB4E','#F3BA4D','#F0A76B','#F06B6B'];

    for (var i = 0; i < limits.length; i++) {
      div.innerHTML +=
          '<i style="background:' + colors[i]+ '"></i> ' + limits[i]+ '<br>'};

    return div;
  };
  

function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    // Define a baseMaps object to hold our base layers
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3,
        layers: [streetmap, earthquakes]
    });
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    legend.addTo(myMap);
}