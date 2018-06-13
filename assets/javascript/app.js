


$("#destinationSubmit").on("click", function () {

    console.log($("#destinationInput").val())
    var APIKey = "&APPID=166a433c57516f51dfab1f7edaed8413";

    city = $("#destinationInput").val();

    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
      city + APIKey;
    console.log(queryURL)

    $.ajax({
        url: queryURL,
        method: "GET"
    })
        .then(function (response) {

            console.log(queryURL);

            var results = response.data;
            console.log(results);
       

                $("#city").html("<h1>" + response.name + " Weather Details</h1>");
                $("#wind").text("Wind Speed: " + response.wind.speed);
                $("#humidity").text("Humidity: " + response.main.humidity);
                $("#temp").text("Temperature (F) " + response.main.temp);
               
            }
        
        );
    
    })









