// This is where the logic for the app will go.
var map;
var geoJSON;
var request;
var gettingData = false;
var openWeatherMapKey = "166a433c57516f51dfab1f7edaed8413"
var latStore = 50;
var longStore = -50;

function initialize() {
  var mapOptions = {
    zoom: 5,
    center: new google.maps.LatLng(latStore, longStore)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  // Add interaction listeners to make weather requests
  google.maps.event.addListener(map, 'idle', checkIfDataRequested);

  // Sets up and populates the info window with details
  map.data.addListener('click', function(event) {
    infowindow.setContent(
     "<img src=" + event.feature.getProperty("icon") + ">"
     + "<br /><strong>" + event.feature.getProperty("city") + "</strong>"
     + "<br />" + event.feature.getProperty("temperature") + "&deg;C"
     + "<br />" + event.feature.getProperty("weather")
     );
    infowindow.setOptions({
        position:{
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        },
        pixelOffset: {
          width: 0,
          height: -15
        }
      });
    infowindow.open(map);
  });
}

var checkIfDataRequested = function() {
  // Stop extra requests being sent
  while (gettingData === true) {
    request.abort();
    gettingData = false;
  }
  getCoords();
};

// Get the coordinates from the Map bounds
var getCoords = function() {
  var bounds = map.getBounds();
  var NE = bounds.getNorthEast();
  var SW = bounds.getSouthWest();
  getWeather(NE.lat(), NE.lng(), SW.lat(), SW.lng());
};

// Make the weather request
var getWeather = function(northLat, eastLng, southLat, westLng) {
  gettingData = true;
  var requestString = "http://api.openweathermap.org/data/2.5/box/city?bbox="
                      + westLng + "," + northLat + "," //left top
                      + eastLng + "," + southLat + "," //right bottom
                      + map.getZoom()
                      + "&cluster=yes&format=json"
                      + "&APPID=" + openWeatherMapKey;
  request = new XMLHttpRequest();
  request.onload = proccessResults;
  request.open("get", requestString, true);
  request.send();
};

// Take the JSON results and proccess them
var proccessResults = function() {
  console.log(this);
  var results = JSON.parse(this.responseText);
  if (results.list.length > 0) {
      resetData();
      for (var i = 0; i < results.list.length; i++) {
        geoJSON.features.push(jsonToGeoJson(results.list[i]));
      }
      drawIcons(geoJSON);
  }
};

var infowindow = new google.maps.InfoWindow();

// For each result that comes back, convert the data to geoJSON
var jsonToGeoJson = function (weatherItem) {
  var feature = {
    type: "Feature",
    properties: {
      city: weatherItem.name,
      weather: weatherItem.weather[0].main,
      temperature: weatherItem.main.temp,
      min: weatherItem.main.temp_min,
      max: weatherItem.main.temp_max,
      humidity: weatherItem.main.humidity,
      pressure: weatherItem.main.pressure,
      windSpeed: weatherItem.wind.speed,
      windDegrees: weatherItem.wind.deg,
      windGust: weatherItem.wind.gust,
      icon: "http://openweathermap.org/img/w/"
            + weatherItem.weather[0].icon  + ".png",
      coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
    },
    geometry: {
      type: "Point",
      coordinates: [weatherItem.coord.Lon, weatherItem.coord.Lat]
    }
  };
  // Set the custom marker icon
  map.data.setStyle(function(feature) {
    return {
      icon: {
        url: feature.getProperty('icon'),
        anchor: new google.maps.Point(25, 25)
      }
    };
  });

  // returns object
  return feature;
};

// Add the markers to the map
var drawIcons = function (weather) {
   map.data.addGeoJson(geoJSON);
   // Set the flag to finished
   gettingData = false;
};

// Clear data layer and geoJSON
var resetData = function () {
  geoJSON = {
    type: "FeatureCollection",
    features: []
  };
  map.data.forEach(function(feature) {
    map.data.remove(feature);
  });
};

google.maps.event.addDomListener(window, 'load', initialize);

$(".searchButton").on("click", function () {

  var inputCity = $("#destinationInput").val().trim();

  // Zomatos API Only works for certain cities right now
  $.ajax({
    url: "https://developers.zomato.com/api/v2.1/search?entity_type=city&q=" + inputCity,
    dataType: 'json',
    async: true,
    // method: "GET",
    beforeSend: function (xhr) {
      xhr.setRequestHeader('user-key',
        '7d25b115751c62f6d4e261ce9c0a2bc0');
    },  // This inserts the api key into the HTTP header
    success: function (response) { console.log(response) }
  }).then(function (response) {

    // clear before printing new search
    $(".foodInfo").empty();
    // lists all entries found (this can be bad if it's alot so I maxed it at 20)
    for (var i = 0; i<response.restaurants.length || i<20;i++){
      $(".foodInfo").append("<h3><a href='"+response.restaurants[i].restaurant.url+"'>" + response.restaurants[i].restaurant.name+ "</a></h3>");
      // <a class="nav-link " href="#">Hotels</a>
      $(".foodInfo").append("<h5>Cusines: <span>" + response.restaurants[i].restaurant.cuisines+"</span></h5>");
      $(".foodInfo").append("<h5>Rating: <span>" + response.restaurants[i].restaurant.user_rating.aggregate_rating+"</span></h5>");
      $(".foodInfo").append("<h5>Address: <span>" + response.restaurants[i].restaurant.location.address+"</span></h5>");
    }

  });
  // Weather API call
  var APIweather = "&APPID=166a433c57516f51dfab1f7edaed8413";
  $.ajax({
    url: "https://api.openweathermap.org/data/2.5/weather?q=" + inputCity+APIweather,
    dataType: 'json',
    async: true,
    method: "GET"

  }).then(function (response) {
    console.log(response)
    latStore = response.coord.lat;
    longStore = response.coord.lon;
    // 9/5(K - 273) + 32 convert farenheight to Kelvin.
    var K_temp = response.main.temp;
    var F_temp = (9*(K_temp - 273.15)/5+32).toFixed(1);

    $("#city").html("<h1>" + response.name + " Weather Details</h1>");
    $("#wind").text("Wind Speed: " + response.wind.speed+" mph");
    $("#humidity").text("Humidity: " + response.main.humidity+" %");
    $("#temp").text("Temperature: " + F_temp+" °F");



    initialize();
  });

})

