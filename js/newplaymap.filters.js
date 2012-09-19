var newPlayMap = newPlayMap || {};
newPlayMap.filters = newPlayMap.filters || {};

// Set up container for filters functions and objects
newPlayMap.filters = {};
var jsonDataSearch = {};

/*
 * Function to find organization feature from the name.
 * Used when submitting the filter form
 */
newPlayMap.filters.organizations = function(data) {
  var pathQuery = "";
  var loadProfile = false;
  newPlayMap.layout.clearEntirePanel();

  if (data.organization_name !== undefined) {
    pathQuery = "organization_name=" +  data.organization_name;
    var loadProfile = true;
  }

  if (data.organization_type !== undefined) {
    pathQuery = "organization_type=" +  data.organization_type;
  }

  if (data.national_networks !== undefined) {
    pathQuery = "national_networks=" +  data.national_networks;
  }

  if (data.special_interests !== undefined) {
    pathQuery = "special_interests=" + data.special_interests;
  }

  if (data.city_state !== undefined) {
    pathQuery = "city_state=" + data.special_interests;
  }
  
  if (data.path !== undefined) {
    var loadProfile = true;

    // Load Related Events for this Organization
    var loadProfile = true;
    newPlayMap.loadAPICall({
      data: data,
      zoomLevel: newPlayMap.defaultZoom,
      clearLayer: false,
      clearLayers: false,
      layer: "layer-events-filter",
      class: "inactive",
      id: "event_id",
      label: "play_title", // field which will be used in label
      title: "play_title",
      template: "play-template",
      resultsTitle: null,
      type: "event",
      dataName: "events_filter",
      path: "api/events_filter.php?" + "event_organization_path=" +  data.path,
      dataPath: "api/events_filter.php?" + "event_organization_path=" +  data.path,
      icon: "icons/event.png",
      grouping_field: "event_id",
      related_play_id: "related_play_id",
      callback: newPlayMap.loadEventFilter
    });
  }

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: newPlayMap.defaultZoom,
    clearLayer: true,
    clearLayers: true,
    loadProfile: loadProfile,
    template: "organization",
    layer: "layer-organization-filter",
    class: "inactive",
    template: "organization-template",
    type: "organization",
    label: "org_type",
    id: "organization_id",
    title: "organization_name_display",
    dataName: "organizations_filter",
    path: 'api/organizations_filter.php?' + pathQuery,
    dataPath: "api/organizations_filter.php?" + pathQuery,
    icon: "icons/organization.png",
    callback: newPlayMap.loadOrganizationFilter
  });
  
  // @TODO: Trigger address change if appropriate (searching for org name)
  //        This is also the time to load the profile
}

// Load plays
newPlayMap.filters.plays = function(data) {
  newPlayMap.layout.clearEntirePanel();

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: newPlayMap.defaultZoom,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-plays-filter",
    loadProfile: true,
    class: "inactive",
    label: "play_title",
    id: "event_id",
    title: "play_title_display",
    template: "play-template",
    type: "play",
    dataName: "play",
    path: "api/journey.php?play_title=" +  data.play_title,
    dataPath: "api/journey.php?play_title=" +  data.play_title,
    icon: "icons/play.png",
    grouping_field: "related_play_id",
    callback: newPlayMap.loadJourney
  });
  
  // @TODO: Trigger address change if appropriate (searching for play name)
  //        This is also the time to load the profile
};


newPlayMap.filters.artists = function(data) {
  var pathQuery = "";
  var loadProfile = false;

  newPlayMap.layout.clearEntirePanel();

  if (data.artist_name !== undefined) {
    pathQuery = "artist_name=" +  data.artist_name;
    loadProfile = true;
  }

  if (data.city_state !== undefined) {
    pathQuery = "city_state=" +  data.artist_name;
  }
  
  if (data.path !== undefined) {
    loadProfile = true;
  }

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: newPlayMap.defaultZoom,
    clearLayer: true,
    clearLayers: true,
    loadProfile: loadProfile,
    layer: "layer-artists-filter",
    class: "inactive",
    id: "artist_id",
    label: "ensemble_collective",
    title: "artist_name_display",
    template: "artist-template",
    type: "artist",
    dataName: "artists_filter",
    path: "api/artists_filter.php?" + pathQuery,
    dataPath: "api/artists_filter.php?" + pathQuery,
    icon: "icons/artist.png",
    grouping_field: "artist_id",
    callback: newPlayMap.loadArtistFilter
  });
  
  // @TODO: Trigger address change if appropriate (searching for artist name). 
  //        This is also the time to load the profile
}



newPlayMap.filters.ensemble = function(data) {
  var pathQuery = "";
  newPlayMap.layout.clearEntirePanel();

  if (data.ensemble_collective === "Ensemble / Collective") {
    pathQuery = "ensemble_collective=" +  data.ensemble_collective;
  }

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: newPlayMap.defaultZoom,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-ensemble-filter",
    class: "active",
    id: "artist_id",
    label: "ensemble_collective",
    title: "generative_artist",
    template: "artist",
    type: "artist",
    dataName: "artists_filter",
    path: "api/artists_filter.php?" + pathQuery,
    dataPath: "api/artists_filter.php?" + pathQuery,
    icon: "icons/artist.png",
    grouping_field: "artist_id",
    callback: newPlayMap.loadArtistFilter
  });

}


// Load plays
newPlayMap.filters.events = function(data, resultsTitle) {
  var pathQuery = "";
  newPlayMap.layout.clearEntirePanel();

  if (data.event_type !== undefined) {
    pathQuery = "event_type=" +  data.event_type;
  }

  if (data.start_date !== undefined) {
    pathQuery = "start_date=" +  data.start_date;
  }

  if (data.end_date !== undefined) {
    pathQuery = "end_date=" +  data.end_date;
  }

  newPlayMap.layout.clearEntirePanel();

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: newPlayMap.defaultZoom,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-events-filter",
    class: "inactive",
    id: "event_id",
    label: "play_title", // field which will be used in label
    title: "play_title",
    template: "play-template",
    resultsTitle: resultsTitle,
    type: "event",
    dataName: "events_filter",
    path: "api/events_filter.php?" + pathQuery,
    dataPath: "api/events_filter.php?" + pathQuery,
    icon: "icons/event.png",
    grouping_field: "event_id",
    related_play_id: "related_play_id",
    callback: newPlayMap.loadEventFilter
  });
};

newPlayMap.filters.cityStateEvents = function(data) {
  var pathQuery = "city_state=" +  data.end_date;
  newPlayMap.layout.clearEntirePanel();

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: newPlayMap.defaultZoom,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-events-filter",
    class: "inactive",
    label: "play_title",
    id: "event_id",
    title: "play_title",
    template: "play-template",
    type: "event",
    dataName: "events_filter",
    path: "api/events_filter.php?" + pathQuery,
    dataPath: "api/events_filter.php?" + pathQuery,
    icon: "icons/event.png",
    grouping_field: "event_id",
    related_play_id: "related_play_id",
    callback: newPlayMap.loadEventFilter
  });
};


/*
 * Trigger api calls on the form elements
 */
newPlayMap.filters.setupFilters = function() {
  // $('#plays-filter').change(function() {
  //   newPlayMap.filters.plays({play_title: $(this).attr('value')});
  //   newPlayMap.filters.reset(this);
  //   return false;
  // });

  $('#event-type-filter').change(function() {
    newPlayMap.filters.events({event_type: $(this).attr('value')});
    newPlayMap.filters.reset(this);
    return false;
  });
  
  $('.event-date-field').hide();
  $('.event-to-date-field').hide();

  var minDate = moment("September 9, 2000");
  var maxDate = moment("May 6, 2012")
  var rangeMilliseconds = maxDate.diff(minDate);
  var rangeDays = moment.duration(rangeMilliseconds).asDays();

  $('<div></div>')
      .attr('id', '#event-date-slider')
      .insertBefore('#event-date-filter')
      .slider({
        range: true,
        min: 0,
        max: rangeDays,
        values: [2000, 3000],
        slide: function(event, ui) {
          var formattedMinDate = moment(minDate).add('days', ui.values[0]).format('MMMM D, YYYY'),
              formattedMaxDate = moment(minDate).add('days', ui.values[1]).format('MMMM D, YYYY');
          $('#event-label').html('Event date: ' + formattedMinDate + ' - ' + formattedMaxDate);
        },
        stop: function(event, ui) {
          var formattedMinDate = moment(minDate).add('days', ui.values[0]).format('MMMM D, YYYY'),
              formattedMaxDate = moment(minDate).add('days', ui.values[1]).format('MMMM D, YYYY');
          newPlayMap.filters.events({start_date: formattedMinDate, end_date: formattedMaxDate });
        }
      });
  

  // $('.event-date-field').focus(function() {
  //   $('#filters .event-date-filter-complete').fadeIn('slow');
  //   newPlayMap.filters.reset('.event-date-field');
  // });
  // 
  // $('#filters .event-date-filter-complete').hide().click(function(event) {
  //   event.preventDefault();
  // 
  //   newPlayMap.filters.events({start_date: $('#event-date-filter').val(), end_date: $('#event-to-date-filter').val() });
  //   return false;
  // });

  // $('#organizations-filter').change(function() {
  //   newPlayMap.filters.organizations({organization_name: $(this).attr('value')});
  //   newPlayMap.filters.reset(this);
  // });

  $('#organization-type-filter').change(function() {
    newPlayMap.filters.organizations({organization_type: $(this).attr('value')});
    newPlayMap.filters.reset(this);
  });

  $('#organization-national-networks-filter').change(function() {
    newPlayMap.filters.organizations({national_networks: $(this).attr('value')});
    newPlayMap.filters.reset(this);
  });

  $('#organization-special-interests-filter').change(function() {
    newPlayMap.filters.organizations({special_interests: $(this).attr('value')});
    newPlayMap.filters.reset(this);
  });

  // $('#artists-filter').change(function() {
  //   newPlayMap.filters.artists({artist_name: $(this).attr('value')});
  //   newPlayMap.filters.reset(this);
  // });

  $('#ensemble-collective-filter').change(function() {
    newPlayMap.filters.ensemble({ensemble_collective: 'Ensemble / Collective'});
    newPlayMap.filters.reset(this);
  });

  // @TODO: Don't load the index on page load, do it when the filters are shown
  newPlayMap.filters.getOrganizationsIndex();
  newPlayMap.filters.getArtistsIndex();
  newPlayMap.filters.getPlaysIndex();
  newPlayMap.filters.getEventsCityStateIndex();
  newPlayMap.filters.getOrganizationsCityStateIndex();
  newPlayMap.filters.getArtistsCityStateIndex();

};

newPlayMap.filters.reset = function(exception) {
  var exception = exception || '';
  $('#filters form').find('input').not('.submit-filters').not($(exception)).each(function() {
    $(this).val('').attr('checked', false);
  });

  $('#filters form').find('select').not(exception).each(function() {
    $(this).children().eq(0).attr('selected', 'selected');
  });

  if (exception !== '.event-date-field') {
    $('#filters .event-date-filter-complete').fadeOut();
  }
}

/*
 * Function to give users feedback that filter results are loading
 */
newPlayMap.filters.loadingFeedback = function(jqXHR, settings) {
  // console.log('loading feedback');
  if ($('#loading-feedback').length > 0) {
    $('#loading-feedback').show()
  } 
  else {
    $('<div></div>')
      .attr('id', 'loading-feedback')
      .appendTo('body');
  }
}

/*
 * Function to give users feedback that filter results are done loading
 */
newPlayMap.filters.loadingCompleteFeedback = function() {
  // console.log('done loading feedback');
  $('#loading-feedback').hide()
}

/*
 * Utility function shared by multiple ajax calls
 */
newPlayMap.filters.error = function(data) {
  // console.log('error');

  // @TODO: Maybe remove / gray out the search filter if the index is not available?
}

newPlayMap.filters.feedback = function(message, data) {
  // Can either use an alert or console. Made this to more easily demostrate things to folks without console
  alert(message);
  // console.log(data);
}

/*
 * Organizations
 */
newPlayMap.filters.getOrganizationsIndex = function() {
  $.ajax({
    url:  'api/organizations_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setOrganizationsIndex,
    error: newPlayMap.filters.error
  });
}

newPlayMap.filters.setOrganizationsIndex = function(data) {
  jsonDataSearch.organizations = data;

  // If we are returning org names and ids, use something like this to process and get a list of names
  // var organizationNames = [];
  // for (organization in jsonDataSearch.organizationsIndex) {
  //   organizationNames.push(jsonDataSearch.organizationsIndex[organization].name);
  // }

  // If we are returning just the names, then the raw data is fine
  var organizationNames = data;

  $('#organizations-filter').autocomplete(
    {
      source: organizationNames,
      appendTo: '#panel-container',
      select: function(event, ui) {
        $("#organizations-filter").val(ui.item.label);
        newPlayMap.filters.organizations({organization_name: ui.item.value});
        newPlayMap.filters.reset(this);
        return false;
      }
    }
  );
  
  // http://stackoverflow.com/questions/3488016/using-html-in-jquery-ui-autocomplete
  // .data("autocomplete")._renderItem = function( ul, item ) {
  //   return $( "<li></li>" )
  //      .data( "item.autocomplete", item )
  //      .append( "<a>"+ item.label + "</a>" )
  //      .appendTo( ul );
  //   };
  
}

/*
 * Artists
 */
newPlayMap.filters.getArtistsIndex = function() {
  $.ajax({
    url:  'api/artists_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setArtistsIndex,
    error: newPlayMap.filters.error
  });
}


newPlayMap.filters.setArtistsIndex = function(data) {
  jsonDataSearch.artists = data;

  // If we are returning org names and ids, use something like this to process and get a list of names
  // var organizationNames = [];
  // for (organization in jsonDataSearch.ArtistsIndex) {
  //   organizationNames.push(jsonDataSearch.artistsIndex[organization].name);
  // }

  // If we are returning just the names, then the raw data is fine
  var artistsNames = data;

  $('#artists-filter').autocomplete(
    {
      source: artistsNames,
      appendTo: '#panel-container',
      select: function(event, ui) {
        $("#artists-filter").val(ui.item.label);
        // newPlayMap.filters.artists({artist_name: ui.item.value});
        newPlayMap.filters.events({artist_name: ui.item.value});
        newPlayMap.filters.reset(this);
        return false;
      }
    }
  );
}

/*
 * Plays
 */
newPlayMap.filters.getPlaysIndex = function() {
  $.ajax({
    url:  'api/plays_index.php',
    dataType: 'json',
    success: newPlayMap.filters.setPlaysIndex,
    error: newPlayMap.filters.error
  });
}


newPlayMap.filters.setPlaysIndex = function(data) {
  jsonDataSearch.plays = data;

  // If we are returning org names and ids, use something like this to process and get a list of names
  // var organizationNames = [];
  // for (organization in jsonDataSearch.PlaysIndex) {
  //   organizationNames.push(jsonDataSearch.PlaysIndex[organization].name);
  // }

  // If we are returning just the names, then the raw data is fine
  var playNames = data;

  $('#plays-filter').autocomplete(
    {
      source: playNames,
      appendTo: '#panel-container',
      select: function(event, ui) {
        $("#plays-filter").val(ui.item.label);
        newPlayMap.filters.plays({play_title: ui.item.value});
        newPlayMap.filters.reset(this);
        return false;
      }
    }
  );
}


/*
 * City / State filters
 */
newPlayMap.filters.getArtistsCityStateIndex = function() {
  $.ajax({
    url:  'api/city_state_index.php',
    dataType: 'json',
    data: {'type': 'artists'},
    success: newPlayMap.filters.setArtistsCityStateIndex,
    error: newPlayMap.filters.error
  });
}

newPlayMap.filters.getOrganizationsCityStateIndex = function() {
  $.ajax({
    url:  'api/city_state_index.php',
    dataType: 'json',
    data: {'type': 'organizations'},
    success: newPlayMap.filters.setOrganizationsCityStateIndex,
    error: newPlayMap.filters.error
  });
}

newPlayMap.filters.getEventsCityStateIndex = function() {
  $.ajax({
    url:  'api/city_state_index.php',
    dataType: 'json',
    data: {'type': 'events'},
    success: newPlayMap.filters.setEventsCityStateIndex,
    error: newPlayMap.filters.error
  });
}


newPlayMap.filters.setArtistsCityStateIndex = function(data) {
  $('#artists-city-state-filter').autocomplete(
    {
      source: data,
      appendTo: '#panel-container',
      select: function(event, ui) {
        newPlayMap.filters.artists({city_state: ui.item.value});
        newPlayMap.filters.reset(this);
      }
    }
  );
}

newPlayMap.filters.setOrganizationsCityStateIndex = function(data) {
  $('#organizations-city-state-filter').autocomplete(
    {
      source: data,
      appendTo: '#panel-container',
      select: function(event, ui) {
        newPlayMap.filters.organizations({city_state: ui.item.value});
        newPlayMap.filters.reset(this);
      }
    }
  );
}

newPlayMap.filters.setEventsCityStateIndex = function(data) {
  $('#events-city-state-filter').autocomplete(
    {
      source: data,
      appendTo: '#panel-container',
      select: function(event, ui) {
        newPlayMap.filters.cityStateEvents({city_state: ui.item.value});
        newPlayMap.filters.reset(this);
      }
    }
  );
}

newPlayMap.filters.showAll = function(type) {
  var pluralType = type;
  var singularType = pluralType.substring(0, pluralType.length-1);
  var displayType = newPlayMap.toTitleCase(pluralType.substring(0, pluralType.length-1));
  var template = "show-all-template";
  var container;
  
  newPlayMap.layout.clearEntirePanel();

  container = $('#panel-container .results-container-' + singularType + ' ol.results');

  var len = jsonDataSearch[type].length;

  // Set loading feedback
  newPlayMap.filters.loadingFeedback();

  // Set results title and clear results header text (a.k.a. What's on today)
  $('#results-header').text('');
  newPlayMap.setResultsTitle(displayType, len);

  for (var i = 0; i < len; i++) {

    var item = {
      title: jsonDataSearch[type][i]['label'],
      path: jsonDataSearch[type][i]['path']
    };

    $('#' + template).tmpl(item)
      .appendTo(container);
  }
  
  // Remove loading feedback
  newPlayMap.filters.loadingCompleteFeedback();

  newPlayMap.processAddressLinks('internal-address');
  $('.internal-address').address();
  
  // $(container).find('a').click(function() {
  //   var title = $(this).text();
  //   switch(type) {
  //     case 'plays':
  //       newPlayMap.filters.plays({play_title: title});
  //     break;
  //     
  //     case 'organizations':
  //       newPlayMap.filters.organizations({organization_name: title});
  //     break;
  //     
  //     case 'artists':
  //       newPlayMap.filters.artists({artist_name: title});
  //     break;
  //   }
  // });
  
}
