var newPlayMap = newPlayMap || {};
newPlayMap.layout = newPlayMap.layout || {};

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
  
  // Set up share links
  newPlayMap.formatLinksBubble($('#share-links'), 'share-links-show');
  $('#share-links-show').click(function() {
    newPlayMap.shareInteraction();
    newPlayMap.embedInteraction();
  });
  
  // Make all links listen for address changes.
  newPlayMap.processAddressLinks('internal-address');
  $('.internal-address').address();
  
  // If the panel has been updated, assume that the filter value is no longer relevant and clear it
  newPlayMap.filters.reset();
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

  switch (featureData.properties.content_type) {
    case "Generative Artist":
      var title = featureData.properties.artist_name;
    break;
    case "Event":
      var title = featureData.properties.play_title;
    break;
    case "Organization":
      var title = featureData.properties.name;
    break;
  }
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
  newPlayMap.processAddressLinks('internal-address');
  $('.internal-address').address();
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
  var resultType = vars.type;
  var template = "results-template";
  var container, containerEmpty, resultsEmpty;
  containerEmpty = $('#panel-container .content');
  
  // Play type should load results into events list
  if (resultType == 'play') {
    resultType = 'event';
  }

  resultsEmpty = $('#panel-container .results-container-' + resultType + ' .results');
  resultsEmpty.empty();
  container = $('#panel-container .results-container-' + resultType + '.' + type);
  container.empty();
  // console.log(features.length);
  
  if (typeof vars.resultsTitle != 'undefined') {
    $('#results-header').text(vars.resultsTitle);
  }
  else {
    $('#results-header').text('');
  }

  var len = features.length;
  for (var i = 0; i < len; i++) {
    var feature = features[i],
      id = feature.properties[vars.id];

      var result = {
        title: feature["properties"][vars.title],
        path:  feature["properties"]["path"],
        id:  feature["properties"][vars.id],
        city: feature["properties"]["city"],
        state: feature["properties"]["state"]
      };
      $.extend(result, feature);  

      $('#' + template).tmpl(result)
        // .appendTo(container);
        .appendTo('#panel-container .results-container-' + resultType + ' .results');
        // .appendTo('#panel-container .results-container-organization .results');
      if (resultType != 'play') {
        newPlayMap.resultsListProcess($('#panel-container .results-container-' + resultType));
      }
  }
  
  if (len > 0) {
    // Rewrite results header
    var resultsType = features[0]["properties"]["content_type"];
    var resultsCount = jsonData[vars.dataName]["features"].length;

    var totalCount = jsonData[vars.dataName].count;

    if (resultsType == 'Generative Artist') {
      resultsType = 'Artist';
    }
    newPlayMap.setResultsTitle(resultsType, resultsCount, totalCount);

    newPlayMap.processAddressLinks('internal-address');
    $('.internal-address').address();

    // Truncate all results to 3 each and add a link for more
    if (len > 3) {
      $('#panel-container .results-container-' + resultType + ' ol.results > li').each(function(count) {
        if (count > 2) {
          $(this).addClass('more-results');
        }
      });
      
      $('#panel-container .results-container-' + resultType + ' ol.results li.more-results').hide();

      if ($('#panel-container .results-container-' + resultType + ' .show-more-results').length == 0) {
        $('<a></a>')
          .addClass('show-more-results')
          .text('More ' + resultType + 's')
          .click(function() {
            $('#panel-container .results-container-' + resultType + ' ol.results li.more-results').fadeIn();
            $(this).fadeOut().remove();
          })
          .appendTo('#panel-container .results-container-' + resultType);
      }
    }
  }
  else {
    // If nothing came back, clear out
    newPlayMap.filters.loadingCompleteFeedback();
    newPlayMap.setResultsTitle('Result', 0);
  }
};

/*
 * Helper function to clear out content panel
 *
 * For now all panels should be cleared. Maybe in the future we'll want type but not foreseable.
 */
newPlayMap.layout.clearPanelContent = function() {
  var containerEmpty = $('#panel-container .content');
  containerEmpty.empty();

  // Also clear out all share qtips
  $('.qtip').has('.share-link').remove();
}
 
/*
 * Helper function to clear out different results listing
 *
 * @param type
 * type of results to be cleared
 */
newPlayMap.layout.clearResults = function(type) {
  if (typeof type != 'undefined') {
    $('.results-container-' + type + ' ol.results').empty().siblings('.results-title').find('h2').text('');
    $('.results-container-' + type + ' .show-more-results').remove();
  }
  else {
    $('.results-container ol.results').each(function() {
      $(this).empty().siblings('.results-title').find('h2').text('');
    });
    $('.show-more-results').remove();
  }
}

/*
 * Wrapper function to clear all results and panel content 
 */
newPlayMap.layout.clearEntirePanel = function() {
  newPlayMap.layout.clearPanelContent();
  newPlayMap.layout.clearResults();
}

/*
 * Rewrite results header
 */
newPlayMap.setResultsTitle = function(resultsType, resultsCount, totalCount) {
  var resultsType = resultsType;
  var resultsCount = resultsCount;
  var totalCount = totalCount || null;

  var totalCountText = (totalCount > resultsCount) ? ' (of ' + totalCount + ')' : '';
  var resultsPlural = '';
  if (resultsCount > 1 || resultsCount == 0) {
    // Should be plural
    // Check last letters for plural formatting: http://www.meredith.edu/grammar/plural.htm#and%20x
    var lastLetter = resultsType.substring(resultsType.length, resultsType.length-1);
    var lastTwoLetters = resultsType.substring(resultsType.length, resultsType.length-2);

    if (lastLetter === 's' || lastLetter === 'z' || lastLetter === 'x' || lastTwoLetters === 'ch' || lastTwoLetters === 'sh') {
      resultsPlural = "es";
    }
    else {
      resultsPlural = 's';
    }
  }

  $('#panel-container .results-container-' + resultsType.replace(' ', '-').toLowerCase() + ' .results-title h2')
    .attr('id', resultsType.replace(' ', '-').toLowerCase() + 's-results-title')
    .text(resultsCount + ' ' + resultsType + resultsPlural);
    
  $('#panel-container .results-container-' + resultsType.replace(' ', '-').toLowerCase() + ' .results-title .results-total-count').text(totalCountText);
  
  $('#panel-container .results-container-' + resultsType.replace(' ', '-').toLowerCase() + ' ol.results').attr('id', resultsType.replace(' ', '-').toLowerCase() + 's-results');
}


// Load data into extra container. (ex. points at same geo coordinate.)
newPlayMap.loadExtras = function(features) {
  var type = "extras";
  var template = "extras-template";
  var container;

  newPlayMap.layout.clearPanelContent();

  var len = features.length;
  for (var i = 0; i < len; i++) {

    var vars = jsonData[features[i].dataName].vars;

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
  $(container).find('ol.results > li').hoverIntent({
    over: function() {
      $(this).addClass('active');

      // Highlight pin on the map
        // @TODO: Set the event id dynamically. Make sure events are in the locationsByID object
        // @TODO: Once this is working, turn off highlight on hover/click

      var eventId = $(this).attr('listing_id');

      if (typeof locationsByID[eventId] != 'undefined') {
        spotlight.addLocations(locationsByID[eventId]);
        spotlight.parent.className = "active";
      }
      $('div#panel-container div#panel .content').show();
    },
    out: function() {
      $(this).removeClass('active');
      spotlight.parent.className = "inactive";
      spotlight.removeAllLocations();
    }
  });
};