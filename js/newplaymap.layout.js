
newPlayMap.updatePanel = function(marker, data) {
  $('div#panel-container div#panel').css('visibility', 'visible');
  // data is extra, we might use it...
  var feature = {};
  feature.markup = marker;

  feature.type = marker.getAttribute("type");
  feature.marker_id = marker.getAttribute("marker_id");
  feature.dataName = marker.getAttribute("dataName");
  featureData = newPlayMap.loadDataObject(feature);

  // Load event data into the template.
  newPlayMap.panelTemplate(featureData);


  // Add interaction to event listings in the new content
  // @TODO: Not only plays use this template. 
  //        Either be more specific or make sure it applies universally
  var container = $('#panel-container .journey');
  newPlayMap.eventListProcess(container);
  
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

        if(feature.id == featureLookup.marker_id) {
          return feature;
        }
    }
};


newPlayMap.popupMarker = function(marker) {
/*
  newPlayMap.panelTemplates();

  
  var feature = {};
  feature.markup = marker;
  var type = "popup";
  var container;
  container = $('#popup .content');
  container.empty();



  feature.type = marker.getAttribute("type");

  feature.marker_id = marker.getAttribute("marker_id");
  feature.dataName = marker.getAttribute("dataName");
  
  featureData = newPlayMap.loadDataObject(feature);

  featureData.properties.title = marker.getAttribute("title");

  $.template( type + "Template", panelMarkup[type]);        
  $.tmpl(type + "Template", featureData["properties"])
    .appendTo(container); 


  // Make all links listen for address changes.
  $('a').address();
  
*/  
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

  containerEmpty = $('#panel-container .content').empty();

};

newPlayMap.panelTemplate = function(feature) {

  newPlayMap.panelTemplates();
  var type = feature.type;
  var container, containerEmpty;
  containerEmpty = $('#panel-container .content');
  containerEmpty.empty();

  container = $('#panel-container .' + type);
  container.empty();
  // http://api.jquery.com/jquery.tmpl/

  // @TODO Data may need some escaping.
  $.template( type + "Template", panelMarkup[type]);        
  $.tmpl(type + "Template", feature["properties"])
    .appendTo(container);

  // Special templates for journeys -- this will probably become a display for extra data.
  if (type === "play") {
    type = "journey";
    container = $('#panel-container .journey ol.events');
    container.empty();
    $.template( type + "Template", panelMarkup[type]);        
    $.tmpl(type + "Template", jsonData["play"].features)
      .appendTo(container);  
  }
}

newPlayMap.eventListProcess = function(container) {
  // console.log($(container).find('ol.journey li'));
  $(container).find('ol.events li').hoverIntent({
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