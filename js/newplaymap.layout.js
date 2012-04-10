
newPlayMap.updatePanel = function(marker) {
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

    var featureSet = [];
    var features = jsonData[featureLookup.dataName].features,
        len = features.length,
        locations = [];

    // for each feature in the collection, get feature data and add it.

    for (var i = 0; i < len; i++) {
        feature = features[i];
        feature.dataName = featureLookup.dataName;
        feature.type = featureLookup.type;
        if(feature.id == featureLookup.marker_id) {
          console.log(feature);
          return feature;
        }
    }
};

newPlayMap.panelTemplate = function(feature) {
  var type = feature.type;
  var container = $('#panel-container .' + type);
  if (panelMarkup[type] === null || panelMarkup[type] === undefined) {
    panelMarkup[type] = container.html();
  }

  var content = {};
  container.empty();
  // http://api.jquery.com/jquery.tmpl/

  // @TODO Data may need some escaping.
  $.template( type + "Template", panelMarkup[type]);        
  $.tmpl(type + "Template", feature["properties"])
    .appendTo(container); 
}
