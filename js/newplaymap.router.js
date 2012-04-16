newPlayMap.routing = newPlayMap.routing || {};
var canvas = {}
// @TODO routing will be loaded everytime a dataset is loaded, it should be called.

/* Upgrade to address 1.4, which MIGHT work with regular jquery, otherwise go back to jquery 1.4.2
 * Whenever the address changes, trigger popup markers & load node.
 */


newPlayMap.buildRoutePath = function(event) {
console.log("building");
console.log(event);
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
  if(path !== undefined) {
    newPlayMap.status.routerPathLoaded = true;
  }
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

newPlayMap.lookupRoute = function() {
  // Make sure Drupal does redirects properly too.
  // Ignore certain links & force them to open in Drupal
  // newPlayMap.ajaxLinks();  
  console.log("-----");
  console.log(newPlayMap.routing.path);
  if(newPlayMap.routing.path !== undefined && newPlayMap.routing.path.rawPath !== false) {
    switch(newPlayMap.routing.path.args[0]) {
      case "event":
        newPlayMap.routing.route.feature = newPlayMap.lookupFeatureByPath("events");
        newPlayMap.routing.route.callback = newPlayMap.loadEvent;
        if(newPlayMap.routing.route.feature !== undefined && newPlayMap.routing.route.callback !== undefined) {
          newPlayMap.status.routerRouteLoaded = true;
        }
      break;
  
      case "artist":
        newPlayMap.routing.route.feature = newPlayMap.lookupFeatureByPath("artists");
        newPlayMap.routing.route.callback = newPlayMap.loadArtist;
        if(newPlayMap.routing.route.feature !== undefined && newPlayMap.routing.route.callback !== undefined) {
          newPlayMap.status.routerRouteLoaded = true;
        }
      break;
  
      case "organization":
        newPlayMap.routing.route.feature = newPlayMap.lookupFeatureByPath("organizations");
        newPlayMap.routing.route.callback = newPlayMap.loadOrganization;
        if(newPlayMap.routing.route.feature !== undefined && newPlayMap.routing.route.callback !== undefined) {
          newPlayMap.status.routerRouteLoaded = true;
        }
      break;
  
      case "play":
        console.log("play");
        // We will load the record, then find the exact match.
        // Spelling this out to be extra super clear
        newPlayMap.routing.route.feature = newPlayMap.lookupFeatureByPath("play", "play_path", "related_event_id", newPlayMap.routing.path.filters.event_id);
        newPlayMap.routing.route.callback = newPlayMap.loadRelatedEvents;

        if(newPlayMap.routing.route.feature !== undefined && newPlayMap.routing.route.callback !== undefined) {
          newPlayMap.status.routerRouteLoaded = true;
        }
      break;
      
      default:
          newPlayMap.routing.route.callback = newPlayMap.doNothing;
          newPlayMap.status.routerRouteLoaded = true;
      break;
   }
  }
  else {
    console.log("in else");
      newPlayMap.routing.route.feature = [];
      newPlayMap.routing.route.callback = newPlayMap.doNothing;
      newPlayMap.status.routerRouteLoaded = true;
  }
};


newPlayMap.loadFeatureAction = function() {
  if(newPlayMap.routing.route !== undefined && newPlayMap.routing.route.callback !== undefined && newPlayMap.routing.route.feature !== undefined) {
    // Execute callback function.
    $(newPlayMap.routing.route.callback);
  }
};

newPlayMap.doNothing = function() {
  console.log("doing nothing");
      // bind address to all a links.


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
    console.log("in else");
     // If jsonData isn't set up yet, stick the route somewhere to load later
     newPlayMap.routing = {
      path: newPlayMap.routing.path,
      dataName: dataName,
      alt_path: alt_path
     };
   } 

};


newPlayMap.loadArtist = function() {
  console.log(newPlayMap.routing);
};

newPlayMap.loadOrganization = function() {
  console.log(newPlayMap.routing);
};

newPlayMap.loadPlay = function() {
/*   console.log(newPlayMap.routing); */
  //get id, 
  // find $(a id)
  // trigger mouse over.

};

newPlayMap.loadRelatedEvents = function() {
  newPlayMap.loadPlayData(newPlayMap.routing.route.feature);
};

newPlayMap.loadPlayData = function(feature) {
  // trigger mouse over.
  // MM uses addEventListener to call onMarkerOver -- can't trigger the event...
  $('div#marker-play-' +  feature[0]["id"]).trigger("click");
  
  newPlayMap.drawPlayJourneyLines(feature);
  
  
/*
  
  , function() {
   newPlayMap.onMarkerOver();
  }
*/
        //  MM.addEventListener("triggerLoad", newPlayMap.onMarkerOver, false);
  
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
/*
@TODO   deal w/ z-index issues 
      $("div#play-markers").css("z-index", 700);
      $("div#play-journey").css("z-index", 600);
      $("div#artists-markers").css("z-index", 500);
      $("div#organizations-markers").css("z-index", 400);
      $("div#events-markers").css("z-index", 300);
*/
      
     // $("div#play-markers .marker").bind('mouseover'), function() {
       // console.log("fade");
/*
      $("div#artists-markers").fadeOut(2000);
      $("div#organizations-markers").fadeOut(2000);
      $("div#events-markers").fadeOut(2000);
*/
        
     // }
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
