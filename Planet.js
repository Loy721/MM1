export default class Planet{
    x;
    y;
    Vx;
    Vy;
    mass;
    radius;

    constructor(x, y, Vx, Vy, mass, radius) {
        this.x = x;
        this.y = y;
        this.Vx = Vx;
        this.Vy = Vy;
        this.mass = mass;
        this.radius = radius;
    }
}