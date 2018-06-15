



function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('#destinationInput', fillInAddress);
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    document.getElementById(component).value = '';
    document.getElementById(component).disabled = false;
  }

  // Get each component of the address from the place details
  // and fill the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
    }
  }
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}


// ***************************************
// Allow enter key click
$('body').keypress(function (e) {
  var key = e.which;
  if (key == 13)  // the enter key code
  {
    $(".searchButton").click();
    return false;
  }
});
// This is where the logic for the app will go.

$(".searchButton").on("click", function () {
  var inputCity = $("#destinationInput").val().trim();

  // First AJAX call takes city from destinationInput...
  $.ajax({
    url: "https://developers.zomato.com/api/v2.1/cities?q=" + inputCity + "",
    dataType: 'json',
    async: true,
    method: "GET",
    beforeSend: function (xhr) {
      xhr.setRequestHeader('user-key',
        '7d25b115751c62f6d4e261ce9c0a2bc0');
    },  // This inserts the api key into the HTTP header
    success: function (response) { console.log(response) }
  }).then(function (response) {

    // Finds city ID in JSON and stores it in a variable...
    var cityId = response.location_suggestions[0].id;

    // Second AJAX call uses search function in Zomato by city ID, sorts by rating, highest to lowest...
    $.ajax({
      url: "https://developers.zomato.com/api/v2.1/search?entity_id=" + cityId + "&entity_type=city&sort=rating",
      dataType: 'json',
      async: true,
      method: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader('user-key',
          '7d25b115751c62f6d4e261ce9c0a2bc0');
      },  // This inserts the api key into the HTTP header
      success: function (response) { console.log(response) }
    }).then(function (response) {

      // clear before printing new search
      $(".foodInfo").empty();

      // lists all entries found (this can be bad if it's alot so I maxed it at 20)
      for (var i = 0; i < response.restaurants.length || i < 20; i++) {
        $(".foodInfo").append("<h3><a href='" + response.restaurants[i].restaurant.url + "'>" + response.restaurants[i].restaurant.name + "</a></h3>");
        // <a class="nav-link " href="#">Hotels</a>
        $(".foodInfo").append("<h5>Cusines: <span>" + response.restaurants[i].restaurant.cuisines + "</span></h5>");
        $(".foodInfo").append("<h5>Rating: <span>" + response.restaurants[i].restaurant.user_rating.aggregate_rating + "</span></h5>");
        $(".foodInfo").append("<h5>Address: <span>" + response.restaurants[i].restaurant.location.address + "</span></h5>");
      }
    })
  });

  var runFunction = 0;
  $(".autosuggest-container").on("click", function () {
    if (runFunction === 0) {
      var inputCity = $("#destinationInput").val().trim();
      $("._2M51Fh5xcvwmaeuGBgSk1x").val(inputCity);
    }
    runFunction ++;
  });

  // Weather API call
  var APIweather = "&APPID=166a433c57516f51dfab1f7edaed8413";
  $.ajax({
    url: "https://api.openweathermap.org/data/2.5/weather?q=" + inputCity + APIweather,
    dataType: 'json',
    async: true,
    method: "GET"

  }).then(function (response) {
    console.log(response)

    // 9/5(K - 273) + 32 convert farenheight to Kelvin.
    var K_temp = response.main.temp;
    var F_temp = (9 * (K_temp - 273.15) / 5 + 32).toFixed(1);

    $("#city").html("<h1>" + response.name + " Weather Details</h1>");
    $("#wind").text("Wind Speed: " + response.wind.speed + " mph");
    $("#humidity").text("Humidity: " + response.main.humidity + " %");
    $("#temp").text("Temperature: " + F_temp + " °F");

  });

});

