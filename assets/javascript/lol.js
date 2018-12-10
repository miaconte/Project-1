
      var map, infoWindow;
      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 6
        });
        infoWindow = new google.maps.InfoWindow;

        // Try HTML5 geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            infoWindow.open(map);
            map.setCenter(pos);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }
      }

      function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
      }



$(document).on("click", ".eventDiv", function(){
    $(".right-aside").empty();

    var queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + pos + "&radius=1500&type=night_club&key=AIzaSyCsd5GbDBaiJBZ94ei5j9hfU1Cy6TRP6Ws"//you can define a var to hold the url here

    $.ajax({
        method: "GET",
        url: queryURL, //you need to define this
    }).then(function(data){
        //you can redefine what you want to call the data, i just called it data so as not to forget to include it
    });
});
