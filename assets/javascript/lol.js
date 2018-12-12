function initMap() {

  function findNearby () {
    var placesAPI = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=40.7204065,-73.9933583&radius=3000&type=night_club&key=AIzaSyCsd5GbDBaiJBZ94ei5j9hfU1Cy6TRP6Ws"
    var theBars = [];
    $.ajax({
      url: placesAPI,
      method: "GET",
    }).then(function (barData){
      console.log(barData);
  for (var i = 0; i < barData.results.length; i++) {
        var nameBar = barData.results[i].name;
        var latitude = barData.results[i].geometry.location.lat;
        var longitude = barData.results[i].geometry.location.lng;
         
       theBars.push([nameBar + ", " + latitude + ", " + longitude]);
       
       
       var nameDiv = $("<div>");
       nameDiv.html("<b>"+ nameBar + "</b>");
       nameDiv.attr("data-name", nameBar);
       nameDiv.attr("data-lat", latitude);
       nameDiv.attr("data-long", longitude);
      }
      console.log(theBars);
    })
   
   
  }
    
    var eventfulAPI = "https://cors-anywhere.herokuapp.com/http://api.eventful.com/json/venues/search?&keywords=The-Bowery-Ballroom-&location=New+York+City&app_key=6L8hCFHHB2ZfRdCm";
   
   
    $.ajax({
      url: eventfulAPI,
      method: "GET",
    }).then(function (roxyData) {
      var a = JSON.parse(roxyData);
      console.log(a.venues.venue.latitude);
      console.log(a.venues.venue.longitude);
   
      var lati = parseFloat(a.venues.venue.latitude);
      var long = parseFloat(a.venues.venue.longitude);
   
      var eventLatLng = { lat: lati, lng: long };
  
   
      
   
      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: eventLatLng
      });
      var locations =
      [
        ["FLatiron Lounge", "40.7399782","-73.99321549999999"],
        ["Tamarind Tribeca","40.719112","-74.0090815"],
        ["The DL", "40.718558","-73.989333"]
      ]
      var infoWIndow = new google.maps.InfoWindow();
      var marker, i;
      for ( var i = 0; i < locations.length; i++) {
        marker = new google.maps.Marker({
        position: new google.maps.LatLng(locations[i][1], locations[i][2]),
        map: map,
        title: 'Hello World!'
      });
        marker = new google.maps.Marker({
          position: eventLatLng,
          map: map,
        })
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(locations[i][0]);
          infowindow.open(map, marker);
        }
      })(marker, i));
    }
    
    })
    
    findNearby(); 
    
  }