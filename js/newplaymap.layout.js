
newPlayMap.updatePanel = function(marker, relatedData) {

  // @TOOD Right now this will just load events.
  var event_id = marker.getAttribute("event_id");
  feature = newPlayMap.loadDataObject(jsonData.eventData, event_id);
  var panelData = document;
  
  // Load event data into the event template.
  newPlayMap.panelTemplate(feature, "event");
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
