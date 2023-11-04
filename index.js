// import Model from "Model";
// import EilerScheme from "./defferenceShemes"
// import Planet from "./planet";
//Считаем один раз через формулы ускорение, потом численно?
class Planet {
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
            this.defferentScheme.setVarsForNextStep(i, this.planets);
            [planets[i].x, planets[i].y] = this.defferentScheme.calculateCoordinate();
            
            [planets[i].Vx, planets[i].Vy] = this.defferentScheme.calculateSpeed();
        }
    }    
}

class EilerScheme {
    dt;
    currPlanet;
    indexCurrplanet;
    planets;
    ax;
    ay;

    constructor(dt) {
        this.dt = dt;
    }

    setVarsForNextStep(indexCurrplanet, planets){
        this.indexCurrplanet =  indexCurrplanet;
        this.planets = planets
        
        this.currPlanet = planets[indexCurrplanet];
        [this.ax, this.ay] = this.calaculateAccelerationXY();
    }

    calaculateAccelerationXY() {
        let ax=0;
        let ay=0;
        for(let i = 0; i < this.planets.length; ++i) {
            if (this.indexCurrplanet != i) {
                let planet = this.planets[i];
                ax += Model.G * (planet.mass*(this.currPlanet.x - planet.x)) / 
                        Math.pow( Math.sqrt( Math.pow(this.currPlanet.x-planet.x,2)+Math.pow(this.currPlanet.y-planet.y,2) ), 3);
                ay += Model.G * (planet.mass*(this.currPlanet.y - planet.y)) / 
                        Math.pow( Math.sqrt( Math.pow(this.currPlanet.x-planet.x,2)+Math.pow(this.currPlanet.y-planet.y,2) ), 3);
            }
        }
        return [-ax, -ay];
    }


    calculateSpeed() {
        return [this.currPlanet.Vx + this.ax * this.dt, this.currPlanet.Vy + this.ay * this.dt]; 
    }

    calculateCoordinate() {
        return [this.currPlanet.x + this.currPlanet.Vx * this.dt, this.currPlanet.y + this.currPlanet.Vy * this.dt];
    }
 }

class EilerKramerScheme {
    dt;
    currPlanet;
    indexCurrplanet;
    planets;
    ax;
    ay;

    constructor(dt) {
        this.dt = dt;
    }

    setVarsForNextStep(indexCurrplanet, planets){
        this.indexCurrplanet =  indexCurrplanet;
        this.planets = planets
        
        this.currPlanet = planets[indexCurrplanet];
        this.calaculateAccelerationXY();
    }
    calculateSpeed() {
        return [this.currPlanet.Vx + this.ax * this.dt, this.currPlanet.Vy + this.ay * this.dt]
    }

    calculateCoordinate() {
        let [vx,vy] = this.calculateSpeed();
        return [this.currPlanet.x + vx * this.dt, this.currPlanet.y + vy * this.dt];
    }

    calaculateAccelerationXY() {
        let ax=0;
        let ay=0;
        for(let i = 0; i < this.planets.length; ++i) {
            if (this.indexCurrplanet != i) {
                let planet = this.planets[i];
                ax += Model.G * (planet.mass*(this.currPlanet.x - planet.x)) / 
                        Math.pow( Math.sqrt( Math.pow(this.currPlanet.x-planet.x,2)+Math.pow(this.currPlanet.y-planet.y,2) ), 3);
                ay += Model.G * (planet.mass*(this.currPlanet.y - planet.y)) / 
                        Math.pow( Math.sqrt( Math.pow(this.currPlanet.x-planet.x,2)+Math.pow(this.currPlanet.y-planet.y,2) ), 3);
            }
        }
        this.ax = -ax;
        this.ay = -ay;
    }
 }

 class VerleScheme {
    dt;
    currV;
    currA;
    currX;
    lastX
    firstStep = true;

    constructor(dt) {
        this.dt = dt;
    }

    setVarsForNextStep(currX, currV, currA){
        this.currA = currA;
        this.currV = currV;
        this.currX = currX;
        if(this.firstStep){
            this.lastX = currX
            this.firstStep = false;
        }
    }

    calculateCoordinate() {
        return 2 * this.currX - this.lastX + this.currA * this.dt * this.dt;
    }

    calculateSpeed() {//TODO: очень плохо изменять lastX т.к. корректная работа класса зависит от последовательности вызова методов
        let nextV = (this.calculateCoordinate() - this.lastX) / (2 * this.dt);
        this.lastX = this.currX;
        return nextV; 
    }
 }

let canvas = document.querySelector("canvas");
context = canvas.getContext('2d')

planet1 = new Planet(0, 0, 0, 0, 1.9891 * Math.pow(10, 30), 7)
planet2 = new Planet(1.5 * Math.pow(10, 11), 0, 0, 29782, 5.9722 * Math.pow(10,24), 2)
planet3 = new Planet(58 * Math.pow(10, 9), 0, 0, 47400, 3.33 * Math.pow(10,23), 1)
planets = [planet1, planet2, planet3];
let dt = 10000
model = new Model(31536000, dt, planets, new EilerKramerScheme(dt));

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