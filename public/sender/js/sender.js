const socket = io.connect('http://localhost:3002');
const circleSize = 5;
let points = [];
let throttledSendCoords;
let second = 0;

//Creates the canvas and sets the color mode as well as the throttling
function setup() {
    createCanvas(500, 500);
    background(0);
    colorMode(HSB);

    //Make sure we only sendCoords once per second and group each batch by the seconds variables
    throttledSendCoords = _.throttle((ps) => {
        sendCoords(ps);
        second += 1;
    }, 1000);
}

//Called everytime the mouse moves
function mouseMoved() {
    if ((mouseX >= 0 && mouseX <= width) && (mouseY >= 0 && mouseY <= height) && points.length < 10) {
        const hue = map(mouseX, 0, 500, 0, 255);
        const saturation = map(mouseY, 0, 500, 0, 255);
        fill(hue, saturation, 100);
        ellipse(mouseX, mouseY, circleSize, circleSize);

        //We only want to have ten points at each second
        if (points.length < 10) {
            points.push({x: mouseX, y: mouseY, timestamp: new Date().toTimeString()});
        }

        //Only calls every seconde since it's being throttled
        throttledSendCoords(points);
    }
}

//Emits ours coordinates over to the socket
function sendCoords(points) {
    if (!points) return;

    //Log to show that this is being called every second
    console.log('I am only being called every second when the mouse is moving :)', second);

    const firstTenPoints = points.splice(0, 10).map(p => {
        p.second = second;
        return p;
    });

    socket.emit('sendCoords', firstTenPoints);    
    points = [];
}

