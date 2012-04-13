newPlayMap.routing = newPlayMap.routing || {};

// @TODO routing will be loaded everytime a dataset is loaded, it should be called.

/* Upgrade to address 1.4, which MIGHT work with regular jquery, otherwise go back to jquery 1.4.2
 * Whenever the address changes, trigger popup markers & load node.
 */

//http://www.asual.com/jquery/address/docs/ 
newPlayMap.loadAddress = function() {
  newPlayMap.buildRoutePath();

  $.address.change(function(event) {
    console.log("address change");
    newPlayMap.buildRoutePath(event);
    return false;
  });

  // bind address to all a links.
  $('a').address();
};

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
/*   console.log(path); */
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

  // Ignore certain links & force them to open in Drupal
  // newPlayMap.ajaxLinks();  
  
  if(newPlayMap.routing.path !== undefined && newPlayMap.routing.path.rawPath !== false) {
    var route = {};

    switch(newPlayMap.routing.path.args[0]) {
      case "event":
        feature = newPlayMap.lookupFeatureByPath("events");
        route.feature = feature;
        route.callback = newPlayMap.loadEvent;
        newPlayMap.routing.route = route;
      break;
  
      case "artist":
        feature = newPlayMap.lookupFeatureByPath("artists");
        route.feature = feature;
        route.callback = newPlayMap.loadArtist;
        newPlayMap.routing.route = route;
      break;
  
      case "organization":
        feature = newPlayMap.lookupFeatureByPath("organizations");
        route.feature = feature;
        route.callback = newPlayMap.loadOrganization;
        newPlayMap.routing.route = route;
      break;
  
      case "play":
        // we will load the record, then find the exact match.
      
        feature = newPlayMap.lookupFeatureByPath("play", "play_path", "related_event_id", newPlayMap.routing.path.filters.event_id);
        // Spelling this out to be extra super clear
        route.feature = feature;
        route.callback = newPlayMap.loadRelatedEvents;
        newPlayMap.routing.route = route;
      break;
      
      default:
          newPlayMap.routing.route.callback = newPlayMap.doNothing;
      break;
   }
  }


};
newPlayMap.doNothing = function() {
  console.log("doing nothing");
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
  var feature = newPlayMap.routing.route.feature;
  newPlayMap.loadPlayData(feature);
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

        var locations = [];
        for (var i = 0; i < jsonData.play.features.length; i++) {
            var pair = jsonData.play.features[i]["geometry"]["coordinates"];
            
              console.log(pair);
            

          if (pair && pair.length == 2) {
              var location = new MM.Location(pair[1], pair[0]);
              if (!isNaN(location.lat) && !isNaN(location.lon)) {
                  locations.push(location);
              }
          }
        }
//      http://raphaeljs.com/reference.html  
      // line style in function
      
        if (locations.length > 0) {
            var fillStyle = 'transparent';
            var fillAlpha = 0;
            var strokeStyle = '#000';
            var polygon = new MM.PolygonMarker(map, locations, fillStyle, fillAlpha, strokeStyle);
        }
      $("div#play-markers").css("z-index", 700);
      $("div#play-journey").css("z-index", 600);
      $("div#artists-markers").css("z-index", 500);
      $("div#organizations-markers").css("z-index", 400);
      $("div#events-markers").css("z-index", 300);
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


/**
 * Perform all the actions that should happen when a full popup overlay should load.
 */
newPlayMap.loadMapNodePopup = function(path) {
  // console.log("laoding map node " + path);
/*
  if(path !== undefined) {
    // Trigger popup & markers (hides bubble in our case.)
    var featureState = newPlayMap.triggerPopup(path);
    //console.log(featureState);
    // Zoom to features.
    // @TODO Test this really escapes properly.
    if(featureState !== undefined) {
      newPlayMap.featuresZoom(featureState);
    }
    // Load node content (ajax gets the node path)
    newPlayMap.loadNode(path);
  }
  if (featureState.featureFound === false) {
    newPlayMap.nonLocatedFeaturePopup(path);    
    newPlayMap.reloadPageNode(path);
  }
*/
  return false;
};

newPlayMap.reloadPageNode = function(path) {
newPlayMap.basePath = "";
  window.location = newPlayMap.basePath + '#' + path;
};

newPlayMap.nonLocatedFeaturePopup = function(path) {
/*

  newPlayMap.popupSelect.unselectAll();

  var output =
    '<div class="popup-container popup-container-no-location">' + 
      '<div class="popup-inner"><div class="close-btn"></div>' + 
        '<div class="popup-content">' + 
          '<div class="openlayers-popup openlayers-popup-name"></div>' +
          '<div class="openlayers-popup openlayers-popup-description"></div>' + 
        '</div>' + 
      '</div>' + 
      '<div class="overlay"><div class="node-content"></div></div>' + 
    '</div>';

  if ($('div.popup-container').length < 1) {
    $('div.openlayers-views-map').append(output);
  } else {
    $('div.popup-container').addClass('popup-container-no-location');
  }
  
  
  // Swap popup backgrounds.
  $('div.popup-container div.popup-inner').show().html('<div class="loading-wrapper"><img src="/sites/all/themes/newplay/images/spinner-72x72.gif" alt="' + Drupal.t("Loading") + '"/></div>');

  var processed = newPlayMap.ajaxLinks('ajax-overlay', 'div.popup-container div.overlay a');
  if (processed === true) {
    $('div.popup-container div.overlay a.ajax-overlay').click(function() {
      newPlayMap.loadNewAddress($(this));
      return false;
    });
  }

  // Create a close_btn click event.
  $('div.popup-container div.close-btn').click(function(){
     $('div.overlay').remove();
     newPlayMap.clearAddress()
     
     // Clear the page title
     newPlayMap.clearPageTitle()
  });

  // If user is navigating map, and clicks another popup, and there is a hashPath,
  // retrigger the node load sequence.
  var hashPath = newPlayMap.jqueryAddressHashPath();
  $('div.popup-container div.popup-content').show();
  // $('div.popup-container div.overlay').hide();
  $('div.popup-container').show();

  // Only clear the address if we are not loading a new node & if it is not in a group
  // @TODO /* || feature.attributes.groupCounter > 1 *//*  - this was removed, but if something */
  // special needs to happen to a group, it might need to be handled here.
  // if(feature.context === "nodeLoad") { 
  // }
  // else {
  //   newPlayMap.clearAddress();
  // }

};

/**
 * Based on a given path, search all the layers
 * and find features that have a url path 
 * (@TODO this would be the node path for the title because it is the name?)
 */
newPlayMap.triggerPopup  = function(path) {
/*
  //console.log("trigger popup");
  var layers, data = $('div.openlayers-map').data('openlayers');
  var featureState = {featureFound: false};
  for (var layer in data.openlayers.layers) {
    var currentLayer = data.openlayers.layers[layer];
    // If popup has a counter_rendered value, have a look.
    // If the value is higher than any other value, close all the popups.
    var highestPopupNumber;
    highestPopupNumber = 0;
    var exactPopupMatch;

    popupSelect.unselectAll();

    // Read through features in this layer.
    for (var marker in currentLayer.features) {
      // If URL path for address matches the main path for the feature, select the feature.
      // @TODO Check in Chrome/Safari/IE
      var namePath = $(currentLayer.features[marker]["attributes"]["name"]).attr('href');

      // Ignore the queryString if it exists. Remove from namePath and path
      var namePathNoQuery = newPlayMap.groupPathRoot(namePath);
      var pathNoQuery = newPlayMap.groupPathRoot(path);

      if(currentLayer.features[marker]["attributes"] !== undefined) {
        if (namePathNoQuery === pathNoQuery) {
          var popupSelection;
          // Original path is an exact match
          if(namePath === path) {
            popupSelection = currentLayer.features[marker];
            featureState = newPlayMap.getFeatureState(featureState, popupSelection);
            return featureState;
          }
          else if (Number(highestPopupNumber) <= Number(marker)) {
            // @TODO This is triggering the ajax load sequence - which is good,
            // but we want it to wait to trigger that event until the very last one
            // so that multiple events are not called.
 
            popupSelection = currentLayer.features[marker];
            // Store the currently selected feature & layer.
            featureState = {
              layer: currentLayer,
              featureFound: true,
              data: data
            };
            highestPopupNumber = marker;
          }
        }
      }  // End location hash check.
    } // End features.
  } // End layers.
  featureState = newPlayMap.getFeatureState(featureState, popupSelection);
  return featureState;
*/
};


/**
 * Given a selection, return an array of data about a feature.
 */
newPlayMap.getFeatureState = function(featureState, popupSelection){
/*
  // Render the popup as selected after it has been found, if it exists.
  if (popupSelection !== undefined) {
    popupSelection.context = "nodeLoad";
    popupSelect.select(popupSelection);
    // Store the currently selected feature & layer.
    featureState.feature = popupSelection;
    featureState.featureFound = true;
  }
  return featureState;
*/
}

newPlayMap.groupPathRoot = function(path){
/*
  try {
    path = path.split('?');
    path = path[0];
  }
  catch (err) {
  }
  return path;
*/
}

/**
 * Zoom to the features in a group.
 */
newPlayMap.featuresZoom = function(featureState) {
/*
  if(featureState.data !== undefined) {
    var map = featureState.data.openlayers;
  }
  if(featureState.featureFound == true && featureState.feature !== undefined && featureState.layer !== undefined && featureState.data !== undefined) { 
    // If this feature belongs to a group
    if(featureState.feature.attributes.groupFeatures !== undefined) {
      var groupPointData = featureState.feature.attributes.groupFeatures;
      groupLayer = new OpenLayers.Layer.Vector(Drupal.t("groupFeatures"));
      // Layer will be visible by default.
      groupLayer.visibility = false;
      groupLayer.displayInLayerSwitcher = false;
      // Only draw lines if there are more than two points.
      if(groupPointData.length > 1) {
        var styleMap = Drupal.openlayers.getStyleMap(map, "groupFeatures");
        var lineString = new OpenLayers.Geometry.LineString(groupPointData);
        // @TODO See why lineToStyle isn't defaulting to default.
  
        var lineFeature = new OpenLayers.Feature.Vector(lineString);
        groupLayer.addFeatures(lineFeature);
        groupLayer.parentLayer = layerID;
        map.addLayer(groupLayer);
        groupExtent = groupLayer.getDataExtent();
        //console.log(groupExtent);
        if (groupExtent != null) {       
          //console.log(groupExtent.getWidth());
          // If unable to find width due to single point,
          // zoom in with point_zoom_level option.
          if (groupExtent.getWidth() == 0.0) {
           //console.log("zoom narrow");
            newPlayMap.groupZoomFeatures(featureState);
            return false;
          }
          else {
           // console.log("zoom group");
//            groupExtent.right = groupExtent.right + 10000000;
            newPlayMap.groupZoomFeatures(featureState);
//            map.zoomToExtent(groupExtent);
            return false;
          }
        }
      }
    }
  newPlayMap.groupZoomFeatures(featureState);
  } // data not empty
  return false;
*/
};
/**
 * Center a point at a zoom level set in the settings.
 */
newPlayMap.groupZoomFeatures = function(featureState) {
/*
  var map = featureState.data.openlayers;
  var groupZoom = featureState.data.map.behaviors['openlayers_behavior_multilinestring']['multiLineStringGroupZoom'];
  if (groupZoom !== undefined) {
    groupZoom = Number(groupZoom);
    var zoomCenter = featureState.feature.geometry.bounds.getCenterLonLat();
    map.setCenter(zoomCenter);
    //map.setCenter(zoomCenter, groupZoom, false, true);
  }
  return false;
*/
}

/**
 * Load Node via ajax.
 * Uses the path from the click event.
 */
newPlayMap.loadNode = function(path) {
/*
  // Add address to browser history.
  // $.address.value(link);
  $.ajax({
      url: Drupal.settings.basePath + "openlayers_newplay/load_node" + path,
      beforeSend: newPlayMap.nodeLoading,
      context: document.body,
      success: newPlayMap.displayNode,
      complete: newPlayMap.loadNodeComplete
    });
  return false;
*/
};

/**
 * Display loading graphic.
 */
newPlayMap.nodeLoading = function (data) {
/*
//console.log("nodeloading");
  // Remove feeds-wrapper on all pages except homepage when the node has been loaded.
  // (Tip: if we just hide it, then the accordion triggers the feeds wrapper & reopens feeds wrapper.)
  $('div#content-area > div.panel-1col-with-feeds > div#feeds-wrapper').remove();
  
  // Create the popup container if necessary
  if ($('#content .popup-container').length === 0) {
    var overlayContainer = Drupal.theme('openlayersNewPlayContentOverlay');
    $('#content').append(overlayContainer);
  }

  // Remove the views results.
  $('div#panel-default-overlay').hide();
  $('div.popup-container div.popup-inner').show();
  // Set fullscreen back to 80% height.
  $('div.openlayers_map_fullscreen').removeClass('homepage');

  // Hide the node content if it exists while the loading happens
  $('div.popup-container div.overlay').hide();

  // Swap popup backgrounds.
  $('div.popup-container div.popup-inner').html('<div class="loading-wrapper"><img src="/sites/all/themes/newplay/images/spinner-72x72.gif" alt="' + Drupal.t("Loading") + '"/></div>');
*/
};

/**
 * Load ajax data.
 */
newPlayMap.displayNode = function(data) {
/*
  // Control which part of the popup appears.
  $('div.popup-container div.popup-inner').hide();
  $('div.popup-container div.overlay').show();

  // Load data into correct region.
  $('div.popup-container div.overlay div.node-content').html(data);

  // Set the page title based on the new content
  newPlayMap.setPageTitle(data);

  // Customize layout.
  $('div.popup-container').css('height', 'auto');
  $('div.popup-container div.overlay').css('height', '100%');
  $('div.popup-container').css('overflow', 'auto');
  return false;
*/
};

/**
 * On Node complete, do something.
 */
newPlayMap.loadNodeComplete = function (data) {
/*
  // Execute Drupal attachBehaviors again after the node content
  // has been rendered in the node-content region of the popup.
  Drupal.attachBehaviors();
  //console.log("complete");
  var processed = newPlayMap.ajaxLinks('ajax-overlay', 'div.popup-container div.overlay a');
  if (processed === true) {
    $('div.popup-container div.overlay a.ajax-overlay').click(function() {
      newPlayMap.loadNewAddress($(this));
      return false;
    });
  }
  $('div.ui-widget-content').css('background', 'none');
  $('div.ui-widget-content').css('border', 'none');
*/
};

/**
 * Popup selection. Implements & extends the main OpenLayers popup behavior.
 * Adds node loading & interactive markers & lines.
 */
newPlayMap.newPlayPopupSelect = function(feature, context) {
/*

  // Remove extra div created for content without a corresponding map feature.
  $('div.openlayers-views-map div.popup-container-no-location').remove();

  var layers, data = $(context).data('openlayers');
  // Create FramedCloud popup.
  popup = new OpenLayers.Popup.FramedCloud(
    'popup',
    feature.geometry.getBounds().getCenterLonLat(),
    null,
    Drupal.theme('openlayersNewPlayPopup', feature),
    null,
    true,
    function (evt) {
      newPlayMap.popupSelect.unselect(
        newPlayMap.selectedFeature
      );
    }
  );


  // Assign popup to feature and map.
  feature.popup = popup;
  feature.layer.map.addPopup(popup);
  newPlayMap.selectedFeature = feature;
  // End normal popup behavior.

  // We have moved away from the normal OpenLayers popups to the point that it doesn't make sense to use them.
  // Creating new markup for popup.
//  $('div.openlayers-views-map').prepend(Drupal.theme('openlayersNewPlayPopup', feature));
  // Create a close_btn click event.
  $('div.popup-container div.close-btn').click(function(){
    newPlayMap.popupSelect.unselect(newPlayMap.selectedFeature);
    newPlayMap.clearAddress();
    
    // Clear the page title
    newPlayMap.clearPageTitle()
  });
  // Hide original popup.
//  $('div#popup').hide();

  $('div.popup-container div.popup-inner').hide();
  // Process node content and add clickable ajax links.
  // newPlayMap.ajaxLinks('ajax-popup', 'div.popup-container div.popup-content a');
  var processed = newPlayMap.ajaxLinks('ajax-popup', 'div.popup-container-bubble div.popup-content a');
  if (processed == true) {
    // Whenever the popup is selected, read through all the links and load a new page.
    $('div.popup-container-bubble a.ajax-popup').click(function() {
      newPlayMap.loadNewAddress($(this));
      return false;
    });
  }

  // Read through each layer to reimplement all the styles.
  for (var layer in data.openlayers.layers) {
    newPlayMap.newPlayLayerStyle(data, feature, layer, true);
  }

  // If user is navigating map, and clicks another popup, and there is a hashPath,
  // retrigger the node load sequence.
  var hashPath = newPlayMap.jqueryAddressHashPath();
  $('div.popup-container div.popup-content').show();
  // $('div.popup-container div.overlay').hide();
  $('div.popup-container').show();

  // Only clear the address if we are not loading a new node & if it is not in a group
  // @TODO /* || feature.attributes.groupCounter > 1 *//*  - this was removed, but if something */
  // special needs to happen to a group, it might need to be handled here.
/*

  if(feature.context === "nodeLoad") { 
  }
  else {
    newPlayMap.clearAddress();
  }
*/


};

newPlayMap.newPlayPopupUnSelect = function(feature, context) {
/*
  //console.log("unselect");
  var layers, data = $(context).data('openlayers');
  // Remove popup if feature is unselected.
  feature.layer.map.removePopup(feature.popup); 
  feature.popup.destroy();
  feature.popup = null;
  // End normal popup behavior.

  // Remove extra div created for content without a corresponding map feature.
  $('div.openlayers-views-map div.popup-container-no-location').remove();

  // Remove any content from the popup.
  // $('div.popup-container').remove();
  $('div.popup-container-bubble').remove();

  // Read through each layer to reimplement all the styles.
  for (var layer in data.openlayers.layers) {
    newPlayMap.newPlayLayerStyle(data, feature, layer, false);
  }
*/
};
