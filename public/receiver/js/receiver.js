const socket = io.connect('http://localhost:3002');
const circleSize = 5;
const rects = [];
const xSpeeds = [];
const ySpeeds = [];

let points = [];
let count = 0;

function setup() {
    createCanvas(500, 500);
    colorMode(HSB);
    background(0);

    //Making the initial colors of the rects white
    fill(0, 0, 255);

    //Drawing the ten randomized rects that will be on the envelope
    for (let i = 0; i < 10; i++) {
        const x = random(500);
        const y = random(500);
        const w = random(20, 40);
        const h = random(20, 40);
        const hasHit = false;
        const regionElementCoords = document.querySelector(`#region${i + 1}Coords`);
        const regionElementHasHit = document.querySelector(`#region${i + 1}HasHit`);

        rects.push({x, y, w, h, hasHit});
        regionElementCoords.textContent = `Position: X = ${x.toFixed(2)}, Y = ${y.toFixed(2)}`;
        regionElementHasHit.textContent = `Has Hit: ${hasHit}`;
       
        rect(x, y, w, h);
    }
}

function preload() {
    grabCoords();
}

function draw() {
    //This is to make it what we don't draw all the points at once and ensure that
    //there is animated to the points when the receieve route is opened
    if (count < points.length) {
        const hue = map(points[count].x, 0, 500, 0, 255);
        const saturation = map(points[count].y, 0, 500, 0, 255);
        fill(hue, saturation, 100);
        ellipse(points[count].x, points[count].y, circleSize, circleSize);

        //Checking to see if any of the points connect with any of the rectangles
        for (let i = 0; i < rects.length; i++) {
            const hit = collideRectCircle(rects[i].x, rects[i].y, rects[i].w, rects[i].h, points[count].x, points[count].y, circleSize);
            
            if (hit) {
                calculateHitPixels(i);
            }
        }
        count++;
    }
}

function calculateHitPixels(index) {
    //Grabs all points within a grouping based on the second and determines the x and y speed by
    //getting the first and last values of the grouping
    const pointsWithinSecond = points.filter(p => p.second === points[count].second);
    const xSpeed = Math.abs(pointsWithinSecond[0].x - pointsWithinSecond[pointsWithinSecond.length - 1].x);
    const ySpeed = Math.abs(pointsWithinSecond[0].y - pointsWithinSecond[pointsWithinSecond.length - 1].y);

    //Changing color of the rect to signify that it's been hit
    fill(255, 255, 100);
    stroke(255, 255, 255);
    rect(rects[index].x, rects[index].y, rects[index].w, rects[index].h);
    rects[index].hasHit = true;

    //Updating Has Hit and Cursor Speed text in the UI
    document.querySelector(`#region${index + 1}HasHit`).textContent = `Has Hit: ${rects[index].hasHit}`;
    document.querySelector(`#region${index + 1}CursorSpeed`).textContent = `
      Cursor Speed:  X = ${xSpeed} p/s, Y = ${ySpeed} p/s
    `;

    //Push the xSpeeds and ySpeeds to speeds array
    xSpeeds.push(xSpeed);
    ySpeeds.push(ySpeed);

    //Get the avgs, so we can properly display the avgs across all regions 
    const xAvg = xSpeeds.reduce((total, num) => { 
        return total + num;
    }, 0) / xSpeeds.length;

    const yAvg = ySpeeds.reduce((total, num) => { 
       return  total + num 
    }, 0) / ySpeeds.length;


    document.querySelector('#avgRegionSpeed').textContent = `Average Speed Across All Regions: X = ${xAvg.toFixed(2)} p/s, Y = ${yAvg.toFixed(2)} p/s`;
}

//Update the points when data received from socket
socket.on('receiveCoords', function (data) {
    points = data;
});

//Grab our data on initialization
function grabCoords() {
    fetch('http://localhost:3002/coords')
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            points = data;
        });
}