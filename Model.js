export default class Model {
    static #G = 6.67430*Math.pow(10,-11);

    time;
    dt;
    planets = new Array();
    defferentScheme;

    constructor(time, dt, planets, defferentScheme){
        this.time = time;
        this.planets = planets;
        this.dt = dt;
        this.defferentScheme = defferentScheme;
    }

    setCoordinatePlanet() {
        for(let i = 0; i < this.planets.length; ++i) {
            currentPlanet = this.planets[numberOfPlanet];
            ax, ay = calaculateAccelerationXY(i);
            currentPlanet.x = this.defferentScheme.calculateSpeed(currentPlanet.x, currentPlanet.Vx);
            currentPlanet.y = this.defferentScheme.calculateSpeed(currentPlanet.y, currentPlanet.Vy);
            currentPlanet.Vx = this.defferentScheme.calculateSpeed(currentPlanet.Vx, ax);
            currentPlanet.Vy = this.defferentScheme.calculateSpeed(currentPlanet.Vy, ax);
        }
    }    

    calaculateAccelerationXY(numberOfPlanet){
        ax, ay;
        currentPlanet = this.planets[numberOfPlanet];
        for(let i = 0; i < this.planets.length; ++i) {
            if (i != numberOfPlanet) {
                planet = this.planets[i];
                ax += this.G * (planet.mass*(currentPlanet.x - planet.x)) / 
                        Math.pow( Math.sqrt( Math.pow(currentPlanet.x-planet.x,2)+Math.pow(currentPlanet.y-planet.y,2) ), 3);
                ay += this.G * (planet.mass*(currentPlanet.y - planet.y)) / 
                        Math.pow( Math.sqrt( Math.pow(currentPlanet.x-planet.x,2)+Math.pow(currentPlanet.y-planet.y,2) ), 3);
            }
        }
        return ax, ay;
    }

}