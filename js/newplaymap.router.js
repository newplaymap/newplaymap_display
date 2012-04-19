newPlayMap.routing = newPlayMap.routing || {};
var canvas = {}
// @TODO routing will be loaded everytime a dataset is loaded, it should be called.

/* Upgrade to address 1.4, which MIGHT work with regular jquery, otherwise go back to jquery 1.4.2
 * Whenever the address changes, trigger popup markers & load node.
 */


newPlayMap.buildRoutePath = function(event) {
  newPlayMap.routing.path = newPlayMap.splitPath(event);
};

newPlayMap.splitPath = function(event) {
  var path = {};
  path.rawPath = newPlayMap.jqueryAddressHashPath(event);
  path.params = newPlayMap.urlParameters();

  if(path.rawPath !== undefined && path.rawPath !== false) {
    // Clean up path.
    path.uriStripped = path.rawPath.replace(/^\//, '');
    path.args = path.uriStripped.split("/");

     // Split path into components
    path.parts = path.rawPath.split("?");
    path.base = path.parts[0];
    path.partsStripped = path.uriStripped.split("?");
    path.baseStripped = path.partsStripped[0];
    path.vars = path.parts[1].split("&");
    path.filters = {};
    for (var singleFilter in path.vars) {
      var filter = path.vars[singleFilter].split('=');
      path.filters[filter[0]] = filter[1];
    }
  }
  newPlayMap.status.routerPathLoaded = true;  
  return path;
};

/**
 * Get path from the hash path generated by jQueryAddress
 */
newPlayMap.jqueryAddressHashPath = function(event) {
  if(event !== undefined && event.value !== '/') {
    return event.value;
  }
  
  if (window.location.hash) {
    var hash = window.location.hash;

    var hashSplit = hash.split("/");
    if(hashSplit[0] == '#') {
      hashSplit.shift();
      var path = '/' + hashSplit.join("/");
    }
    return path;
  }
  return false;
};


newPlayMap.urlParameters = function(){
  var urlParameters = {};

  for (urlComponent in window.location) {
    urlParameters[urlComponent] = window.location[urlComponent];
  }
  return urlParameters;
};

newPlayMap.lookupFeatureByPath = function(dataName, alt_path, id_key, id_value) {
  var path = newPlayMap.routing.path.baseStripped;
  if(jsonData[dataName] !== undefined){
    features = jsonData[dataName].features;

    loadedFeatures = [];
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var pathKey;
        if(alt_path !== undefined) {
          pathKey = alt_path
        }
        else {
          pathKey = "path";
        }
        if(feature.properties[pathKey] == path){
          if(id_value !== undefined && feature.properties[id_key] == id_value){
            loadedFeatures.push(feature);
            return loadedFeatures;
          }
        }        
    }
    return loadedFeatures;
   }
   else {
    console.log("in else in lookup");
     // If jsonData isn't set up yet, stick the route somewhere to load later
     newPlayMap.routing = {
      path: newPlayMap.routing.path,
      route: newPlayMap.routing.route || {},
      dataName: dataName,
      alt_path: alt_path
     };
   } 

};


newPlayMap.loadArtist = function() {
    console.log("load artist");
};

newPlayMap.loadOrganizationFilter = function() {
  console.log("load org");

  $('div.marker[dataname=organization_filter]').each(function(){
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
    
    
  $('div.marker[type=event]').bind( "click", function() {
      var marker = $(this);
      console.log(marker[0]);
/*       var play_id = $(this) jsondate */
      var data = {
      
      };
      
/*
    newPlayMap.loadAPICall({    
      path: "data/journeys.json",
      data: data,
      type: "play",
      template: "layer-play",
      layer: "play",
      id: "related_event_id",
      label: "related_theater",
      alt_path: "play_path",
      title: "play_title",
      dataName: "play", // @todo will change to be more dynamic hard coding for testing. play data is included in json ###prob needs play path###
      dataPath: "data/plays/9344.json",
      icon: "icons/play.png",
      grouping_field: "related_play_id",
      callback: newPlayMap.loadRelatedEvents
    }
*/
      
      
      
      
      
      newPlayMap.loadPlayData(marker);
    }
  );



    
};

newPlayMap.loadRelatedEvents = function() {
  console.log("load related events");

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
  console.log(feature);

/*
  $(marker).hoverIntent({
    over: function() {
      $(this).addClass('active');


      var marker_id = $(this).attr('marker_id');

      spotlight.addLocations(locationsByID[marker_id]);
      spotlight.parent.className = "active";

      $('div#panel-container div#panel').show();
    },
    out: function() {
      $(this).removeClass('active');
      spotlight.parent.className = "inactive";
      spotlight.removeAllLocations();
    }
  });
*/

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


/**
 * Pass a proper address to jQuery address.
 */
newPlayMap.loadNewAddress = function(element) {
  $.address.value(element.attr('href'));
  return false;
};

newPlayMap.clearAddress = function() {
  $.address.value('');
  return false;
}

/**
 * Process ajax links
 *
 * Add ajax-processed link to tags in given paths in the document.
 * Excludes: 
 *   /
 *   http:
 *   node/add
 *   node/xxx/edit
 *   admin
 */
newPlayMap.ajaxLinks = function(className, target) {
  $(target).each(function(){
    var path = $(this).attr('href');
    
    var cleanPath = newPlayMap.cleanDestination(path);
    if (cleanPath) {
      $(this).attr('href', cleanPath);
    }
    
    if(path !== undefined) {
      if(path.substr(0,5) === '/node') {
      }
      else if(path.substr(0,4) === 'node') {
      }
      else if(path.substr(-4,4) === 'feed') {
      }
      else if(path.substr(0,7) === '/admin/') {
      }
      else if((path.substr(0,4) === 'http') || (path.substr(0,5) === '/http')) {
      }
      else if(path.length == 1) {
      }
      else {
        $(this).addClass(className);
      }
    }
  });
  return true;
};

/**
 * Remove extra callback arguments from the destination query for edit links
 */
newPlayMap.cleanDestination = function(path) {
  if (path) {
    var pathSplit = path
      .replace('openlayers_newplay/load_node/', '')
      .replace('openlayers_newplay%2Fload_node%2F', '');
    return pathSplit;
  }
  return false;
};
