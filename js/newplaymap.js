// Establish namespaces.
var newPlayMap = newPlayMap || {};
var jsonData = {};
var panelMarkup = {};
var spotlight = {};
var locationsByID = {};
var featuresByLocation = {};
var mm = com.modestmaps;
var map = map || {};
var loaded = 0;
var markers = {};
newPlayMap.routing = {};
newPlayMap.routing.route = {};
newPlayMap.tour = {};
newPlayMap.browserEvents = [];
newPlayMap.filters = newPlayMap.filters || {};
newPlayMap.loadingStack = newPlayMap.loadingStack || [];
newPlayMap.loadingStackCallbacks = newPlayMap.loadingStackCallbacks || $.Callbacks();

window.onload = function() {
  newPlayMap.alterHomepage();       // Change basic layout of page.
  newPlayMap.loadMap();             // Load map tiles & trigger data to load.
  newPlayMap.initializeFilters();   // Add interaction to filters in sidebar panel
  newPlayMap.tourInteraction();     // Set up tour interaction
};

newPlayMap.loadMap = function(callback){
  // Load map tiles.
  //newPlayMap.loadWax();
  // for map debugging:
   newPlayMap.initMapSimple();
};

newPlayMap.alterHomepage = function() {
/*   $('div#panel-container div#panel div.content').hide(); */

  newPlayMap.formatLinksBubble($('#block-add_button-0'), 'add_button');

  // Set up some links to trigger default content
  $('.reset-map').click(function() {
    newPlayMap.loadDefaultContent();

    // Close Filters
    $('#filter-container:visible').slideUp();
  });

  // Pull welcome links from drupal site
  newPlayMap.setWelcomeLinks();

  return false;
};

newPlayMap.loadWax = function() {
  // Custom tiles
  var url = 'http://a.tiles.mapbox.com/v3/newplaymap.map-m3r2xeuk.jsonp' + '?cache=' + Math.floor(Math.random()*11);

  wax.tilejson(url, function(tj) {
    newPlayMap.initMap(tj);
    }
  );
};

// Wax calls this and the map variable is relevant to what Wax loads
newPlayMap.initMap = function(tj) {
  map = new com.modestmaps.Map('map',
    new wax.mm.connector(tj), null, [
        new easey.DragHandler(),
        new easey.TouchHandler(),
        new easey.DoubleClickHandler(),
        new easey.MouseWheelHandler()
    ]);
  var zoomer = wax.mm.zoomer(map)
  zoomer.appendTo('map');

  //map.setCenterZoom(new MM.Location(37.811530, -110.2666097), 3);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);


  markers = new MM.MarkerLayer();
  map.addLayer(markers);
  markers.parent.setAttribute("id", "markers");

  // Load map marker layers.
  var data = newPlayMap.loadMapData();

  // Run data layers closure.
  data();
};

newPlayMap.initMapSimple = function() {
  map = new MM.Map('map', new MM.TemplatedLayer("http://tile.openstreetmap.org/{Z}/{X}/{Y}.png")/*
, null, [
        new easey.DragHandler(),
        new easey.TouchHandler(),
        new easey.DoubleClickHandler(),
        new easey.MouseWheelHandler()
    ]
*/);
  var zoomer = wax.mm.zoomer(map)
  zoomer.appendTo('map');

  newPlayMap.recenterMap(map);

  // Load interactive behavior.
  spotlight = new SpotlightLayer();
  map.addLayer(spotlight);


  markers = new MM.MarkerLayer();
  map.addLayer(markers);
  markers.parent.setAttribute("id", "markers");

  // Load map marker layers.
  var data = newPlayMap.loadMapData();

  // Run data layers closure.
  data();
};

newPlayMap.recenterMap = function(map) {
  // Find appropriate zoom level
  newPlayMap.defaultZoom = 2;

  var defaultZoom = newPlayMap.defaultZoom,
      defaultLat = 25.8620,
      defaultLon = 67.4684;

  if (window.outerWidth > 1900) {
    defaultZoom = 2.5;
  }
  else if (window.outerWidth > 1000) {
    // Use defaults
  }
  else {
    defaultLon = 94.1871;
    defaultZoom = 1;
  }

  map.setCenterZoom(new MM.Location(defaultLat, defaultLon), defaultZoom);
}

newPlayMap.loadMapData = function() {
  return function () {
    newPlayMap.loadData();
  }
};

newPlayMap.initializeFilters = function() {
  newPlayMap.processFilters();

  $('#explore-filters-button').click(function() {
    $('#filter-container').slideDown();
    // newPlayMap.loadDefaultContent();
    newPlayMap.filters.showAll('plays');
    newPlayMap.recenterMap(map);
    newPlayMap.data.clearAllLayers();
  });
}

newPlayMap.processFilters = function() {
  newPlayMap.filters.setupFilters();

  $('#filters form').tabs();

  $('#filters-hide span').click(function() {
    $('#filter-container').slideUp();
  });

  $('#explore-plays .show-all-link').click(function() {
    newPlayMap.filters.showAll('plays');
  });

  $('#explore-organizations .show-all-link').click(function() {
    newPlayMap.filters.showAll('organizations');
  });

  $('#explore-artists .show-all-link').click(function() {
    newPlayMap.filters.showAll('artists');
  });

  $('#explore-filters-button').addClass('processed');
};

newPlayMap.loadData = function() {
    // newPlayMap.loadJSONFile({
    //   path: 'api/organizations.php',
    //   type: "organization",
    //   template: "organization",
    //   label: "org_type",
    //   layer: "layer-organizations",
    //   id: "organization_id",
    //   title: "name",
    //   dataName: "organizations",
    //   dataPath: 'api/organizations.php',
    //   icon: "icons/organization.png",
    //   grouping_field: "organization_id",
    //   callback: newPlayMap.loadOrganization
    // });
    // newPlayMap.loadJSONFile({
    //   path: 'api/artists.php',
    //   type: "artist",
    //   template: "artist",
    //   layer: "layer-artists",
    //   id: "artist_id",
    //   label: "ensemble_collective",
    //   title: "generative_artist",
    //   dataName: "artists",
    //   dataPath: 'api/artists.php',
    //   icon: "icons/artist.png",
    //   grouping_field: "artist_id",
    //   callback: newPlayMap.loadArtist
    // }
    // );
    // newPlayMap.loadJSONFile({
    //     path: 'api/events.php',
    //     type: "event",
    //     template: "event",
    //     layer: "layer-events",
    //     id: "event_id",
    //     label: "related_theater", // field which will be used in label
    //     title: "play_title",
    //     dataName: "events",
    //     dataPath: 'api/events.php',
    //     icon: "icons/event.png",
    //     grouping_field: "event_id",
    //     related_play_id: "related_play_id",
    //     callback: newPlayMap.loadEvent
    //   }
    // );

    // Get path from browser and load content.
    newPlayMap.loadPageRouter();
};


newPlayMap.setWelcomeLinks = function() {
  $.ajax({
    url: 'participate/welcome-links',
    success: function(data) {
      if (data != '') {
        $('#header-register').html(data);
      }
    },
    complete: function() {
      $('#header-register').fadeIn('slow');
    }
  });
}


newPlayMap.loadPageRouter = function() {
  // Listen for address.
  $.address.change(function(event) {
    newPlayMap.browserEvents.push(event);
    newPlayMap.routing.path = newPlayMap.splitPath(event);
    if(newPlayMap.routing.path !== undefined) {
      if(newPlayMap.routing.path.args !== undefined) {
        switch(newPlayMap.routing.path.args[0]) {
          case 'play':
            newPlayMap.filters.playJourney({path: newPlayMap.routing.path.base});
            break;
          case 'artist':
            newPlayMap.filters.artists({path: newPlayMap.routing.path.base});
            break;
          case 'organization':
            newPlayMap.filters.organizations({path: newPlayMap.routing.path.base});
            break;
          case 'explore':
            // Open tabs and select correct tab
            // @TODO: Somehow set up filters and show them. Not working since we moved the setup to click
            //        rather than on page load to speed things up.
            if (newPlayMap.hasContentBeenLoaded() == false) {
              $('#filter-container').slideDown();

              // If it's on initial page load, load default
              newPlayMap.loadDefaultContent();
            }
            $('#filters form').tabs('select', 0);
          break;
          case 'explore-plays':
            // Open tabs and select correct tab
            // @TODO: Somehow set up filters and show them. Not working since we moved the setup to click
            //        rather than on page load to speed things up.
            if (newPlayMap.hasContentBeenLoaded() == false) {
              $('#filter-container').slideDown();

              // If it's on initial page load, load default
              newPlayMap.loadDefaultContent();
            }
            $('#filters form').tabs('select', 0);
          break;
          case 'explore-organizations':
            // Open tabs and select correct tab
            // @TODO: Somehow set up filters and show them. Not working since we moved the setup to click
            //        rather than on page load to speed things up.
            if (newPlayMap.hasContentBeenLoaded() == false) {
              $('#filter-container').slideDown();

              // If it's on initial page load, load default
              newPlayMap.loadDefaultContent();
            }
            $('#filters form').tabs('select', 1);
          break;
          case 'explore-artists':
            // Open tabs and select correct tab
            // @TODO: Somehow set up filters and show them. Not working since we moved the setup to click
            //        rather than on page load to speed things up.
            if (newPlayMap.hasContentBeenLoaded() == false) {
              newPlayMap.processFilters();
              $('#filter-container').slideDown();

              // If it's on initial page load, load default
              newPlayMap.loadDefaultContent();
            }
            $('#filters form').tabs('select', 2);
          break;
          case 'all-artists':
            if (newPlayMap.hasContentBeenLoaded() == false) {
              // If it's on initial page load, load default
              newPlayMap.loadDefaultContent();
            }
            // newPlayMap.filters.showAll('artists'); // the index isn't built yet
          break;
          case 'all-organizations':
            if (newPlayMap.hasContentBeenLoaded() == false) {
              // If it's on initial page load, load default
              newPlayMap.loadDefaultContent();
            }
            // newPlayMap.filters.showAll('organizations'); // the index isn't built yet
          break;
          case 'all-plays':
            if (newPlayMap.hasContentBeenLoaded() == false) {
              // If it's on initial page load, load default
              newPlayMap.loadDefaultContent();
            }
            // newPlayMap.filters.showAll('plays'); // the index isn't built yet
          break;
          case 'tour':
            newPlayMap.loadDefaultContent();
            newPlayMap.tourStart();
          break;
        }
      }
      else {
        newPlayMap.loadDefaultContent();
      }
    }

    return false;
  });

  // bind address to all a links (@TODO may also need divs)
  newPlayMap.processAddressLinks('internal-address');
  $('.internal-address').address();

  // Force address to update on page load.
  // Note: there are multiple conditions to test:
  // -- refresh,reload + home, play+event_id,play, and the page loading, and clicking first time, and subsequent clicks.
  // -- Clear the pins before the reload to prevent duplicate pins. @TODO: Figure out why this needs to load twice and if possible remove both these function calls.
  newPlayMap.data.clearAllLayers();
  $.address.update();
};


/*
 * Function to load default content (right now What's on Today)
 */
newPlayMap.loadDefaultContent = function() {
  // Default to what's on today
  var today = new Date();
  var formattedDate = $.datepicker.formatDate('MM dd, yy', today);
  // console.log('default');
  var todayHeader = "What's Happening Today";

  // Clear out any panel content
  newPlayMap.layout.clearPanelContent();

  // Clear out any results content
  newPlayMap.layout.clearResults();

  // Load What's on Today
  newPlayMap.filters.events({ start_date: formattedDate, end_date: formattedDate, highlight: "off" }, todayHeader);

  // Recenter map
  newPlayMap.recenterMap(map);
}


/*
 * Function to check if content has been loaded
 */
newPlayMap.hasContentBeenLoaded = function() {
  // if (jsonData.events_filter.count > 0 || jsonData.organizations_filter.count > 0 || jsonData.artists_filter.count > 0) {
  if (typeof jsonData.events_filter === 'undefined' && typeof jsonData.organizations_filter === 'undefined' && typeof jsonData.artists_filter === 'undefined') {
    return false;
  }
  else {
    return true;
  }
}


/**
 * Function to format qtip links
 *
 * element is a jquery object
 */
newPlayMap.formatLinksBubble = function(element, newId, width) {
  if (element.hasClass('links-processed')) {
    // return;
  } else {
    // Figure out title
    var linkText = 'Link';
    if (element.children('h2').length > 0) {
      linkText = element.children('h2').remove().html();
    } else if (element.find('h3').length > 0) {
      linkText = element.find('h3').remove().html();
    }
    // Use width if it's there
    var width = width || 215;
    // Build button
    $('<a></a>')
      .attr({
        'id': newId,
        'href': '#'
      })
      .click(function(event) {
        event.preventDefault();
      })
      .css('cursor', 'pointer')
      .html(linkText)
      .insertBefore(element);

    // Add links as tool tip
    $('#' + newId).qtip({
      content: element.find('.content'),
      // content: element.find('.item-list ul'),
      position: {
        adjust: {
          screen: true
      },
      corner: {
       target: 'bottomMiddle',
       tooltip: 'topMiddle'
      }
      },
      show: 'click',
      hide: {
       when: 'unfocus',
       fixed: false
      },

      style: {
       width: width,
       'color': '#000000',
       'padding': '0',
       background: '#FFFFFF',
       border: {
         width: 7,
         color: '#FFFFFF',
         radius: 12
       },
       tip: {
         corner: 'topMiddle',
         size: {
           x: 40,
           y: 15
         }
       }
      }

    });

    element.addClass('links-processed');
    element.hide();
    // element.remove();

  }
}

/*
 * Embedable Badge Block
 * Direct link URL
 */
// Function for showing form to include selecting text etc
newPlayMap.embedToggle = function() {
  $('.qtip-content #embed-code').slideToggle('fast', function() {
    $('.qtip-content input#embed-code input').select();
  });
}

newPlayMap.shareLinkToggle = function() {
  $('.qtip-content #share-code').slideToggle('fast', function() {
    $('.qtip-content input#share-code input').select();
  });
}

newPlayMap.embedInteraction = function() {
  var target = $('.qtip-content #embed-link');
  if (target.hasClass('processed')) {
    return;
  }
  else {
    target
      .addClass('processed')
      .click(function(event) {
        event.preventDefault();
        newPlayMap.embedToggle();
      });

    $('.qtip-content #embed-code').hover(function() {
      $('.qtip-content #embed-code input').select();
    });
  }
}

newPlayMap.shareInteraction = function() {
  var target = $('.qtip-content .share-link');
  if (target.hasClass('processed')) {
    return;
  }
  else {
    target
      .addClass('processed')
      .click(function(event) {
        event.preventDefault();
        newPlayMap.shareLinkToggle();
      });

    $('.qtip-content #share-code').hover(function() {
      $('.qtip-content #share-code input').select();
    });
  }
}

newPlayMap.tourInteraction = function() {
  // If you don't want the tour to launch automatically, comment out:
  // -- newPlayMap.loadingStackCallbacks.add(newPlayMap.tourStart()); below
  // -- $.cookie('newplaymap_tour', true); in newPlayMap.tourStart function
  // Queue start tour for when the filters are done
  if ($.cookie('newplaymap_tour') != 'true') {
    newPlayMap.loadingStackCallbacks.add(newPlayMap.tourStart);
  }

  // Add start tour link
  $('<a></a>')
    .text('Tour')
    .addClass('start-tour')
    .attr('href', 'tour')
    .click(function(event) {
      event.preventDefault();
      newPlayMap.tourStart();
    })
    .wrap('<li></li>')
    .parent()
    .insertBefore('#header-links ul.nav li:last');

  // Close button functionality
  $('#tour-exit').click(function() {
    // Hide the tour and all arrows
    newPlayMap.tourStop();
  });

  $('#tour-controls .tour-next').click(function() {
    if ($(this).hasClass('inactive') == false) {
      // If this isn't the last step...
      if ($('.tour-step.active').hasClass('last') == false) {
        // Move to the next slide
        $('.tour-step.active').hide().removeClass('active').next().show().addClass('active');
        newPlayMap.setTourControlsStatus();
        newPlayMap.setTourArrows();
      }
    }
  });

  $('#tour-controls .tour-previous').click(function() {
    if ($(this).hasClass('inactive') == false) {
      // If this isn't the first step...
      if ($('.tour-step.active').hasClass('first') == false) {
        // Move to the previous slide
        $('.tour-step.active').hide().removeClass('active').prev().show().addClass('active');
        newPlayMap.setTourControlsStatus();
        newPlayMap.setTourArrows();
      }
    }
  });
}

newPlayMap.tourStart = function() {
  $('#tour').show();
  $('#tour-overlay').show();
  $('.tour-step.first').addClass('active').show();
  // Add the arrows for the first slide
  newPlayMap.setTourArrows();
  $.cookie('newplaymap_tour', true, {expires: 91});
}

newPlayMap.tourStop = function() {
  $('.tour-step').removeClass('active').hide();
  $('#tour').hide();
  $('.tour-arrows').remove();
  $('#tour-overlay').hide();
  $('#tour-controls .tour-counter .tour-counter-current').text(1);
  $('#tour-controls .tour-previous').addClass('inactive');
  $('#tour-controls .tour-next').removeClass('inactive');
}

newPlayMap.setTourControlsStatus = function() {
  // Set the controls status
  if ($('.tour-step.active').hasClass('first') == true) {
    $('#tour-controls .tour-previous').addClass('inactive');
  }
  else if ($('.tour-step.active').hasClass('last') == true) {
    $('#tour-controls .tour-next').addClass('inactive');
  }
  else {
    $('#tour-controls .inactive').removeClass('inactive');
  }

  // Set the number
  var currentSlideNumber = $('.tour-step.active').attr('id').replace('tour-step', '');
  $('#tour-controls .tour-counter .tour-counter-current').text(currentSlideNumber);
}

newPlayMap.setTourArrows = function() {
  var step = $('.tour-step.active').attr('id').replace('tour-step', '');
  var target = '';
  var arrowImageOffset = 0;
  var arrowDelay = 250;
  var arrowFadeTime = 800;
  var clearTimers = function() {
    clearTimeout(newPlayMap.tour.step1Timer);
    clearTimeout(newPlayMap.tour.step2Timer);
    clearTimeout(newPlayMap.tour.step3Timer);
  };

  // Clear out old arrows
  var clearArrows = function() {
    $('.tour-arrows').remove();
  };
  clearArrows();

  if (step == null) {
    return;
  }
  else if (step == 1) {
    clearTimers();

    target = $('#panel-container').offset();
    arrowImageOffset = 107;

    newPlayMap.tour.step1Timer = setTimeout(function() {
      clearArrows();
      $('<div></div>').addClass('tour-arrows right').appendTo('body').css({
        'left': target.left - arrowImageOffset - 50,
        'top': '50%'
      })
      .animate({
        opacity: 1,
        left: '+=50'
      }, arrowFadeTime, function(){});

      $('#filter-container:visible').slideUp();
    }, arrowDelay);
  }
  else if (step == 2) {
    // Top explore button arrow
    clearTimers();

    newPlayMap.tour.step2Timer = setTimeout(function() {
      clearArrows();

      topTarget = $('#explore-filters-button').offset();
      $('<div></div>').addClass('tour-arrows up').appendTo('body').css({
        'top': topTarget.top + 36 + 50,
        'left': topTarget.left + 30
      })
      .animate({
        opacity: 1,
        top: '-=50'
      }, arrowFadeTime, function(){});

      // Right filter arrow
      $('#filter-container').slideDown();
      target = $('#filter-container').offset();
      arrowImageOffset = 107;
      $('<div></div>').addClass('tour-arrows right').appendTo('body').css({
        'top': target.top + 75,
        'left': target.left - arrowImageOffset - 50
      })
      .animate({
        opacity: 1,
        left: '+=50'
      }, arrowFadeTime, function(){});
    }, arrowDelay);


  }
  else if (step == 3) {
    clearTimers();

    target = $('#add_button').offset();
    arrowImageOffset = 107;

    newPlayMap.tour.step3Timer = setTimeout(function() {
      clearArrows();
      $('<div></div>').addClass('tour-arrows up').appendTo('body').css({
        'top': target.top + 36 + 50,
        'left': target.left + 60
      })
      .animate({
        opacity: 1,
        top: '-=50'
      }, arrowFadeTime, function(){});
    }, arrowDelay);

    $('#filter-container:visible').slideUp();
  }
}
