var markers,
    spotlight,
    locationsByType = {};

// originals: http://prag.ma/code/modestmaps-js/examples/geojson/icons/

var newPlayMap = {};
var mm = com.modestmaps;
var map;

var data = {};
var panelMarkup = {};

window.onload = function() {
  
  $('div#panel-container div#panel').hide();
  
  newPlayMap.loadWax();
};

newPlayMap.mapCustomizations = function (map) {
/*   map.setZoomRange(0, 18); */

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


newPlayMap.loadWax = function() {
  // Syntax example. Seeing if Wax works.
  var url = 'http://a.tiles.mapbox.com/v3/newplaymap.map-m3r2xeuk.jsonp';
  wax.tilejson(url, function(tj) {newPlayMap.initMap(tj)});
};

newPlayMap.initMap = function(tj) {
  map = new com.modestmaps.Map('map',
    new wax.mm.connector(tj), null, [
        new easey.DragHandler(),
        new easey.TouchHandler(),
        new easey.DoubleClickHandler(),
        new easey.MouseWheelHandler()
    ]);
  map.setCenterZoom(new com.modestmaps.Location(30, -90), 4);

  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);

  markers = new MM.MarkerLayer();
  map.addLayer(markers);

  newPlayMap.loadEventMarkers();
  
  newPlayMap.mapCustomizations(map);  
};

// ghetto JSON-P
newPlayMap.loadEventMarkers = function() {
    var script = document.createElement("script");
    script.src = "data/events_300.json";
    document.getElementsByTagName("head")[0].appendChild(script);
};

newPlayMap.onLoadEventMarkers = function(collection) {
    data.eventData = collection;

    // onLoadMarkers() gets a GeoJSON FeatureCollection:
    // http://geojson.org/geojson-spec.html#feature-collection-objects
    var features = collection.features,
        len = features.length,
        locations = [];
    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i],
            type = feature.properties["related_play_id"],
            marker = document.createElement("div");

        marker.feature = feature;
        marker.type = type;

        // give it a title
        marker.setAttribute("title", [
            type, "on", feature.properties["Title"]
        ].join(" "));
        // add a class
        marker.setAttribute("class", "marker");
        marker.setAttribute("href", "data/events_300.json");
        
        marker.setAttribute("event_id", feature.properties["event_id"]);

/*         marker.setAttribute("href", "data/events_300.json"); */

        // create an image icon
        var img = marker.appendChild(document.createElement("img"));
/*         img.setAttribute("src", "icons/" + type.replace(/ /g, "_") + ".png"); */
        img.setAttribute("src", "icons/event.png");
        
        markers.addMarker(marker, feature);
        // add the marker's location to the extent list
        locations.push(marker.location);

        if (type in locationsByType) {
            locationsByType[type].push(marker.location);
        } else {
            locationsByType[type] = [marker.location];
        }

        // listen for mouseover & mouseout events
        MM.addEvent(marker, "mouseover", newPlayMap.onMarkerOver);
        MM.addEvent(marker, "mouseout", newPlayMap.onMarkerOut);
        MM.addEvent(marker, "click", newPlayMap.onMarkerClick);
    }

    // tell the map to fit all of the locations in the available space
    map.setExtent(locations);
};

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
      var type = marker.type;

      if (type in locationsByType) {
          spotlight.addLocations(locationsByType[type] || []);
          spotlight.parent.className = "active";

          $('div#panel-container div#panel').show();
                      
          // Update the panel data.
          newPlayMap.updatePanel(marker, locationsByType[type]);

          
      } else {
          spotlight.parent.className = "inactive";
      }
  }
};

newPlayMap.onMarkerOut = function(e) {

  var marker = newPlayMap.getMarker(e.target);
  if (marker) {
      var type = marker.type;

      spotlight.removeAllLocations();
      
      $('div#panel-container div#panel').hide();
      
      spotlight.parent.className = "inactive";
  }

  return false;
};

newPlayMap.onMarkerClick = function(e) {
  // Address History
  // Set URL
  
  console.log("click");
    

  return false;
};

// @TODO This doesn't seem to connect to any modest map click functions.
// Maybe we do not need something like this. will think about it.
newPlayMap.onMarkerClickOut = function(e) {

  console.log("click out");

};

newPlayMap.updatePanel = function(marker, relatedData) {

  // @TOOD Right now this will just load events.
  var event_id = marker.getAttribute("event_id");
  feature = newPlayMap.loadDataObject(data.eventData, event_id);
  var panelData = document;
  
  // Load event data into the event template.
  newPlayMap.panelTemplate(feature, "event")
};

newPlayMap.loadDataObject = function(collection, id) {
  // @TODO only one result?
    var featureSet = [];
    var features = collection.features,
        len = features.length,
        locations = [];
    // for each feature in the collection, create a marker and add it
    // to the markers layer
    for (var i = 0; i < len; i++) {
        var feature = features[i];
        if(feature.id == id) {
          return feature;
        }
    }


};

newPlayMap.panelTemplate = function(data, type) {
  var type = type;
  var container = $('#panel-container .' + type);
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    panelMarkup[type] = container.html();
  }

  var content = {};
  container.empty();
  // http://api.jquery.com/jquery.tmpl/

  // @TODO Data may need some escaping.
  $.template( type + "Template", panelMarkup[type]);        
  $.tmpl(type + "Template", data["properties"])
    .appendTo(container); 
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

/*
// Restrict Extent.
http://bl.ocks.org/1248897

    var minZoom = 0;
    var maxZoom = 18;
    var topLeft = new MM.Location(51.4, -131.8);
    var bottomRight = new MM.Location(21.5, -50.5);

    provider.bottomRightInnerLimit = provider.locationCoordinate(bottomRight).zoomTo(maxZoom);
    provider.topLeftOuterLimit = provider.locationCoordinate(topLeft).zoomTo(minZoom);

   // override sourceCoordinate so that it doesn't use coord limits to wrap tiles
    // but so that it rejects any tile coordinates that lie outside the limits
    provider.sourceCoordinate = function(coord) {
        // don't need .container() stuff here but it means *something* will get loaded at low zoom levels
        // e.g. at level 0 the base tile could contain the entire extent
        // skip the .container() stuff if you don't want to load/render tiles outside the extent *at all*
        var TL = this.topLeftOuterLimit.zoomTo(coord.zoom).container();
        var BR = this.bottomRightInnerLimit.zoomTo(coord.zoom).container().right().down();
        if (coord.row < TL.row || coord.row >= BR.row || coord.column < TL.column || coord.column >= BR.column) {
            // it's too high or too low or too lefty or too righty:
            return null;
        }
        // otherwise it's cool, let it through
        return coord;
    }




    // override enforceLimits so that you can't pan outside the given limits
    // Prevent the user from navigating the map outside the `outerLimits`
    // of the map's provider.
    map.enforceLimits = function(coord) {
        coord = coord.copy();
        var limits = this.provider.outerLimits();
        if (limits) {
            var minZoom = limits[0].zoom;
            var maxZoom = limits[1].zoom;
            if (coord.zoom < minZoom) {
                coord = coord.zoomTo(minZoom);
            }
            else if (coord.zoom > maxZoom) {
                coord = coord.zoomTo(maxZoom);
            }
    
            // this generally does the *intended* thing,
            // but it's not always desired behavior so it's disabled for now
    
            var topLeftLimit = limits[0].zoomTo(coord.zoom);
            var bottomRightLimit = limits[1].zoomTo(coord.zoom);
            var currentTopLeft = this.pointCoordinate(new MM.Point(0,0));
            var currentBottomRight = this.pointCoordinate(this.dimensions);
    
            if (bottomRightLimit.row - topLeftLimit.row < currentBottomRight.row - currentTopLeft.row) {
                // if the limit is smaller than the current view center it
                coord.row = (bottomRightLimit.row + topLeftLimit.row) / 2;
            }
            else {
                if (currentTopLeft.row < topLeftLimit.row) {
                    coord.row += topLeftLimit.row - currentTopLeft.row;
                }
                else if (currentBottomRight.row > bottomRightLimit.row) {
                    coord.row -= currentBottomRight.row - bottomRightLimit.row;
                }
            }
            if (bottomRightLimit.column - topLeftLimit.column < currentBottomRight.column - currentTopLeft.column) {
                // if the limit is smaller than the current view, center it
                coord.column = (bottomRightLimit.column + topLeftLimit.column) / 2;                    
            }
            else {
                if (currentTopLeft.column < topLeftLimit.column) {
                    coord.column += topLeftLimit.column - currentTopLeft.column;
                }
                else if (currentBottomRight.column > bottomRightLimit.column) {
                    coord.column -= currentBottomRight.column - bottomRightLimit.column;
                }
            }
    
        }
        return coord;
    }    






*/
