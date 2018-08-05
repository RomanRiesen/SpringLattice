var World = function (ctx, canv, min, max, dT) {
    this.ctx = ctx;
    this.canv = canv;
    this.min = min || new Vector(-100,-100);//TODO introduce world coordinates everywhere
    this.max = max || new Vector(100,100);
    this.dT = dT || 1;
    this.t = 0;
    this.drag = 0.002;//around 0.001 is reasonable, higher when interactive
    this.objects = [];//list of all objects, updated in world.update
    this.forceField = function(pos){return new Vector(0,0.05);};//()=>{return new Vector(0,0);}
    this.mouseForceFactor = 0.1;
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
        return obj
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

var Dot = function (pos, weight, fixed) {
    this.pos = pos || new Vector(0,0);
    this.vel = new Vector(0,0);
    this.force = new Vector(0,0);
    this.fixed = fixed || false;

    if(weight == 0) {console.warn("Weight == 0 results in divisions by zero!");}
    this.weight = weight || 1;
    this.radius = Math.sqrt(this.weight/Math.PI)*20;
    this.selected = false;


    this.update = world => {
        if(!this.fixed) {
            this.force.addTo(world.forceField(this.pos))
            this.vel.addTo(this.force.multiply(world.dT*1/this.weight))
            this.vel.multiplyBy(1-world.drag);//Todo should k*v^2.
            this.pos.addTo(this.vel.multiply(world.dT));
        }
        this.force = new Vector(0, 0);
    }

    this.draw = world => {
        //ctx.moveTo(this.pos.x, this.pos.y);
        //ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
    }

    this.mousedown = V => {
        if( Math.abs(V.x - this.pos.x) <= this.radius &&
            Math.abs(V.y - this.pos.y) <= this.radius )
            this.selected = true;
    }

    this.mousemove = V => {
        //if(this.selected) this.pos = V;
        if( this.selected ) {
            this.force.addTo(V.subtract(this.pos).multiply(world.mouseForceFactor));
        }
    }

    this.mouseup = V => {
        this.selected = false;
    }
}

var Spring = function (p1, p2, length) {
    this.p1 = p1 || new Dot(Vector(0,0));
    this.p2 = p2 || new Dot(Vector(0,1));
    this.distance = length || this.p1.pos.subtract(this.p2.pos).getLength();
    this.coefficient = 1.0;
    this.maxForce = 20;
    this.torn = false;

    this.update = world => {
        if(this.torn) return;
        var dir = this.p2.pos.subtract(this.p1.pos);
        var gap = dir.getLength();
        dir.divideBy(gap);//normalize dir
        var diff = gap-this.distance
        var force = Math.abs(diff)*this.coefficient
        dir.multiplyBy(force*Math.sign(diff))
        this.p1.force.addTo(dir);
        this.p2.force.addTo(dir.multiply(-1));
        if(dir.getLength() > this.maxForce) this.torn = true;
    };

    this.draw = world => {
        if(this.torn) return;
        ctx.moveTo(this.p1.pos.x, this.p1.pos.y);
        ctx.lineTo(this.p2.pos.x, this.p2.pos.y);
    };
}
