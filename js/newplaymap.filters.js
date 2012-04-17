var newPlayMap = newPlayMap || {};

// Set up container for filters functions and objects
newPlayMap.filters = {};
var jsonDataSearch = {};

newPlayMap.filters.getOrganizationsIndex = function() {
  $.ajax({
    url:  'api/organizations_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setOrganizationsIndex,
    error: newPlayMap.filters.getOrgnanizationsIndexError
  });
}


newPlayMap.filters.setOrganizationsIndex = function(data) {
  // jsonDataSearch.organizationsIndex = data;
  
    $('.typeahead').typeahead(
      {
        source: data,
        items: 10
      }
    );
}

newPlayMap.filters.getOrgnanizationsIndexError = function(data) {
  console.log('error');

  // @TODO: Maybe remove / gray out the search filter if the index is not available?
}

newPlayMap.filters.organizationName = function(searchString) {
  console.log(searchString);
  // @TODO: Make it do something with the search
}

$(document).ready(function() {
  newPlayMap.filters.getOrganizationsIndex();
  
  $('#filters form').submit(function(event) {
    event.preventDefault();
    var filterValue = $('#filters input').val();
    newPlayMap.filters.organizationName(filterValue);
  });
});

// 
// 
// var filters={};
// filters.data = {};
// filters.data.organizations = {};
// 
// filters.organizations = function() {
// 
//     var features = data.organizationData.features,
//         len = features.length,
//         locations = [];
// 
// filters.data.organizations.names = {};
// 
//     for (var i = 0; i < len; i++) {
//             var feature = features[i],
//             id = feature.properties["organization_id"];
//       
//       filters.data.organizations.titles += {feature.title: id};    
//       filters.data.organizations.titles += {feature.properties.name: id};
// 
// 
//     }
// 
// 
// 
// };
