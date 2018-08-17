
var Spring = function (p1, p2, length) {
    //Expects 2 Dots and the length of the spring
    this.p1 = p1 || new Dot(Vector(0,0));
    this.p2 = p2 || new Dot(Vector(0,1));
    this.distance = length || this.p1.pos.subtract(this.p2.pos).getLength();
    this.coefficient = 1.0;
    this.destructable = false;
    this.maxForce = 75;
    this.torn = false;

    this.update = world => {
        if(this.torn) return;
        var dir = this.p2.pos.subtract(this.p1.pos);
        const gap = dir.getLength();
        dir.divideBy(gap);//normalize dir
        const diff = gap-this.distance;
        var force = Math.abs(diff)*this.coefficient;
        const f = dir.multiply(force*Math.sign(diff));
        this.p1.force.addTo(f);
        this.p2.force.addTo(f.multiply(-1));
        if(gap > this.maxForce && this.destructable) this.torn = true;
    };

    this.draw = world => {
        if(this.torn) return;
        ctx.moveTo(this.p1.pos.x, this.p1.pos.y);
        ctx.lineTo(this.p2.pos.x, this.p2.pos.y);
    };
}
