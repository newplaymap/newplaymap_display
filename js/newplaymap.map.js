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
      if (type in locationsByID) {
          spotlight.addLocations(locationsByID[type] || []);
          spotlight.parent.className = "active";

          $('div#panel-container div#panel').show();
                      
          // Update the panel data.
          newPlayMap.updatePanel(marker, locationsByID[type]);

          
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
