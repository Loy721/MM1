export default class EilerScheme {
    dt;

    constructor(dt) {
        this.dt = dt;
    }

    calculateSpeed(v, a) {
        return v + a * this.dt; 
    }

    calculateCoordinate(x, v) {
        return x + v * this.dt;
    }
 }