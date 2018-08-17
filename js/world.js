
var World = function (ctx, canv, min, max, dT) {
    this.ctx = ctx;
    this.canv = canv;
    this.min = min || new Vector(-100,-100);//TODO introduce world coordinates everywhere
    this.max = max || new Vector(100,100);
    this.dT = dT || 1;
    this.t = 0;
    this.drag = 0.002;//around 0.001 is reasonable, higher when interactive
    this.objects = [];//list of all objects, updated in world.update
    this.forceField = ()=>{return new Vector(0,0);}//function(pos){return new Vector(Math.random()/10-Math.random()/20,0.05);};//
    this.mouseForceFactor = 0.8;
    this.canvRect = this.canv.getBoundingClientRect();//FIXME Must be updated on windowsize change

    this.update = () => {
        ctx.clearRect(0,0,this.canv.width,this.canv.height);
        this.t += this.dT;
        this.objects.map(o => o.update(this));
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.objects.map(o => o.draw(this));
        this.ctx.stroke();
    }

    this.addObject = obj => {
        obj.draw(this);
        this.objects.push(obj);
        return obj;
    }

    this.toWorldVector = vec => {
        var ret = new Vector();
        ret.x = (vec.x / this.canvRect.width)*Math.abs(this.max.x - this.min.x)+this.min.x;
        ret.y = (vec.y / this.canvRect.height)*Math.abs(this.max.y - this.min.y)+this.min.x;
        return ret;
    }

    this.toCanvasCoordinates = vec => {
        var ret = new Vector();
        ret.x = ((vec.x-this.min.x) / Math.abs(this.max.x - this.min.x)) * this.canvRect.width;
        ret.y = ((vec.y-this.min.x) / Math.abs(this.max.y - this.min.y)) * this.canvRect.height;
        return ret;
    }

    this.normalizeMousePosition = (e, world) => {
        return new Vector(e.offsetX, e.offsetY)
    }

    canv.onmousedown = e => {
        var v = this.normalizeMousePosition(e, world)
        this.objects.map(o => {if(o.mousedown) o.mousedown(v)})
    };

    canv.onmousemove = e => {
        var v = this.normalizeMousePosition(e, world);
        this.objects.map(o => {if(o.mousemove) o.mousemove(v)})
    };

    canv.onmouseup = e => {
        var v = this.normalizeMousePosition(e, world)
        this.objects.map(o => {if(o.mouseup) o.mouseup(v)})
    };

    canv.ontouchstart = e => {e.preventDefault(); canv.onmousedown(e);}
    canv.ontouchmove = e => {e.preventDefault(); canv.onmousemove(e);}
    canv.ontouchend = e => {e.preventDefault(); canv.onmouseup(e);}

}
