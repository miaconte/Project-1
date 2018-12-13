if (localStorage.getItem("memEvents") === null) {
    localStorage.setItem("memEvents", JSON.stringify([]));
  }
  $("#saveBtn").hide(); //show after selecting a party div; hide after saving or searching
  $("#delBtn").hide(); //show after selecting memEvents; hide after performing a search or deleting
  
  //searches songkick api for artists based on field input
  $("#artistBtn").on("click", function (event) {
  
    event.preventDefault();
    //input represents user input; if it is empty or just a bunch of empty space, user is an idiot and we ignore them; otherwise we continue
    let input = $("#srch").val().trim();
    if (input === "")
      return;
  
    //the left bar needs to be repopulated and the right bar would otherwise potentially be giving wrong information, so both need to be emptied
    $(".sidebar-right").empty();
    $(".sidebar-left").empty();
  
    //upcoming event assumed to be true; if it is not, we will change it to false, report that nothing is found, and just return from on click function
    var userUrl = "https://api.songkick.com/api/3.0/search/artists.json?apikey=jtB1rUwTpHo1n1bg&query=" + spacePlus(input);
  
    //first search songkick api for concerts by artist
    $.ajax({
      method: "GET",
      url: userUrl
    }).then(function (data) {
      var artistData = data.resultsPage.results;
      //if the search yields no results for the search term or the artist does not have a tour end date, no upcoming events found; songkick states null means not touring
      if (isEmpty(artistData) || artistData.artist[0].onTourUntil === null) {
        var report = $("<div>");
        $(".sidebar-left").empty();
        report.html("We're sorry, but that artist does not seem to have any upcoming events at this time."); //THIS MAY NEED TO BE EDITED FOR FORMATTING!
        $(".sidebar-left").append(report);
        return;
      }
  
      //this may need to be edited, but the identifier array only seems to have one item? that structure seems weird. maybe it used to have more?
      var eventsUrl = artistData.artist[0].identifier[0].eventsHref + "?apikey=jtB1rUwTpHo1n1bg";
      $.ajax({
        url: eventsUrl,
        method: "GET"
      }).then(function (tourInfo) {
        var eventList = tourInfo.resultsPage.results.event;
        for (let i = 0; i < eventList.length; i++) {
          var concert = eventList[i];
          var eventOption = $("<div>");
  
          //displays concert name, artist name, date, city, and location; concert name, artist name, and venue are displayed in bold
          eventOption.html("<b>" + concert.displayName + "<br>" + artistData.artist[0].displayName + "<br>" + concert.venue.displayName +
            "</b><br>" + concert.location.city + "<br>" + concert.start.date);
          eventOption.addClass("eventDiv");
          //store latitude and longitude for searching in google maps
          eventOption.attr("data-lat", concert.location.lat);
          eventOption.attr("data-long", concert.location.lng);
          eventOption.attr("data-name", concert.displayName);
          eventOption.attr("data-artist", artistData.artist[0].displayName);
          eventOption.attr("data-city", concert.location.city);
          eventOption.attr("data-date", concert.start.date);
          eventOption.attr("data-venue", concert.venue.displayName);
          $(".sidebar-left").append(eventOption);
        }
      });
    });
  })
  
  //searches eventful api to find venue by name
  $("#venueBtn").on("click", function (event) {
    //same beginning as artist on click
    event.preventDefault();
    let input = $("#srch").val().trim();
    if (input === "")
      return;
    $(".sidebar-right").empty();
    $(".sidebar-left").empty();
  
    //we expect the user to use a comma to separate venue name and city; this indicates comma's index
    let commaInd = input.indexOf(",");
  
    //if there is no comma or nothing after the comma, tell the user to fix it
    if (commaInd === -1 || commaInd === input.length - 1) {
      var report = $("<div>");
      report.html("Venue search input invalid. Please list the venue name then the city name, separated by a comma.");
      $(".sidebar-left").append(report);
      return;
    }
  
    var venue = input.substring(0, commaInd).trim();
    var city = input.substring(commaInd + 1).trim();
  
    var userUrl = "https://cors-anywhere.herokuapp.com/http://api.eventful.com/json/venues/search?keywords=" + spaceDash(venue) + "&location=" + spacePlus(city) + "&app_key=6L8hCFHHB2ZfRdCm";
    $.ajax({
      method: "GET",
      url: userUrl
    }).then(function (response) {
      var pResponse = JSON.parse(response);
      //if the venue doesn't seem to exist: sorry but we can't find it
      if (pResponse.venues === null) {
        var venueDiv = $("<div>");
        $(".sidebar-right").empty();
        venueDiv.html("We're sorry but we could not find a venue by that name in that city.");
        $(".sidebar-right").append(venueDiv);
        return;
      }
      var venueList = pResponse.venues.venue;
  
      for (let i = 0; i < venueList.length; i++) {
        var oneVenue = venueList[i];
        var venueDiv = $("<div>");
        venueDiv.addClass("venueOpt");
        venueDiv.attr("data-lat", oneVenue.latitude);
        venueDiv.attr("data-long", oneVenue.longitude);
        venueDiv.attr("data-city", city);
        venueDiv.attr("data-venue", oneVenue.name);
        venueDiv.html("<b>" + oneVenue.name + "</b><br>" + oneVenue.city_name + ", " + oneVenue.region_name + "<br>" + oneVenue.address);
        $(".sidebar-right").append(venueDiv);
      }
    });
  })
  
  //used to check if an object is empty (for example, songkick returns an empty object if an artist is not found)
  function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  
  //changes spaces to plus
  function spacePlus(str) {
    while (str.indexOf(" ") > -1)
      str = str.replace(" ", "+");
    return str;
  }
  
  //changes spaces to hyphens (dashes)
  function spaceDash(str) {
    while (str.indexOf(" ") > -1)
      str = str.replace(" ", "-");
    str += "-";
    return str;
  }
  
  //map logic
  
  $(document).on("click", ".club", function () {
    $(".selClub").removeClass("selClub");
    $(this).addClass("selClub");
  
    $("#saveBtn").show();
  })
  function initMap () {
  //when the user clicks an eventDiv, look for bars and nightclubs near the venue
  $(document).on("click", ".eventDiv", function () {
    $(".sidebar-right").empty();
    $(".selEvent").removeClass("selEvent");
    $(this).addClass("selEvent");
    //search within 3.5 km of venue for a post-concert party location; may be expanded or shrunken later
  
    var queryURL = "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + $(this).attr("data-lat") + "," + $(this).attr("data-long") + "&radius=3500&type=night_club&key=AIzaSyCsd5GbDBaiJBZ94ei5j9hfU1Cy6TRP6Ws";
    var venLat = $(this).attr("data-lat");
    var venLong = $(this).attr("data-long");
    $.ajax({
      method: "GET",
      url: queryURL
    }).then(function (data) {
      var suggestions = data.results;

      console.log(typeof $(this).attr("data-lat"));

      var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: { lat: parseFloat(venLat), lng: parseFloat(venLong) }
      });
      for (let i = 0; i < suggestions.length; i++) {
        var latitude = suggestions[i].geometry.location.lat;
        var longitude = suggestions[i].geometry.location.lng;
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(latitude, longitude),
          map: map,
          title: 'Hello World!'
        });
        var nameDiv = $("<div>");
        nameDiv.html("<b>" + suggestions[i].name + "</b>");
        nameDiv.attr("data-partyName", suggestions[i].name);
        nameDiv.attr("data-lat", latitude);
        nameDiv.attr("data-long", longitude);
  
        var clubDiv = $("<div>");
        clubDiv.addClass("club");
        clubDiv.html("<b>" + suggestions[i].name + "<br></b>" + suggestions[i].vicinity);
        //retrieve the name of the club and store it on clubDiv as data-partyNames
        clubDiv.attr("data-partyName", suggestions[i].name);
  
        $(".sidebar-right").append(clubDiv);
      }
    });
  });
}
  
  $(document).on("click", ".venueOpt", function () {
    //clear the left bar
    $(".sidebar-left").empty();
  
    //automatically generate a url to search a venue for its events
    var autoUrl = "https://cors-anywhere.herokuapp.com/http://api.eventful.com/json/events/search?keywords=" + spacePlus($(this).attr("data-venue")) + "&l=" + spacePlus($(this).attr("data-city")) + "&app_key=6L8hCFHHB2ZfRdCm";
    $.ajax({
      method: "GET",
      url: autoUrl
    }).then(function (venueEvents) {
      pVenueEvents = JSON.parse(venueEvents);
      //if we cannot find any events, tell the user
      if (pVenueEvents.events === null) {
        var report = $("<div>");
        $(".sidebar-left").empty();
        report.html("Sorry, but no events were found for this venue.");
        $(".sidebar-left").append(report);
        return;
      }
  
      var concertFound = false;
      var eventList = pVenueEvents.events.event;
      for (let i = 0; i < eventList.length; i++) {
        var concert = eventList[i];
        if (concert.performers !== null) {
          concertFound = true;
          var eventOption = $("<div>");
  
          var concertTitle = $("<div>");
          concertTitle.html("<b>" + concert.title + "</b>");
          eventOption.attr("data-name", concert.title);
          eventOption.append(concertTitle);
  
          //string of performers to be displayed
          var perfStr = "";
          var performList = concert.performers.performer;
  
          //if performList has only one performer, it is an object; otherwise it is an array
          if ($.isArray(performList)) {
            for (let j = 0; j < performList.length; j++) {
              perfStr += performList[j].name;
              if (j !== performList.length - 1)
                perfStr += ", ";
            }
          }
          else
            perfStr = performList.name;
  
          var perfDiv = $("<div>");
          perfDiv.html("<b>" + perfStr + "</b>");
          eventOption.attr("data-artist", perfStr);
          eventOption.append(perfDiv);
  
          var venDiv = $("<div>");
          venDiv.html("<b>" + concert.venue_name + "</b>");
          eventOption.attr("data-venue", concert.venue_name);
          eventOption.append(venDiv);
  
          var cityDiv = $("<div>");
          cityDiv.html(concert.city_name);
          eventOption.attr("data-city", concert.city_name);
          eventOption.append(cityDiv);
  
          var dateDiv = $("<div>");
          var startDate = justDate(concert.start_time);
          dateDiv.html(startDate);
          eventOption.attr("data-date", startDate);
          eventOption.append(dateDiv);
  
          //store latitude and longitude for searching in google maps
          eventOption.attr("data-lat", concert.latitude);
          eventOption.attr("data-long", concert.longitude);
          eventOption.addClass("eventDiv");
          $(".sidebar-left").append(eventOption);
        }
      }
      if(!concertFound){
        $(".sidebar-left").empty();
        var report = $("<div>");
        report.html("We're sorry, but there does not seem to be a concert at that venue.");
        $(".sidebar-left").append(report);
      }
    });
  })
  
  function justDate(str) {
    if (str.indexOf(" ") !== -1)
      return str.substring(0, str.indexOf(" "));
    return str;
  }
  
  $("#saveBtn").on("click", function () {
    var toBeSaved = JSON.parse(localStorage.getItem("memEvents") || "[]");
  
    var holdObj = {
      eventTitle: $(".selEvent").attr("data-name"),   //event title taken from selected concert
      artists: $(".selEvent").attr("data-artist"),    //event artists taken from selected concert
      venue: $(".selEvent").attr("data-venue"),       //event venue taken from selected concert
      city: $(".selEvent").attr("data-city"),         //event city taken from selected concert
      date: $(".selEvent").attr("data-date"),         //event date taken from selected concert
      index: 0,                                       //id in the array; we are about to reassign it
      partyName: $(".selClub").attr("data-partyName") //name of the after party club taken from selected club
    }
  
    toBeSaved.push(holdObj);
  
    toBeSaved[toBeSaved.length - 1].index = toBeSaved.length - 1;
    localStorage.setItem("memEvents", JSON.stringify(toBeSaved));
    $(this).hide();
  })
  
  $("#delBtn").on("click", function () {
    var toBeSaved = JSON.parse(localStorage.getItem("memEvents") || "[]");
    var delIndex = $(".selMem").attr("ind"); //ind taken from the selected concert or party
    toBeSaved.splice(delIndex, delIndex + 1);
    for (let i = 0; i < toBeSaved.length; i++) {
      toBeSaved[i].index = i;
    }
    localStorage.setItem("memEvents", JSON.stringify(toBeSaved));
    $(this).hide();
    $(".sidebar-left").empty();
    $(".sidebar-right").empty();
  })
  
  $("#recallBtn").on("click", function () {
    $(".sidebar-left").empty();
    $(".sidebar-right").empty();
  
    var dispArray = JSON.parse(localStorage.getItem("memEvents") || "[]");
    for (let i = 0; i < dispArray.length; i++) {
      var leftDiv = $("<div>");
      leftDiv.attr("ind", i);
  
      var rightDiv = $("<div>");
      rightDiv.attr("ind", i);
  
      //mem will be how we identify bits of memory that can be deleted
      rightDiv.addClass("mem");
      leftDiv.addClass("mem");
  
      leftDiv.html("<b>" + dispArray[i].eventTitle + "<br>" + dispArray[i].artists + "<br>" + dispArray[i].venue + "</b><br>" + dispArray[i].city + "<br>" + dispArray[i].date + "<br>");
  
      rightDiv.html("<b>" + dispArray[i].partyName + "</b>");
  
      $(".sidebar-left").append(leftDiv);
      $(".sidebar-right").append(rightDiv);
    }
    $("#delBtn").hide();
    $("#saveBtn").hide();
  })
  
  $(document).on("click", ".mem", function () {
    $("#delBtn").show();
    $(".selMem").removeClass("selMem");
    $(this).addClass("selMem");
  })