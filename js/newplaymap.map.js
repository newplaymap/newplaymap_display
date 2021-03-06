newPlayMap.getMarker = function(target) {
    var marker = target;
    while (marker && $(marker).hasClass('marker') != true) {
        marker = marker.parentNode;
    }
    return marker;
};

newPlayMap.onMarkerOver = function(e) {
  // Remove old bubbles
  $('.bubble').fadeOut('slow', function() {
    $(this).remove();
  });

  var marker = newPlayMap.getMarker(e.target);
  if (marker) {
    var grouping_field = marker.getAttribute("grouping_value");
    var marker_id = $(this).attr('marker_id');
    var layer = $(marker).attr("parent");
    var latlon = $(marker).attr("latlon");
      
    if(grouping_field !== undefined){
      if (grouping_field in locationsByID) {
        // spotlight.addLocations(locationsByID[marker_id]);
        // spotlight.parent.className = "active";

        $('div#panel-container div#panel .content').show();
 
        $('a.marker').css({ 'opacity' : 0.4 }); 

        $('a.marker[grouping_value=' + grouping_field + ']').css({ 'opacity' : 1 }); 
 
        // Update the bubble
        newPlayMap.updateBubble(marker, locationsByID[grouping_field]);
        
        // @TODO: Move this to click
        // Update the panel data.
        // newPlayMap.updatePanel(marker, locationsByID[grouping_field]);
        // if(featuresByLocation[latlon].length > 1) {
        //   newPlayMap.loadExtras(featuresByLocation[latlon]);
        // }

      } 
    }
  }
};

newPlayMap.onMarkerOut = function(e) {

  var marker = newPlayMap.getMarker(e.target);
  var layer = $(marker).attr("parent");
  if (marker) {
    var type = marker.type;
    spotlight.parent.className = "inactive";
    spotlight.removeAllLocations();
    
    $('.bubble').fadeOut('slow', function() {
      $(this).remove();
    });


    $('a.marker').css({ 'opacity' : 1 }); 


  }

  return false;
};

newPlayMap.onMarkerClick = function(e) {
  // Address History
  // Set URL
  // Load marker (is parent of image if clicked. 
  // @TODO be careful that click is not actually on a.
  var marker = e.target.offsetParent;

  var marker = newPlayMap.getMarker(e.target);
  if (marker) {
    var grouping_field = marker.getAttribute("grouping_value");
    if(grouping_field !== undefined){
      if (grouping_field in locationsByID) {
        $('div#panel-container div#panel .content').show();
                    
        // Update the panel data.
        newPlayMap.updatePanel(marker, locationsByID[grouping_field]);
        
        // This breaks everything because I made the profile show up when going directly to a url by similating clicking on a marker. So this is bad recursion
        // console.log(marker.feature);
        // $.address.path(marker.feature.properties.path);
      } 
    }
  }

  return false;
};



newPlayMap.loadArtist = function() {
    // console.log("load artist");
};


newPlayMap.loadArtistFilter = function() {
};

newPlayMap.loadOrganizationFilter = function() {
};

newPlayMap.loadOrganization = function() {
};

newPlayMap.loadEvent = function() {
    
  $('a.marker[type=event]').bind( "click", function() {
      var marker = $(this);
      
      var related_play_id =  marker.attr("related_play_id");

      var data = {
        type: "play",
        name: "play",
        id: related_play_id
      };
      
    newPlayMap.loadAPICall({    
      path: "api/journey.php?id=" + related_play_id,
      data: data,
      type: "play",
      zoomLevel: 3,
      clearLayer: true,
      clearLayers: true,
      template: "layer-play",
      layer: "play",
      id: "event_id",
      label: "related_theater",
      alt_path: "play_path",
      title: "play_title",
      dataName: "play",
      dataPath: "api/journey.php?id=" + related_play_id,
      icon: "icons/play.png",
      grouping_field: "related_play_id",
      callback: newPlayMap.loadJourney
    });
  });
};

newPlayMap.loadEventFilter = function() {
  $('a.marker[type=events_filter]').bind( "click", function() {
      var marker = $(this);
      
      var related_play_id =  marker.attr("related_play_id");

      var data = {
        type: "play",
        name: "play",
        id: related_play_id
      };
      
    newPlayMap.loadAPICall({    
      path: "api/journey.php?id=" + related_play_id,
      data: data,
      type: "play",
      zoomLevel: 3,
      clearLayer: true,
      clearLayers: true,
      loadProfile: true,
      template: "layer-play",
      layer: "play",
      id: "event_id",
      label: "related_theater",
      alt_path: "play_path",
      title: "play_title",
      dataName: "play",
      dataPath: "api/journey.php?id=" + related_play_id,
      icon: "icons/play.png",
      grouping_field: "related_play_id",
      callback: newPlayMap.loadJourney
    });
  });
};

newPlayMap.loadJourney = function(feature) {

  newPlayMap.drawPlayJourneyLines(feature);

  // Add click event to play markers.
  $('a.marker[type=play]').bind( "click", function() {
      var marker = $(this);
      newPlayMap.loadPlayData(marker);
    }
  );
  
};

newPlayMap.loadRelatedEvents = function() {
  // Add click event to play markers.
  $('a.marker[type=play]').bind( "click", function() {
      var marker = $(this);
      newPlayMap.loadPlayData(marker);
    }
  );
};

newPlayMap.loadPlayData = function(marker) {
  // @TODO trigger spotlight.
  // var feature = newPlayMap.lookupFeatureByMarker(marker);
  // newPlayMap.drawPlayJourneyLines(feature[0]);
  
  // $('div#play-journey').click(function() {$('div#play-journey').hide();});

};

newPlayMap.loadOrganizationData = function(marker) {
  // @TODO trigger spotlight.
  var feature = newPlayMap.lookupFeatureByMarker(marker);
};

newPlayMap.lookupFeatureByMarker = function(marker) {
  var marker = marker[0];
  var id = marker.getAttribute("marker_id");
  var dataName = marker.getAttribute("dataname");

  if(jsonData[dataName] !== undefined){
    features = jsonData[dataName].features;

    loadedFeatures = [];
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var pathKey;
        if(jsonData[dataName]["vars"]["alt_path"] !== undefined) {
          pathKey = jsonData[dataName]["vars"]["alt_path"];
        }
        else {
          pathKey = "path";
        }
        
        if(feature.id == id){
            loadedFeatures.push(feature);
            return loadedFeatures;
        }        
    }
    return loadedFeatures;
   }
};


newPlayMap.drawPlayJourneyLines = function(feature) {
//      http://raphaeljs.com/reference.html 
  var locations = [];
  for (var i = 0; i < jsonData.play.features.length; i++) {
    var pair = jsonData.play.features[i]["geometry"]["coordinates"];

    if (pair && pair.length == 2) {
        var location = new MM.Location(pair[1], pair[0]);
        if (!isNaN(location.lat) && !isNaN(location.lon)) {
            locations.push(location);
        }
    }
  }

// line style in function

  if (locations.length > 0) {
      var fillStyle = 'transparent';
      var fillAlpha = 0;
      var strokeStyle = '#BF202E';
      if(canvas.clear !== undefined) {
        canvas.clear();
      }
      canvas = new MM.PolygonMarker(map, locations, fillStyle, fillAlpha, strokeStyle);
  }
}


/*
 * Popup bubble
 * Based on journey code using Raphael js.
 * Not working
 */
newPlayMap.drawPopupBubble = function(feature) {
//      http://raphaeljs.com/reference.html 
 // var locations = [];
 // for (var i = 0; i < jsonData.play.features.length; i++) {
 //   var pair = jsonData.play.features[i]["geometry"]["coordinates"];
 // 
 //   if (pair && pair.length == 2) {
 //       var location = new MM.Location(pair[1], pair[0]);
 //       if (!isNaN(location.lat) && !isNaN(location.lon)) {
 //           locations.push(location);
 //       }
 //   }
 // }
 
 // Test data
 var locations = ["37.779846", "-122.407947"];

// line style in function

 if (locations.length > 0) {
     var fillStyle = 'transparent';
     var fillAlpha = 0;
     var strokeStyle = '#BF202E';
     if(canvas.clear !== undefined) {
       canvas.clear();
     }
     canvas = new MM.PolygonMarker(map, locations, fillStyle, fillAlpha, strokeStyle);
 }
}



// Change Double Click easing.

easey.DoubleClickHandler.prototype = {

    init: function(map) {
        this.map = map;
        MM.addEvent(map.parent, 'dblclick', this.getDoubleClick());
    },

    doubleClickHandler: null,

    getDoubleClick: function() {
        // Ensure that this handler is attached once.
        if (!this.doubleClickHandler) {
            var theHandler = this;
            this.doubleClickHandler = function(e) {
                var map = theHandler.map,
                point = MM.getMousePoint(e, map),
                z = map.getZoom() + (e.shiftKey ? -2 : 2);

                easey.slow(map, {
                    zoom: z,
                    about: point,
                    time: 500
                });

                return MM.cancelEvent(e);
            };
        }
        return this.doubleClickHandler;
    }
};

newPlayMap.mapCustomizations = function (map, markers) {
/*   map.setZoomRange(0, 18); */


/*
    var minZoom = 2;
    var maxZoom = 18;
    var topLeft = new MM.Location(70.4, -80.8);
    var bottomRight = new MM.Location(21.5, -90.3);

    // override map limits so that panning and zooming are constrained within these bounds:
    map.coordLimits = [
      map.locationCoordinate(topLeft).zoomTo(minZoom),
      map.locationCoordinate(bottomRight).zoomTo(maxZoom)
    ];

    // override provider limits so that tiles are not loaded unless they are inside these bounds:
    markers.tileLimits = [
      map.locationCoordinate(topLeft).zoomTo(minZoom),
      map.locationCoordinate(bottomRight).zoomTo(maxZoom)
   ];

    // override sourceCoordinate so that it doesn't use coord limits to wrap tiles
    // but so that it rejects any tile coordinates that lie outside the limits
    markers.sourceCoordinate = function(coord) {
        // don't need .container() stuff here but it means *something* will get loaded at low zoom levels
        // e.g. at level 0 the base tile could contain the entire extent
        // skip the .container() stuff if you don't want to load/render tiles outside the extent *at all*
        var TL = this.tileLimits[0].zoomTo(coord.zoom).container();
        var BR = this.tileLimits[1].zoomTo(coord.zoom).container().right().down();
        if (coord.row < TL.row || coord.row >= BR.row || coord.column < TL.column || coord.column >= BR.column) {
            // it's too high or too low or too lefty or too righty:
            //console.log(coord.toString() + " is outside bounds");
            return null;
        }
        // otherwise it's cool, let it through
        return coord;
    }
*/



  // Custom map steps?
  // Zoom out faster
/*
  $("a.zoomer.zoomin").bind('click', function(e) {

                easey.slow(map, {
                    zoom: map.getZoom() + 2,
                    about: MM.getMousePoint(e, map),
                    time: 500
                });

  });
*/

/*
  $("a.zoomer.zoomout").bind('click', function(e) {
                easey.slow(map, {
                    zoom: map.getZoom() - 2,
                    about: MM.getMousePoint(e, map),
                    time: 500
                });
  });
*/
/*
  $("a.zoomer.zoomout").click( function(e) {
    map.zoomBy(-2);
  });
*/
};
