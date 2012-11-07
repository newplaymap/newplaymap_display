newPlayMap.routing = newPlayMap.routing || {};
var canvas = {}

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
    if(path.parts[1] !== undefined) {
      path.vars = path.parts[1].split("&");
    }
    path.filters = {};
    for (var singleFilter in path.vars) {
      var filter = path.vars[singleFilter].split('=');
      path.filters[filter[0]] = filter[1];
    }
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

newPlayMap.lookupFeatureByPath = function(dataName, alt_path, id_key, id_value) {
  var path = newPlayMap.routing.path.baseStripped;
  if(jsonData[dataName] !== undefined){
    features = jsonData[dataName].features;

    loadedFeatures = [];
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var pathKey;
        if(alt_path !== undefined) {
          pathKey = alt_path;
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
};

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

/*
 * Process links so we can selectively use the address()
 */
newPlayMap.processAddressLinks = function(className, target) {
  if (target == undefined) {
    var target = 'a';
  }

  $(target).each(function(){
    var thisTarget = $(this);
    var path = thisTarget.attr('href');

    if (path !== undefined) {
      if (thisTarget.hasClass(className)) {
      }
      else if (path.substr(0,11) === 'participate') {
      }
      else if (thisTarget.attr('id') == 'share-facebook') {
      }
      else if (thisTarget.hasClass('twitter-share-button')) {
      }
      else if (thisTarget.attr('id') == 'share-links-show') {
      }
      else if (thisTarget.attr('id') == 'add_button') {
      }
      else if (thisTarget.hasClass('share-link')) {
      }
      else if (thisTarget.attr('id') == 'embed-link') {
      }
      else if (thisTarget.hasClass('reset-map')) {
      }
      else if (thisTarget.parent().hasClass('website')) {
        thisTarget.attr('target', '_BLANK');
      }
      // else if(path.substr(0,5) === '/node') {
      // }
      // else if(path.substr(0,4) === 'node') {
      // }
      // else if(path.substr(-4,4) === 'feed') {
      // }
      // else if(path.substr(0,7) === '/admin/') {
      // }
      // else if((path.substr(0,4) === 'http') || (path.substr(0,5) === '/http')) {
      // }
      // else if(path.length == 1) {
      // }
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
