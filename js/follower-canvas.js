// namespacing!
if (!com) {
    var com = { };
    if (!com.modestmaps) {
        com.modestmaps = { };
    }
}

(function(MM) {

    MM.Follower = function(map, location, content)
    {
        this.coord = map.locationCoordinate(location);
        
        // Deal with content first so that we can figure out the height
        var width = 130;
        var tempContent = $('<div></div>').text(content).hide().width(150).appendTo('body');
        var height = tempContent.height();
        tempContent.remove();
      
        
        this.offset = new MM.Point(0, 0);
        this.margin = new MM.Point(10, 10);
        this.dimensions = new MM.Point(width + this.margin.x + this.margin.x, height + this.margin.y + this.margin.y);
        this.offset = new MM.Point(-this.dimensions.x/2, -this.dimensions.y -10);
        
        var contentDiv = document.createElement('div');
        contentDiv.innerHTML = content;
        contentDiv.style.position = 'absolute';
        contentDiv.style.left = '0px';
        contentDiv.style.top = '0px';
        contentDiv.style.overflow = 'hidden';    
        contentDiv.style.width = width + 'px'; 
        contentDiv.style.padding = this.margin.y + 'px ' + this.margin.x + 'px ' + this.margin.y + 'px ' + this.margin.x + 'px';

        var follower = this;
        
        var callback = function(m, a) { return follower.draw(m); };
        map.addCallback('drawn', callback);
        
        this.div = document.createElement('div');
        this.div.className = 'bubble';
        this.div.style.position = 'absolute';
        this.div.style.width = this.dimensions.x + 'px';
        this.div.style.height = this.dimensions.y + 'px';
        
        // this.div.style.backgroundColor = 'rgba(0,0,0,0.8)';
        // this.div.style.color = '#FFFFFF';
        // this.div.style.border = 'solid black 1px';
    
        // var bubble = document.createElement('canvas');
        // this.div.appendChild(bubble);
        // if (typeof G_vmlCanvasManager !== 'undefined') bubble = G_vmlCanvasManager.initElement(bubble);
        // bubble.style.position = 'absolute';
        // bubble.style.left = '0px';
        // bubble.style.top = '0px';
        // bubble.width = this.dimensions.x;
        // bubble.height = this.dimensions.y;
        // var bubCtx = bubble.getContext('2d');
        // bubCtx.strokeStyle = 'black';
        // bubCtx.fillStyle = 'white';
        // this.drawBubblePath(bubCtx);
        // bubCtx.fill();    
        // bubCtx.stroke();    
        
        this.div.appendChild(contentDiv);
        
        MM.addEvent(contentDiv, 'mousedown', function(e) {
            if(!e) e = window.event;
            return MM.cancelEvent(e);
        });
        
        map.parent.appendChild(this.div);
        
        this.draw(map);
    }
    
    MM.Follower.prototype = {
    
        div: null,
        coord: null,
        
        offset: null,
        dimensions: null,
        margin: null,
    
        draw: function(map) {
            try {
                var point = map.coordinatePoint(this.coord);
            } catch(e) {
                console.error(e);
                // too soon?
                return;
            }
            
            if(point.x + this.dimensions.x + this.offset.x < 0) {
                // too far left
                this.div.style.display = 'none';
            
            } else if(point.y + this.dimensions.y + this.offset.y < 0) {
                // too far up
                this.div.style.display = 'none';
            
            } else if(point.x + this.offset.x > map.dimensions.x) {
                // too far right
                this.div.style.display = 'none';
            
            } else if(point.y + this.offset.y > map.dimensions.y) {
                // too far down
                this.div.style.display = 'none';
    
            } else {
                this.div.style.display = 'block';
                MM.moveElement(this.div, { 
                    x: Math.round(point.x + this.offset.x),
                    y: Math.round(point.y + this.offset.y),
                    scale: 1,
                    width: this.dimensions.x,
                    height: this.dimensions.y
                });
            }
        },
        
        drawBubblePath: function(ctx) {
            ctx.beginPath();
            ctx.moveTo(10, this.dimensions.y);
            ctx.lineTo(35, this.dimensions.y-25);
            ctx.lineTo(this.dimensions.x-10, this.dimensions.y-25); 
            ctx.quadraticCurveTo(this.dimensions.x, this.dimensions.y-25, this.dimensions.x, this.dimensions.y-35);
            ctx.lineTo(this.dimensions.x, 10);
            ctx.quadraticCurveTo(this.dimensions.x, 0, this.dimensions.x-10, 0);
            ctx.lineTo(10, 0);
            ctx.quadraticCurveTo(0, 0, 0, 10);
            ctx.lineTo(0, this.dimensions.y-35);
            ctx.quadraticCurveTo(0, this.dimensions.y-25, 10, this.dimensions.y-25);
            ctx.lineTo(15, this.dimensions.y-25);
            ctx.moveTo(10, this.dimensions.y);
        }
    
    };
    
})(com.modestmaps)
