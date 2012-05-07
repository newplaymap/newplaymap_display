
newPlayMap.updatePanel = function(marker, data) {
  $('div#panel-container div#panel').css('visibility', 'visible');
  // data is extra, we might use it...
  var feature = {};
  feature.markup = marker;

  feature.type = marker.getAttribute("type");
  feature.marker_id = marker.getAttribute("marker_id");
  feature.dataName = marker.getAttribute("dataName");
/*   feature.template = marker.getAttribute("template"); */
  
  
  featureData = newPlayMap.loadDataObject(feature);

  // Load event data into the template.
  newPlayMap.panelTemplate(featureData);


  // Add interaction to event listings in the new content
  // @TODO: Not only plays use this template. 
  //        Either be more specific or make sure it applies universally
  var container = $('#panel-container .journey');
  newPlayMap.resultsListProcess(container);
  
  // Make all links listen for address changes.
  $('a').address();
};


newPlayMap.updateBubble = function(marker, data) {
  // data is extra, we might use it...
  var feature = {};
  feature.markup = marker;

  feature.type = marker.getAttribute("type");
  feature.marker_id = marker.getAttribute("marker_id");
  feature.dataName = marker.getAttribute("dataName");
/*   feature.template = marker.getAttribute("template"); */
  
  
  featureData = newPlayMap.loadDataObject(feature);

  // hard coded for events for now. @TODO: Figure out chach's way of using featureData.title and templates
  var title = featureData.properties.play_title;
  bubble = new MM.Follower(map, new MM.Location(featureData['geometry']['coordinates'][1], featureData['geometry']['coordinates'][0]), title);

  // Load event data into the template.
  // newPlayMap.panelTemplate(featureData);


  // Add interaction to event listings in the new content
  // @TODO: Not only plays use this template. 
  //        Either be more specific or make sure it applies universally
  // var container = $('#panel-container .journey');
  // newPlayMap.resultsListProcess(container);
  // 
  // Make all links listen for address changes.
  $('a').address();
};

newPlayMap.loadDataObject = function(featureLookup) {
    var featureSet = [];

    var features = jsonData[featureLookup.dataName].features,
        len = features.length,
        locations = [];

    // for each feature in the collection, get feature data and add it.
    for (var i = 0; i < len; i++) {

        feature = features[i];

        feature.dataName = featureLookup.dataName;
/*         feature.path = featureLookup.properties.path; */
        feature.title = featureLookup.title;
        feature.type = featureLookup.type;
        feature.marker_id = featureLookup.marker_id;
        feature.template = jsonData[featureLookup.dataName].vars.template;
        if(feature.id == featureLookup.marker_id) {
          return feature;
        }
    }
};

newPlayMap.panelTemplates = function() {

  // setupPanelTemplates on load. 
  // do this once only.
  // Loads the markup from when the page loads before it is overwritten.
  var container;


  var type = "popup";
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    container = $('#popup .content');
    panelMarkup[type] = container.html();
  }

  var type = "event";
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    container = $('#panel-container .' + type);
    panelMarkup[type] = container.html();
  }

  type = "organization";
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    container = $('#panel-container .' + type);
    panelMarkup[type] = container.html();
  }

  type = "artist";
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    container = $('#panel-container .' + type);
    panelMarkup[type] = container.html();
  }

  type = "play";
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    container = $('#panel-container .' + type);
    panelMarkup[type] = container.html();

    // Also template by journey.
    container = $('#panel-container .journey ol.events');
    panelMarkup['journey'] = container.html();
  }

  type = "results";
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    container = $('#panel-container .' + type);
    panelMarkup[type] = container.html();
  }

  containerEmpty = $('#panel-container .content').empty();

};

newPlayMap.panelTemplate = function(feature) {
  var type = feature.type;
  var template = feature.template;
  var container, containerEmpty;
  containerEmpty = $('#panel-container .content');
  containerEmpty.empty();
  container = $('#panel-container .' + type);
  container.empty();
  $('#' + template).tmpl(feature["properties"])
        .appendTo(container);
}


newPlayMap.loadResults = function(features, vars) {
  var type = "results";
  var template = "results-template";
  var container, containerEmpty;
  containerEmpty = $('#panel-container .content');
  containerEmpty.empty();
  container = $('#panel-container .' + type);

  container.empty();

  var len = features.length;
  for (var i = 0; i < len; i++) {
    var feature = features[i],
      id = feature.properties[vars.id];
      console.log(feature);

      var result = {
        title: feature["properties"][vars.title],
        path:  feature["properties"]["path"],
        id:  feature["properties"][vars.id],
        city: feature["properties"]["city"],
        state: feature["properties"]["state"]
      };
      $.extend(result, feature);  
      console.log(result);
      
      // Rewrite Results header
      var resultsType = feature["properties"]["content_type"].replace(' ', '-').toLowerCase() + 's';
      $('#panel-container .results-container h2.title').attr('id', resultsType).text(feature['properties']['content_type'] + 's');

      $('#' + template).tmpl(result)
        .appendTo(container);
        
      newPlayMap.resultsListProcess($('#panel-container .results-container'));
  }
};

// Load data into extra container. (ex. points at same geo coordinate.)
newPlayMap.loadExtras = function(features, vars) {
  var type = "extras";
  var template = "extras-template";
  var container, containerEmpty;
  containerEmpty = $('#panel-container .content');
  containerEmpty.empty();
  container = $('#panel-container .' + type);
  container.empty();
  
  var len = features.length;
  for (var i = 0; i < len; i++) {
    if(vars === undefined) {
      var vars = jsonData[features[i].dataName].vars;
    }
      var feature = features[i],
          id = feature.properties[vars.id];
          var result = {
            title: feature["properties"][vars.title],
            path:  feature["properties"]["path"],
            id:  feature["properties"][vars.id]
          }
      $('#' + template).tmpl(result)
        .appendTo(container);
  }
};

newPlayMap.resultsListProcess = function(container) {
  // console.log($(container).find('ol.journey li'));
  $(container).find('ol.results li').hoverIntent({
    over: function() {
      $(this).addClass('active');

      // Highlight pin on the map
        // @TODO: Set the event id dynamically. Make sure events are in the locationsByID object
        // @TODO: Once this is working, turn off highlight on hover/click

      var eventId = $(this).attr('listing_id');

      spotlight.addLocations(locationsByID[eventId]);
      spotlight.parent.className = "active";
      $('div#panel-container div#panel .content').show();
    },
    out: function() {
      $(this).removeClass('active');
      spotlight.parent.className = "inactive";
      spotlight.removeAllLocations();
    }
  });
};