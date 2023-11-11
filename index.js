//вопрос по скорости в кин энергии
//logic
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

    constructor(x, y, Vx, Vy, mass) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.Vx = Vx;
        this.Vy = Vy;
        this.Ax = 0;
        this.Ay = 0;
        this.mass = mass;
        this.radius = Math.ceil(mass * 5 / maxWeight);
    }

    setSpeed([x, y]){
        this.lastX = this.x;
        this.lastY = this.y;
        this.x = x;
        this.y = y;
    }

    calaculateAccelerationXY(planets) {
        this.lastAx = this.Ax;
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
    currentTime;
    planets;
    defferentScheme;

    constructor(time, dt, planets, defferentScheme){
        this.time = time;
        this.currentTime = 0;
        this.planets = planets;
        this.dt = dt;
        switch(defferentScheme){
            case "E":
                this.defferentScheme =  new EilerScheme(dt);
                break;        
            case "E-K":
                this.defferentScheme =  new EilerKramerScheme(dt);
                break;
            case "V":
                this.defferentScheme =  new VerleScheme(dt);
                break;
            case "B":
                this.defferentScheme =  new BimanScheme(dt);
                break;
        }
    }

    updateCoordinatePlanets() {
        this.currentTime += Number(this.dt);
        for(let i = 0; i < this.planets.length; ++i) {
            planets[i].calaculateAccelerationXY(this.planets);        
            
            this.defferentScheme.setVarsForNextStep(this.planets[i]);
            this.planets[i].setSpeed(this.defferentScheme.calculateCoordinate());

            [planets[i].Vx, planets[i].Vy] = this.defferentScheme.calculateSpeed();
        }
    }    

    centerMassV(){
        let M = 0;
        let mVx = 0;
        let mVy = 0;
        for(let i = 0; i < planets.length; ++i) {
            mVx += planets[i].mass *  planets[i].Vx;
            mVy += planets[i].mass *  planets[i].Vy;
            M += planets[i].mass;
        }
        return [mVx/M, mVy/M];
    }

    totalEnergy(){
        let totalEnergy = 0;
        for(let i = 0; i < planets.length; ++i){
            for(let j = 0; j < planets ; ++j){
                if  (i != j){
                    totalEnergy -= this.G * planets[i] * planets[j] / 
                            Math.sqrt(Math.pow(planets[j].x - planets[i].x, 2) + Math.pow(planets[j].y - planets[i].y, 2));
                }
            }
            totalEnergy += planets[i].mass * Math.sqrt(Math.pow(planets[i].Vx, 2) + Math.pow(planets[i].Vx, 2)) / 2
        }
        return totalEnergy;
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

 //view
    function addrow() {
        const IDs = ['X','Y','Vx','Vy','M']; 
        let values = []; 
        let tableRef = document.getElementsByClassName('table-for-params')[0].getElementsByTagName('tbody')[0];;

        let newRow = tableRef.insertRow(tableRef.rows.length);
        for (let j = 0; j < 5; j++) {
            let newCell = newRow.insertCell(j); 
            newCell.innerHTML = document.getElementById(IDs[j]).value;
            values[j] =  Number(document.getElementById(IDs[j]).value);
        }
        let newCell = newRow.insertCell(5); 
        newCell.innerHTML = tableRef.rows.length;
        if(maxWidth < values[0])
            maxWidth = values[0];
        if(maxWeight < values[4])
            maxWeight = values[4];
        planets.push(new Planet(values[0], values[1], values[2], values[3], values[4]));
    }

    function show() {
        model = new Model(document.getElementById("time").value, document.getElementById("dt").value, planets, typeOfSheme);
        maxWidth *= 5;
        tick();
        //paintPlanets();
    }

    function addSheme(shemeName) {
        let radiosNames = ["V", "E", "E-K", "B"]
        for(let i = 0; i < 4; ++i){
            if(document.getElementById(radiosNames[i]).value != shemeName) {
                document.getElementById(radiosNames[i]).checked = false;
            }
        }
        typeOfSheme = shemeName;
    }

let canvas = document.querySelector("canvas");
context = canvas.getContext('2d');
// 1.9891e30  | 1.496e11 0 0 29782 5.9722e24 | 57.91e9 0 0 47400 3.33e23
//3600 31536000
let model;
let planets = [];
let typeOfSheme = "E";

let maxWidth = 0; //для задания границ плота
let maxWeight = 0; //для задания радиуса планет

function tick() {
    // q++;
    // context.font = "700 5px Roboto, sans-serif";
    // context.fillStyle = "#000";
    // context.textAlign = 'center';
    // context.textBaseline = 'middle';
    // context.fillText(q, 200, 100)
    paintPlanets();
    if(model.currentTime <= model.time)
        requestAnimationFrame(tick);
}

function paintPlanets() {
    //while(model.currentTime < model.time) {    
    // setTimeout( function ds(){ 
    //         context.fill();
    //         context.clearRect(0, 0, canvas.width, canvas.height);
    for(let speed = 0; speed < document.getElementById("sliderRange").value; ++speed){
        
        context.fill();
        context.clearRect(0, 0, canvas.width, canvas.height);
        model.updateCoordinatePlanets();
        for(let i = 0; i < model.planets.length; ++i){
            context.beginPath();
            currPlanet = model.planets[i];
            let radius = Math.ceil(currPlanet.mass * 5 / maxWeight);
            paintPlanet(currPlanet.x, currPlanet.y, radius, 'red');
            context.fill();
        }
        document.getElementById("TotalEnergy").value = model.totalEnergy();
        document.getElementById("CurrentTime").value = model.currentTime;
        [document.getElementById("CenterMassVx").value, document.getElementById("CenterMassVy").value]  = model.centerMassV(); 
    //    }, 100);
        //}
    }
}

const MAX_LENGTH = Math.pow(10, 12);
function paintPlanet(x, y, radius, color){
    context.arc(canvas.width / 2 + (x / maxWidth) * canvas.width,
                    canvas.height / 2 + (y / maxWidth) * canvas.height, radius, 0, Math.PI*2);
    context.fillStyle = color;
}

////sliderRange
var rangeslider = document.getElementById("sliderRange"); 
var output = document.getElementById("demo"); 
output.innerHTML = rangeslider.value; 
  
rangeslider.oninput = function() { 
  output.innerHTML = this.value;
} 