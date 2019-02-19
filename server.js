const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port = 3002;
const path = require('path');
const fs = require('fs');

server.listen(port, () => {
    console.log(`Server started on port ${port}`);

    //We want to start fresh everytime we start the server
    fs.unlink('coordinates.json', (err) => {
        if (err && err.errno === -2) {
            console.log('Coords don\'t exist, please carry on');
        } else if (err && err.errno !== -2 ) {
            return err;
        } else {
            console.log('Coordinates have been deleted');
        }
    });
    
});

app.use(express.static('public'));
app.use(express.static('node_modules')); //for socket.io

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/sender/index.html'));
});

app.get('/receive', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/receiver/index.html'));
});

app.get('/coords', (req, res) => {
    fs.readFile('coordinates.json', 'utf-8', (err) => {
        if (err && err.errno === -2) {
            console.log('Coords not available, please draw on the root canvas');
        } else if (err && err.errno !== -2) {
            return err;
        } else {
            res.sendFile(path.join(__dirname) + '/coordinates.json');
        }
    });

   
});

io.origins('*:*');

io.on('connection', function (socket) {
    socket.on('sendCoords', (data) => {
        //We need to concat the data arrays together so the JSON is properly formatted
        fs.readFile('coordinates.json', 'utf-8', (err, d) => {

            //If there is data in the file, we want to properly parse it so
            //we can concat our new data array to the current data available
            if (d) {
                d = JSON.parse(d);
                d = d.concat(data);
            } 

            //If there is nothing in the file, we want to use to use the first array 
            if (err && err.errno === -2) {
                d = data;
            } else if (err && err.errno !== -2) {
                return err;
            }

            //Write new data to coordinates files
            fs.writeFile('coordinates.json', JSON.stringify(d), (err) => {
                if (err) {
                    return err;
                }

                io.emit('receiveCoords', d);
            });
        });
    });
});