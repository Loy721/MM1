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
    lastAx;
    lastAy;
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

    setSpeed([x, y]){
        this.lastX = this.x;
        this.lastY = this.y;

        this.x = x;
        this.y = y;
    }

    calaculateAccelerationXY(planets) {
        this.lastAx = this.Ax
        this.lastAy = this.Ay;

        let ax=0;
        let ay=0;
        for(let i = 0; i < planets.length; ++i) {
            if (this != planets[i]) {
                let planet = planets[i];
                ax += Model.G * (planet.mass*(this.x - planet.x)) / 
                        Math.pow( Math.sqrt( Math.pow(this.x-planet.x,2)+Math.pow(this.y-planet.y,2) ), 3);
                ay += Model.G * (planet.mass*(this.y - planet.y)) / 
                        Math.pow( Math.sqrt( Math.pow(this.x-planet.x,2)+Math.pow(this.y-planet.y,2) ), 3);
            }
        }
        [this.Ax, this.Ay] = [-ax, -ay];
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
            planets[i].calaculateAccelerationXY(this.planets);        
            
            this.defferentScheme.setVarsForNextStep(this.planets[i]);
            this.planets[i].setSpeed(this.defferentScheme.calculateCoordinate());

            [planets[i].Vx, planets[i].Vy] = this.defferentScheme.calculateSpeed();
        }
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

    calculateCoordinate() {
        if(this.currPlanet.firstStep) {
            let eiler = new EilerScheme(this.dt);
            eiler.setVarsForNextStep(this.currPlanet);
            return eiler.calculateCoordinate()
        }
        return [this.currPlanet.x + this.currPlanet.Vx * this.dt - (4 * this.currPlanet.Ax - this.currPlanet.lastAx) * (this.dt * this.dt ) / 6, 
                        this.currPlanet.y + this.currPlanet.Vy * this.dt - (4 * this.currPlanet.Ay - this.currPlanet.lastAy) * (this.dt * this.dt ) / 6];
    }

    calculateSpeed() {//TODO: очень плохо изменять lastX т.к. корректная работа класса зависит от последовательности вызова методов
        if(this.currPlanet.firstStep) {
            this.currPlanet.firstStep = false;
            let eiler = new EilerScheme(this.dt);
            eiler.setVarsForNextStep(this.currPlanet);
            return eiler.calculateSpeed();
        }
        let [lastAx, lastAy] = [this.currPlanet.lastAx, this.currPlanet.lastAy];
        this.currPlanet.calaculateAccelerationXY(model.planets);//TODO!!!!!!!!!!!!
        return [this.currPlanet.Vx + (2 * this.currPlanet.Ax + 5 * this.currPlanet.lastAx - lastAx) * this.dt / 6,
                        this.currPlanet.Vy + (2 * this.currPlanet.Ay + 5 * this.currPlanet.lastAy - lastAy) * this.dt / 6]
    }
 }

let canvas = document.querySelector("canvas");
context = canvas.getContext('2d')

planet1 = new Planet(0, 0, 0, 0, 1.9891 * Math.pow(10, 30), 7)
planet2 = new Planet(1.496 * Math.pow(10, 11), 0, 0, 29782, 5.9722 * Math.pow(10,24), 2)
planet3 = new Planet(57.91 * Math.pow(10, 9), 0, 0, 47400, 3.33 * Math.pow(10,23), 1)
planets = [planet1, planet2, planet3];
let dt = 10000
model = new Model(31536000, dt, planets, new BimanScheme(dt));

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