var routing = {};

// @TODO routing will be loaded everytime a dataset is loaded, it should be called.

routing.load = function() {


filters.organizations();

$('.typeahead').typeahead(
  {
  source: data.organizationData.name
  }
);
};



var filters={};
filters.data = {};
filters.data.organizations = {};

filters.organizations = function() {

    var features = data.organizationData.features,
        len = features.length,
        locations = [];

filters.data.organizations.names = {};

    for (var i = 0; i < len; i++) {
            var feature = features[i],
            id = feature.properties["organization_id"];
      
      /* filters.data.organizations.titles += {feature.title: id};     */
/*       filters.data.organizations.titles += {feature.properties.name: id}; */


    }

/* console.log(filters.data.organizations.titles); */

};