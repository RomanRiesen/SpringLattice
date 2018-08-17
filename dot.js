
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
            this.force.addTo(world.forceField(this.pos));
            //calculate the drag:
            this.vel.multiplyBy(1-world.drag);//Todo should subtract drag*v^2 from force (as below, but I prefer this in interaction)
            //const v = this.vel.getLength();
            //this.force.subtractFrom(this.force.divide(this.force.getLength()).multiply(-v*v*world.drag));
            //update the variables
            this.vel.addTo(this.force.multiply(world.dT*1/this.weight));
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
            this.force.addTo(V.subtract(this.pos).multiply(world.mouseForceFactor));//TODO should mouseForceFactor depend on dT??
        }
    }

    this.mouseup = V => {
        this.selected = false;
    }
}
