var World = function (ctx, canv, min, max, dT) {
    this.ctx = ctx;
    this.canv = canv;
    this.min = min || new Vector(0,0);
    this.max = max || new Vector(0,0);
    this.dT = dT || 1;
    this.t = 0;
    this.drag = 0.01;//around 0.001 is reasonable, higher when interactive
    this.objects = [];//list of all objects, updated in world.update

    this.update = () => {
        ctx.clearRect(0,0,this.canv.width,this.canv.height)
        this.t += this.dT;
        this.objects.map(o => o.update(this));
        this.objects.map(o => o.draw(this));
    }

    this.addObject = obj => {
        obj.draw(this);
        this.objects.push(obj);
        return obj
    }

    this.normalizeMousePosition = e => {
        var rect = this.canv.getBoundingClientRect();
        canvMousePos = new Vector();
        canvMousePos.x = e.clientX - rect.left;
        canvMousePos.y = e.clientY - rect.top;
        return canvMousePos;
    }

    canv.onmousedown = e => {
        this.objects.map(o => {if(o.mousedown) o.mousedown(this.normalizeMousePosition(e))})
    };

    canv.onmousemove = e => {
        this.objects.map(o => {if(o.mousemove) o.mousemove(this.normalizeMousePosition(e))})
    };

    canv.onmouseup = e => {
        this.objects.map(o => {if(o.mouseup) o.mouseup(this.normalizeMousePosition(e))})
    };
}

var Dot = function (pos, weight) {
    this.pos = pos || new Vector(0,0);
    this.vel = new Vector(0,0);
    this.force = new Vector(0,0);

    if(weight == 0) {console.warn("Weight == 0 results in divisions by zero!");}
    this.weight = weight || 1;
    this.radius = Math.sqrt(this.weight/Math.PI)*20;
    this.selected = false;


    this.update = world => {
        this.vel.addTo(this.force.multiply(world.dT*1/this.weight))
        this.vel.multiplyBy(1-world.drag);//Todo should k*|v|^2.
        this.pos.addTo(this.vel.multiply(world.dT));
        this.force = new Vector(0, 0);
    }

    this.draw = world => {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*Math.PI);
        ctx.stroke();
    }

    this.mousedown = V => {
        if( Math.abs(V.x - this.pos.x) <= this.radius &&
            Math.abs(V.y - this.pos.y) <= this.radius )
            this.selected = true;
    }

    this.mousemove = V => {
        //if(this.selected) this.pos = V;
        if( this.selected ) {
            this.force.addTo(V.subtract(this.pos))
        }
    }

    this.mouseup = V => {
        this.selected = false;
    }
}

var Spring = function (p1, p2, length) {
    this.p1 = p1 || new Dot(Vector(0,0));
    this.p2 = p2 || new Dot(Vector(0,1));
    this.distance = length || p1.pos.subtract(p2.pos).getLength();
    this.coefficient = 1;

    this.update = world => {
        var dir = this.p2.pos.subtract(this.p1.pos);
        var gap = dir.getLength();
        dir.divideBy(gap);//normalize dir
        var diff = gap-this.distance
        var force = Math.abs(diff)*this.coefficient
        dir.multiplyBy(force*Math.sign(diff))
        p1.force.addTo(dir);
        p2.force.addTo(dir.multiply(-1));
    };

    this.draw = world => {
        ctx.beginPath();
        ctx.moveTo(p1.pos.x, p1.pos.y);
        ctx.lineTo(p2.pos.x, p2.pos.y);
        ctx.stroke();
    };
}


