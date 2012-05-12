// Establish namespaces.
var newPlayMap = {};
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
newPlayMap.browserEvents = [];

window.onload = function() {
  newPlayMap.alterHomepage();   // Change basic layout of page.
  newPlayMap.loadMap();         // Load map tiles & trigger data to load.
  newPlayMap.processFilters();  // Add interaction to filters in sidebar panel
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

  // Find appropriate zoom level
  newPlayMap.defaultZoom = 3;

  var defaultZoom = newPlayMap.defaultZoom,
      defaultLat = 50.811530,
      defaultLon = -90.2666097;
  
  if (window.outerWidth > 1900) {
    defaultLat = 40.811530;
    defaultZoom = 5;
  }
  else if (window.outerWidth > 1000) {
    defaultLat = 40.811530;
    defaultLon = -80.2666097;
    defaultZoom = 4;
  }
  else {
    defaultLat = 40.811530;
    defaultLon = -65.2666097;
    defaultZoom = 3;
  }
  
  map.setCenterZoom(new MM.Location(defaultLat, defaultLon), defaultZoom);

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

newPlayMap.loadMapData = function() {
  return function () {
    newPlayMap.loadData();
  }
};

newPlayMap.processFilters = function() { 
  $('#explore-filters-button').click(function() {
    // newPlayMap.filters.loadingFeedback();
    
    newPlayMap.filters.setupFilters();

    $('#filters form').tabs();
    
    $('#explore-plays .show-all-link').click(function() {
      newPlayMap.filters.showAll('plays');
    });  

    $('#explore-organizations .show-all-link').click(function() {
      newPlayMap.filters.showAll('organizations');
    });  

    $('#explore-artists .show-all-link').click(function() {
      newPlayMap.filters.showAll('artists');
    });
    
    $('#filter-container').slideToggle();
  });


  // @TODO: If we are loading pins initially, then comment this out. 
  //        The load function will take care of removing feedback.
  // $('#loading-feedback').hide();
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


newPlayMap.loadPageRouter = function() { 
  // Listen for address.
  $.address.change(function(event) {
    newPlayMap.browserEvents.push(event);
    newPlayMap.routing.path = newPlayMap.splitPath(event);
    if(newPlayMap.routing.path !== undefined) {
      if(newPlayMap.routing.path.args !== undefined) {
        switch(newPlayMap.routing.path.args[0]) {
          case 'play':
            newPlayMap.filters.plays({path: newPlayMap.routing.path.base});
            break;
          case 'artist':
            newPlayMap.filters.artists({path: newPlayMap.routing.path.base});
            break;
          case 'organization':
            newPlayMap.filters.organizations({path: newPlayMap.routing.path.base});
            break;
        }
      }
      else {
        // Default to what's on today
        var today = new Date();
        var formattedDate = $.datepicker.formatDate('MM dd, yy', today);
        newPlayMap.filters.events({ start_date: formattedDate, end_date: formattedDate, highlight: "off" });
      }
    }
    
    return false;
  });

  // bind address to all a links (@TODO may also need divs)
  // @TODO: Turn this back on once it can be selectively set to not all <a> tags
  $('a').address();

  // Force address to update on page load.
  // Note: there are multiple conditions to test:
  // -- refresh,reload + home, play+event_id,play, and the page loading, and clicking first time, and subsequent clicks.
  $.address.update();
};

/*
 * Process links so we can selectively use the address()
 */
newPlayMap.processAddressLinks = function(className, target) {
  if (target == undefined) {
    var target = 'a';
  }
  console.log($(target));
  $(target).each(function(){
    var path = $(this).attr('href');

    if(path !== undefined) {
      if(path.substr(0,5) === '/node') {
      }
      else if(path.substr(0,4) === 'node') {
      }
      else if(path.substr(-4,4) === 'feed') {
      }
      else if(path.substr(0,7) === '/admin/') {
      }
      else if((path.substr(0,4) === 'http') || (path.substr(0,5) === '/http')) {
      }
      else if(path.length == 1) {
      }
      else {
        $(this).addClass(className);
      }
    }
  });
  return true;
};


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
    
  }
}