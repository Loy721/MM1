// import Model from "Model";
// import EilerScheme from "./defferenceShemes"
// import Planet from "./planet";
//Считаем один раз через формулы ускорение, потом численно?
class Planet {
    x;
    y;
    lastX;
    lastY;
    Vx;
    Vy;
    Ax;
    Ay;
    mass;
    radius;
    firstStep = true;

    constructor(x, y, Vx, Vy, mass, radius) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.Vx = Vx;
        this.Vy = Vy;
        this.Ax = 0;
        this.Ay = 0;
        this.mass = mass;
        this.radius = radius;
    }
}

class Model {
    static G = 6.67430*Math.pow(10,-11);

    time;
    dt;
    planets;
    defferentScheme;

    constructor(time, dt, planets, defferentScheme){
        this.time = time;
        this.planets = planets;
        this.dt = dt;
        this.defferentScheme = defferentScheme;
    }

    updateCoordinatePlanets() {
        for(let i = 0; i < this.planets.length; ++i) {
            [this.planets[i].Ax, this.planets[i].Ay] = this.calaculateAccelerationXY(i);        
            
            this.defferentScheme.setVarsForNextStep(this.planets[i]);
            let [xhlp, yhlp] = [planets[i].x, planets[i].y];
            [planets[i].x, planets[i].y] = this.defferentScheme.calculateCoordinate();
            [planets[i].lastX, planets[i].lastY] = [xhlp, yhlp];

            [planets[i].Vx, planets[i].Vy] = this.defferentScheme.calculateSpeed();
        }
    }    

    calaculateAccelerationXY(indexCurrplanet) {//поменять не на индекс
        let ax=0;
        let ay=0;
        for(let i = 0; i < this.planets.length; ++i) {
            if (indexCurrplanet != i) {
                let planet = this.planets[i];
                let currPlanet = this.planets[indexCurrplanet];
                ax += Model.G * (planet.mass*(currPlanet.x - planet.x)) / 
                        Math.pow( Math.sqrt( Math.pow(currPlanet.x-planet.x,2)+Math.pow(currPlanet.y-planet.y,2) ), 3);
                ay += Model.G * (planet.mass*(currPlanet.y - planet.y)) / 
                        Math.pow( Math.sqrt( Math.pow(currPlanet.x-planet.x,2)+Math.pow(currPlanet.y-planet.y,2) ), 3);
            }
        }
        return [-ax, -ay];
    }
}

class Scheme {
    dt;
    currPlanet;

    constructor(dt) {
        this.dt = dt;
    }

    setVarsForNextStep(planet){
        this.currPlanet = planet;
    }
}

class EilerScheme extends Scheme {

    calculateSpeed() {
        return [this.currPlanet.Vx + this.currPlanet.Ax * this.dt, this.currPlanet.Vy + this.currPlanet.Ay * this.dt]; 
    }

    calculateCoordinate() {
        return [this.currPlanet.x + this.currPlanet.Vx * this.dt, this.currPlanet.y + this.currPlanet.Vy * this.dt];
    }
 }

class EilerKramerScheme extends Scheme {
    calculateSpeed() {
        return [this.currPlanet.Vx + this.currPlanet.Ax * this.dt, this.currPlanet.Vy + this.currPlanet.Ay * this.dt]
    }

    calculateCoordinate() {
        let [vx,vy] = this.calculateSpeed();
        return [this.currPlanet.x + vx * this.dt, this.currPlanet.y + vy * this.dt];
    }
 }

 class VerleScheme extends Scheme {

    setVarsForNextStep(planet){
        super.setVarsForNextStep(planet);
    }

    calculateCoordinate() {
        if(this.currPlanet.firstStep) {
            this.currPlanet.firstStep = false;
            let eiler = new EilerScheme(this.dt);
            eiler.setVarsForNextStep(this.currPlanet);
            return eiler.calculateCoordinate()
        }
        return [2 * this.currPlanet.x - this.currPlanet.lastX + this.currPlanet.Ax * this.dt * this.dt,
                     2 * this.currPlanet.y - this.currPlanet.lastY + this.currPlanet.Ay * this.dt * this.dt];
    }

    calculateSpeed() {
        let [nextX, nextY] = this.calculateCoordinate();
        return [ (nextX - this.currPlanet.lastX) / (2 * this.dt), 
                    (nextY - this.currPlanet.lastY) / (2 * this.dt)]; 
    }
 }

 class BimanScheme extends Scheme {
    lastAx;
    lastAy;
    nextAx;
    nextAy;
    sheme;
    firstStep = [true, true, true];

    setVarsForNextStep(indexCurrplanet, planets){
            this.lastAx = this.ax;
            this.lastAy = this.ay;
        super.setVarsForNextStep(indexCurrplanet, planets);
    }

    calculateCoordinate() {
        
        if(this.firstStep[this.indexCurrplanet]){
            this.sheme = new VerleScheme(this.dt);
            this.sheme.setVarsForNextStep(this.indexCurrplanet, this.planets);
            return this.sheme.calculateCoordinate();
        }
        return [this.currPlanet.x + this.currPlanet.Vx * this.dt - (4 * this.ax - this.lastAx) * (this.dt * this.dt ) / 6, 
                        this.currPlanet.y + this.currPlanet.Vy * this.dt - (4 * this.ay - this.lastAy) * (this.dt * this.dt ) / 6,];
    }

    calculateSpeed() {//TODO: очень плохо изменять lastX т.к. корректная работа класса зависит от последовательности вызова методов
        if(this.firstStep[this.indexCurrplanet]){
            this.firstStep[this.indexCurrplanet] = false;
            return this.sheme.calculateSpeed();
        }
        [this.nextAx, this.nextAy] = this.calaculateAccelerationXY();

        console.log(this.lastAx);
        console.log(this.ax);
        console.log(this.nextAx);
        console.log("--------"+this.indexCurrplanet);

        
        return [this.currPlanet.Vx + (2 * this.nextAx + 5 * this.ax - this.lastAx) * this.dt / 6
                        , this.currPlanet.Vy + (2 * this.nextAy + 5 * this.ay - this.lastAy) * this.dt / 6]
    }
 }

let canvas = document.querySelector("canvas");
context = canvas.getContext('2d')

planet1 = new Planet(0, 0, 0, 0, 1.9891 * Math.pow(10, 30), 7)
planet2 = new Planet(1.496 * Math.pow(10, 11), 0, 0, 29782, 5.9722 * Math.pow(10,24), 2)
planet3 = new Planet(57.91 * Math.pow(10, 9), 0, 0, 47400, 3.33 * Math.pow(10,23), 1)
planets = [planet1, planet2, planet3];
let dt = 10000
model = new Model(31536000, dt, planets, new VerleScheme(dt));

requestAnimationFrame(tick)

function tick() {
    requestAnimationFrame(tick);
    context.clearRect(0, 0, canvas.width, canvas.height);
    paintPlanets()
}

function paintPlanets() {
    model.updateCoordinatePlanets();
    for(let i = 0; i < model.planets.length; ++i){
        
    context.beginPath();
        currPlanet = model.planets[i];
        paintPlanet(currPlanet.x, currPlanet.y, currPlanet.radius, 'red');
        context.fill();
    }
}

const MAX_LENGTH = Math.pow(10, 12);
function paintPlanet(x, y, radius, color){
    context.arc(canvas.width / 2 + (x / MAX_LENGTH) * canvas.width,
                    canvas.height / 2 + (y / MAX_LENGTH) * canvas.height, radius, 0, Math.PI*2);
    context.fillStyle = color;
}