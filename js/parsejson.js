var newplaydata = {};



newplaydata.loadContent = function() {
  var contentData = "http://localhost/newplay/newplaymap_private/data_service/"/*  + "?cache=" + Math.floor(Math.random()*11) */;
  var data = "";

  $.ajax({
    url:  contentData,
    dataType: 'json',
    data: data,
    success: newplaydata.contentLoadSuccess,
    error: newplaydata.loadDataError
  });

  return false;
};


newplaydata.loadDataError = function(data) {
  console.log(data);
  return false;
};

newplaydata.contentLoadSuccess = function(data) {
  console.log(data);
  return false;
};


newplaydata.loadContent();