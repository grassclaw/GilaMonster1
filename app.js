// This is where the logic for the app will go.

// First we need to connect to 2 API's

// Zomatos API
$.ajax({
    url: "https://developers.zomato.com/api/v2.1/search?entity_type=city&q=tucson",
    dataType: 'json',
    async: true,
    beforeSend: function (xhr) {
      xhr.setRequestHeader('user-key',
        'd921884911ec4e461f65c2208a36196a');
    },  // This inserts the api key into the HTTP header
    success: function (response) { console.log(response) }
  });