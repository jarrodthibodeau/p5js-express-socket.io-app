# p5js-express-socket.io-app
#### p5js appliction built with express and socket.io that does the following

- Allows you to draw points by moving your mouse on a canvas at a rate of up to 10 points a second that will emit to a socket that will update the canvas on the receive route and save them into a JSON file
- The receive route will contain a canvas that will have 10 randomly positioned rectangles
- The receive canvas will update with the all the points drawn on the root canvas as well as live update if you keep drawing on the root canvas
- If any points on the receive canvas intersect with any of the rectangles, stats about that intersection will be displayed such as pixel speed in the X and Y direction, it's position in the X and Y access and whether or not it has been hit by a point
- Average X and Y speeds of every region hit will be displayed at the bottom of the receive route


## How to run

- `npm i`
- `npm run start`

## Routes

### /
The root route is where you will move your mouse on the canvas to send points over to the receive canvas on the receive route. 

### /receive
This route will display all of the points that you have drawn on the root route and check to see if any of the points intersect with any of the 10 randomly places rectangles. If a intersection, occurs the stats to that regions intersection will be updated. If you draw on the root canvas while having the receive canvas open, you will see it update in real time

### /coords
Retrieves the coordinates.json file if it exists

## Caveats 

- As of right now, the application is not very responsive, it will be updated to be responsive however in the future
- Whenever, you start up the server, it will delete the current coordinates that exist if any do exist, so please do keep this in mind if you plan to stop and start the server a lot
- When a rectangle is hit more than twice at different periods of time, we will account for both instances in the average but not in the single display about the region.
