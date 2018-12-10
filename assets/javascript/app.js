//searches songkick api for artists based on field input
$("#artistBtn").on("click", function(event) {

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
          $(".sidebar-left").append(eventOption);
        }
      });
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
  function spacePlus(str){
      while(str.indexOf(" ") > -1)
        str = str.replace(" ", "+");
      return str;
  }
  
  //when the user clicks an eventDiv, look for bars and nightclubs near the venue
  $(document).on("click", ".eventDiv", function () {
    $(".sidebar-right").empty();
  })