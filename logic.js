function createFeatures(earthquakeData) {

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
                "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        },
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                fillOpacity: .7,
                stroke: true,
                color: "#006778",
                weight: 0.5
            })
        }
    })

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes)
}

function createMap(earthquakes) {

    // Define map layers
    const lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    const darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });


    // Define a baseMaps object to hold our base layers
    const baseMaps = {
        "Dark Map": darkMap,
        "Light Map": lightMap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
        Earthquakes: earthquakes,
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
        center: [31.7, -7.09],
        zoom: 2.5,
        layers: [darkMap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    const legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function (myMap) {

        const legendDiv = L.DomUtil.create('div', 'info legend')
        const grades = [0, 1, 2, 3, 4, 5]

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            legendDiv.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
        }
        return legendDiv;
    };

    legend.addTo(myMap);
}

// function to get a color depending on what the magnitude is 
function getColor(mag) {
    if (mag > 5) {
        return "#F30"
    }
    if (mag > 4) {
        return "#F60"
    }
    if (mag > 3) {
        return "#F90"
    }
    if (mag > 2) {
        return "#FC0"
    }
    if (mag > 1) {
        return "#FF0"
    }
    return "#9F3"
}

// function to change the radius of the circles for how high the magnitude is
function getRadius(mag) {
    return mag * 2.5
}

// run the initial function to get the data from our source
(async function () {
    const earthquakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const data = await d3.json(earthquakeLink)
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
})()