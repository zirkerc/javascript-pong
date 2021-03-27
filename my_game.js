
/**
 * 1.a) Make the left paddle move up when the Q is pressed
 * 1.b) Make the left paddle stop moving up when Q is released
 * 
 * 2.a) Make the left paddle move down when A is pressed
 * 2.b) Make the left paddle stop moving down when A is released
 * 
 * 3) Change how fast the ball moves
 * 
 * 
 * Extra:
 *  1) Make the ball green using ball.setColor("")
 *  2) Make the right paddle move up and down with P & L
 *  3) Change the color of the paddles
 * 
 * 
 * Hints:
 * my_game has the fields
 *  leftPaddle
 *  rightPaddle
 *  ball
 * 
 * paddles have a function moveUp(), moveDown(), stopMovingUp(), stopMovingDown()
 * 
 * ball has a function setSpeed(number) 0-10
 * 
 */


let my_game = {
    initialize(pong) {
        Object.assign(this, pong);

        // 3) Set ball speed to using setSpeed()


        // EXTRA 1) Make the ball green

        // EXTRA 3) Make the paddles different colors
    },

    onKeyPress: function (key) {
        console.log("Key Press", key);

        // 1.a) Make the leftPaddle move up when key == "Q"
        if (key == "Q") {
        }
        // 2.a) Make the leftPaddle move down when key == "A"
        else if (key == "A") {
        }

        // EXTRA 2.a) Move the right paddle with P & L

    },

    onKeyRelease: function (key) {
        console.log("Key Release", key);

        // 1.b) Make the leftPaddle stop moving up when key == "Q"
        if (key == "Q") {
        }

        // 2.b) Make the leftPaddle stop moving down when key == "A"
        else if (key == "A") {
        }

        // EXTRA 2.b) Stop move the right paddle with P & L
    }
}