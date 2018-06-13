// This is where the logic for the app will go.

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

    // 9/5(K - 273) + 32 convert farenheight to Kelvin.
    var K_temp = response.main.temp;
    var F_temp = (9*(K_temp - 273.15)/5+32).toFixed(1);

    $("#city").html("<h1>" + response.name + " Weather Details</h1>");
    $("#wind").text("Wind Speed: " + response.wind.speed+" mph");
    $("#humidity").text("Humidity: " + response.main.humidity+" %");
    $("#temp").text("Temperature: " + F_temp+" °F");

  });

})

