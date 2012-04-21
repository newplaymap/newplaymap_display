newPlayMap.getMarker = function(target) {
    var marker = target;
    while (marker && marker.className != "marker") {
        marker = marker.parentNode;
    }
    return marker;
};

newPlayMap.onMarkerOver = function(e) {
  var marker = newPlayMap.getMarker(e.target);
  if (marker) {
    var grouping_field = marker.getAttribute("grouping_value");
    var marker_id = $(this).attr('marker_id');
    var layer = $(marker).attr("parent");
    
    if(grouping_field !== undefined){
      if (grouping_field in locationsByID) {
        spotlight.addLocations(locationsByID[marker_id]);
        spotlight.parent.className = "active";

        $('div#panel-container div#panel .content').show();
 
        $('div.marker').css({ 'opacity' : 0.4 }); 

        $('div.marker[grouping_value=' + grouping_field + ']').css({ 'opacity' : 1 }); 
 
                    
        // Update the panel data.
        newPlayMap.updatePanel(marker, locationsByID[grouping_field]);  
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


    $('div.marker').css({ 'opacity' : 1 }); 


  }

  return false;
};

newPlayMap.onMarkerClick = function(e) {
  // Address History
  // Set URL
  // Load marker (is parent of image if clicked. 
  // @TODO be careful that click is not actually on a.
  var marker = e.target.offsetParent;

  // newPlayMap.popupMarker(marker);

  var marker = newPlayMap.getMarker(e.target);
  if (marker) {
    var grouping_field = marker.getAttribute("grouping_value");
    if(grouping_field !== undefined){
      if (grouping_field in locationsByID) {
        $('div#panel-container div#panel .content').show();
                    
        // Update the panel data.
        newPlayMap.updatePanel(marker, locationsByID[grouping_field]);
          
      } 
    }
  }

  return false;
};



newPlayMap.loadArtist = function() {
    console.log("load artist");
};


newPlayMap.loadArtistFilter = function() {
    console.log("load artist");

  $('div.marker[dataname=artists_filter]').each(function(){
      var id = $(this).attr('marker_id');

      spotlight.addLocations(locationsByID[id]);
      spotlight.parent.className = "active";
  });
};


newPlayMap.loadOrganizationFilter = function() {
  console.log("load org");

  $('div.marker[dataname=organizations_filter]').each(function(){
      var id = $(this).attr('marker_id');

      spotlight.addLocations(locationsByID[id]);
      spotlight.parent.className = "active";
  });
};

newPlayMap.loadOrganization = function() {
    console.log("load org");

};

newPlayMap.loadEvent = function() {
    console.log("load event");
      newPlayMap.cluster();
  $('div.marker[type=event]').bind( "click", function() {
      var marker = $(this);
      
      var related_play_id =  marker.attr("related_play_id");
      console.log(related_play_id);
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
      dataName: "play", // @todo will change to be more dynamic hard coding for testing. play data is included in json ###prob needs play path###
      dataPath: "api/journey.php?id=" + related_play_id,
      icon: "icons/play.png",
      grouping_field: "related_play_id",
      callback: newPlayMap.loadJourney
    });
  });
};

newPlayMap.loadJourney = function(feature) {
  // @TODO trigger spotlight.
  console.log(jsonData["play"]);
  newPlayMap.drawPlayJourneyLines(feature);

  // Add click event to play markers.
  $('div.marker[type=play]').bind( "click", function() {
      var marker = $(this);
      newPlayMap.loadPlayData(marker);
    }
  );
  
  $('div#play-journey').click(function() {$('div#play-journey').hide();});
};

newPlayMap.loadRelatedEvents = function() {
  // Add click event to play markers.
  $('div.marker[type=play]').bind( "click", function() {
      var marker = $(this);
      newPlayMap.loadPlayData(marker);
    }
  );
};

newPlayMap.loadPlayData = function(marker) {
  // @TODO trigger spotlight.
  var feature = newPlayMap.lookupFeatureByMarker(marker);
  newPlayMap.drawPlayJourneyLines(feature[0]);
  
  $('div#play-journey').click(function() {$('div#play-journey').hide();});

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
console.log("mc");
  // Custom map steps?
  // Zoom out faster
  $("a.zoomer.zoomin").bind('click', function(e) {

                easey.slow(map, {
                    zoom: map.getZoom() + 2,
                    about: MM.getMousePoint(e, map),
                    time: 500
                });

  });

  $("a.zoomer.zoomout").bind('click', function(e) {
                easey.slow(map, {
                    zoom: map.getZoom() - 2,
                    about: MM.getMousePoint(e, map),
                    time: 500
                });
  });
  $("a.zoomer.zoomout").click( function(e) {
    map.zoomBy(-2);
  });
  

};



    
    
    
newPlayMap.cluster = function() {

};


/*
// Creates canvas 320 × 200 at 10, 50
var paper = Raphael(200, 200, 320, 200);

      var circle = paper.circle(radius, 40, 10);
      circle.attr("fill", "#f00");
      circle.attr("stroke", "#fff");
*/
// Creates circle at x = 50, y = 40, with radius 10
