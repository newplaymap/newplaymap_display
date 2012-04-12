
newPlayMap.updatePanel = function(marker, data) {
  // data is extra, we might use it...
  var feature = {};
  feature.markup = marker;
  feature.type = marker.getAttribute("type");
  feature.marker_id = marker.getAttribute("marker_id");
  feature.dataName = marker.getAttribute("dataName");
  featureData = newPlayMap.loadDataObject(feature);
  // Load event data into the template.
  newPlayMap.panelTemplate(featureData);
};

newPlayMap.loadDataObject = function(featureLookup) {
console.log(featureLookup);
    var featureSet = [];
    var features = jsonData[featureLookup.dataName].features,
        len = features.length,
        locations = [];

    // for each feature in the collection, get feature data and add it.

    for (var i = 0; i < len; i++) {
        feature = features[i];
        feature.dataName = featureLookup.dataName;
        feature.type = featureLookup.type;
        feature.marker_id = featureLookup.marker_id;
        if(feature.id == featureLookup.marker_id) {
          return feature;
        }
    }
};


newPlayMap.popupMarker = function(marker) {
  var feature = {};
  feature.markup = marker;
  feature.type = marker.getAttribute("type");
  feature.marker_id = marker.getAttribute("marker_id");
  feature.dataName = marker.getAttribute("dataName");
  featureData = newPlayMap.loadDataObject(feature);
  // Load event data into the template.
  newPlayMap.popupPanelTemplate(featureData);
};

newPlayMap.popupPanelTemplate = function(feature){

  $('div#popup-placeholder').html(feature.marker_id);
};

newPlayMap.panelTemplates = function() {

  // setupPanelTemplates on load. 
  // do this once only.
  // Loads the markup from when the page loads before it is overwritten.
  var container;
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
  }
  console.log(panelMarkup);
  containerEmpty = $('#panel-container .content').empty();

};

newPlayMap.panelTemplate = function(feature) {

  newPlayMap.panelTemplates();
  console.log(feature);
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
}
