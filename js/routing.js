var routing = {};

// @TODO routing will be loaded everytime a dataset is loaded, it should be called.

routing.load = function() {


filters.organizations();

/*
$('.typeahead').typeahead(
  {
  source: data.organizationData.title
  }
);
*/
};



var filters={};
filters.data = {};
filters.data.organizations = {};

filters.organizations = function() {
console.log(data.organizationData);
    var features = data.organizationData.features,
        len = features.length,
        locations = [];

filters.data.organizations.titles = {};

    for (var i = 0; i < len; i++) {
            var feature = features[i],
            id = feature.properties["organization_id"];

/* filters.data.organizations.titles += {feature.title: id};     */
console.log(feature.properties.name);


    }
/* console.log(filters.data.plays.titles); */

};