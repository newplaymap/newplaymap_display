var po = org.polymaps;

var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .center({lat: 36.9741171, lon: -122.0307963})
    .zoom(12)
    .add(po.interact())
    .add(po.hash());

map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a193057ca6040fca68c4ae162bec2da" // http://cloudmade.com/register
    + "/998/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));


map.add(po.geoJson()
    .url("../data/santa_cruz_businesses.json")
    .on("load", load)
    .clip(false)
    .zoom(14));



map.add(po.compass()
    .pan("none"));
    
    
    
function load(e) {
  var cluster = e.tile.cluster || (e.tile.cluster = kmeans()
      .iterations(16)
      .size(64));

  for (var i = 0; i < e.features.length; i++) {
    cluster.add(e.features[i].data.geometry.coordinates);
  }

  var tile = e.tile, g = tile.element;
  while (g.lastChild) g.removeChild(g.lastChild);

  var means = cluster.means();
  means.sort(function(a, b) { return b.size - a.size; });
  for (var i = 0; i < means.length; i++) {
    var mean = means[i], point = g.appendChild(po.svg("circle"));
    point.setAttribute("cx", mean.x);
    point.setAttribute("cy", mean.y);
    point.setAttribute("r", Math.pow(2, tile.zoom - 11) * Math.sqrt(mean.size));
  }
}