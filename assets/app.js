// This is where the logic for the app will go.
$("body").keypress(function (e) {
  var key = e.which;
  if(key == 13)  // the enter key code
   {
     $(".searchButton").click();
     return false;  
   }
 });

$(".searchButton").on("click", function () {
 $("#thingie").css('visibility', 'visible')
  var inputCity = $("#destinationInput").val().trim();

  $("#food-header").html("<h2>Dining Options in </h2>" + inputCity)


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
      for (var i = 0; i < response.restaurants.length || i < 10; i++) {
        $("#food-info").addClass("card", "col-sm-6");
        $("#food-info").append("<h3><a href='" + response.restaurants[i].restaurant.url + "'>" + response.restaurants[i].restaurant.name + "</a></h3>");
        $("#food-info").append("<h5>Cusines: <span>" + response.restaurants[i].restaurant.cuisines + "</span></h5>");
        $("#food-info").append("<h5>Rating: <span>" + response.restaurants[i].restaurant.user_rating.aggregate_rating + "</span></h5>");
        $("#food-info").append("<h5>Address: <span>" + response.restaurants[i].restaurant.location.address + "</span></h5>");
        
      }

    })

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

    $("#weather").text((response.weather[0].description).toUpperCase());
    $("#city").html("<h1>" + response.name + " Weather Details</h1>");    
    $("#wind").text("Wind Speed: " + response.wind.speed + " mph");
    $("#humidity").text("Humidity: " + response.main.humidity + " %");
    $("#temp").text("Temperature: " + F_temp + " °F");

  });

});

