var newPlayMap = newPlayMap || {};

// Set up container for filters functions and objects
newPlayMap.filters = {};
var jsonDataSearch = {};

/*
 * Function to find organization feature from the name.
 * Used when submitting the filter form
 */
newPlayMap.filters.organizations = function(data) {
  var pathQuery = "";

  if (data.organization_name !== undefined) {
    pathQuery = "organization_name=" +  data.organization_name;
  }

  if (data.organization_name !== undefined) {
    pathQuery = "organization_type=" +  data.organization_type;
  }

  if (data.national_networks !== undefined) {
    pathQuery = "national_networks=" +  data.national_networks;
  }

  if (data.special_interests !== undefined) {
    pathQuery = "special_interests=" + data.special_interests;
  }


  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: 3,
    clearLayer: true,
    clearLayers: true,
    template: "organization",
    layer: "layer-organization-filter",
    class: "inactive",
    template: "organization-template",
    type: "organization",
    label: "org_type",
    id: "organization_id",
    title: "name",
    dataName: "organizations_filter",
    path: 'api/organizations_filter.php?' + pathQuery,
    dataPath: "api/organizations_filter.php?" + pathQuery,
    icon: "icons/organization.png",
    callback: newPlayMap.loadOrganizationFilter
  });
}

// Load plays
newPlayMap.filters.plays = function(data) {
console.log(data);
  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: 3,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-plays-filter",
    class: "inactive",
    label: "play_title",
    id: "event_id",
    title: "play_title",
    template: "play-template",
    type: "play",
    dataName: "play",
    path: "api/journey.php?path=" +  data.path,
    dataPath: "api/journey.php?path=" +  data.path,
    icon: "icons/play.png",
    grouping_field: "related_play_id",
    callback: newPlayMap.loadJourney
  });
};


newPlayMap.filters.artists = function(data) {
  var pathQuery = "";
  if (data.artist_name !== undefined) {
    pathQuery = "artist_name=" +  data.artist_name;
  }

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: 3,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-artists-filter",
    class: "inactive",
    id: "artist_id",
    label: "ensemble_collective",
    title: "generative_artist",
    template: "artist-template",
    type: "artist",
    dataName: "artists_filter",
    path: "api/artists_filter.php?" + pathQuery,
    dataPath: "api/artists_filter.php?" + pathQuery,
    icon: "icons/artist.png",
    grouping_field: "artist_id",
    callback: newPlayMap.loadArtistFilter
  });
}



newPlayMap.filters.ensemble = function(data) {
  var pathQuery = "";

  if (data.ensemble_collective === "Ensemble / Collective") {
    pathQuery = "ensemble_collective=" +  data.ensemble_collective;
  }

    newPlayMap.loadAPICall({
      data: data,
      zoomLevel: 3,
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
newPlayMap.filters.events = function(data) {
  var pathQuery = "";

  if (data.event_type !== undefined) {
    pathQuery = "event_type=" +  data.event_type;
  }

  if (data.start_date !== undefined) {
    pathQuery = "start_date=" +  data.start_date;
  }

  if (data.end_date !== undefined) {
    pathQuery = "end_date=" +  data.end_date;
  }

  newPlayMap.loadAPICall({
    data: data,
    zoomLevel: 3,
    clearLayer: true,
    clearLayers: true,
    layer: "layer-events-filter",
    class: "inactive",
    id: "event_id",
    label: "play_title", // field which will be used in label
    title: "play_title",
    template: "play-template",
    type: "play",
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

  $('.event-date-field').focus(function() {
    $('#filters .event-date-filter-complete').fadeIn('slow');
    newPlayMap.filters.reset('.event-date-field');
  });

  $('#filters .event-date-filter-complete').hide().click(function(event) {
    event.preventDefault();

    newPlayMap.filters.events({start_date: $('#event-date-filter').val(), end_date: $('#event-to-date-filter').val() });
    return false;
  });

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
  $('#loading-feedback').hide()
}

/*
 * Utility function shared by multiple ajax calls
 */
newPlayMap.filters.error = function(data) {
  console.log('error');

  // @TODO: Maybe remove / gray out the search filter if the index is not available?
}

newPlayMap.filters.feedback = function(message, data) {
  // Can either use an alert or console. Made this to more easily demostrate things to folks without console
  alert(message);
  console.log(data);
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
  jsonDataSearch.organizationsIndex = data;

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
        newPlayMap.filters.organizations({organization_name: ui.item.value});
        newPlayMap.filters.reset(this);
      }
    }
  );
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
  jsonDataSearch.artistsIndex = data;

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
        newPlayMap.filters.artists({artist_name: ui.item.value});
        newPlayMap.filters.reset(this);
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
  jsonDataSearch.playsIndex = data;

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
        newPlayMap.filters.plays({play_title: ui.item.value});
        newPlayMap.filters.reset(this);
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
    success: newPlayMap.filters.setCityStateIndex,
    error: newPlayMap.filters.error
  });
}

newPlayMap.filters.getOrganizationsCityStateIndex = function() {
  $.ajax({
    url:  'api/city_state_index.php',
    dataType: 'json',
    data: {'type': 'organizations'},
    success: newPlayMap.filters.setCityStateIndex,
    error: newPlayMap.filters.error
  });
}

newPlayMap.filters.getEventsCityStateIndex = function() {
  $.ajax({
    url:  'api/city_state_index.php',
    dataType: 'json',
    data: {'type': 'events'},
    success: newPlayMap.filters.setCityStateIndex,
    error: newPlayMap.filters.error
  });
}


newPlayMap.filters.setArtistsCityStateIndex = function(data) {
  // If we are returning just the names, then the raw data is fine
  var cityStateNames = data;
  
  $('#artists-city-state-filter').autocomplete(
    {
      source: cityStateNames.artists,
      appendTo: '#panel-container',
      select: function(event, ui) {
        newPlayMap.filters.cityStateArtists({city_state: ui.item.value});
        newPlayMap.filters.reset(this);
      }
    }
  );
}

newPlayMap.filters.setOrganizationsCityStateIndex = function(data) {
  // If we are returning just the names, then the raw data is fine
  var cityStateNames = data;
  
  $('#organizations-city-state-filter').autocomplete(
    {
      source: cityStateNames.organizations,
      appendTo: '#panel-container',
      select: function(event, ui) {
        newPlayMap.filters.cityStateOrganizations({city_state: ui.item.value});
        newPlayMap.filters.reset(this);
      }
    }
  );
}

newPlayMap.filters.setEventsCityStateIndex = function(data) {
  // If we are returning just the names, then the raw data is fine
  var cityStateNames = data;

  $('#events-city-state-filter').autocomplete(
    {
      source: cityStateNames.events,
      appendTo: '#panel-container',
      select: function(event, ui) {
        newPlayMap.filters.cityStateEvents({city_state: ui.item.value});
        newPlayMap.filters.reset(this);
      }
    }
  );
}
