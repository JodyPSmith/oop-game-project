/* 
Terror Kids
replace sprites with kids faces and randomize out of the 4. Replace background too and scroll it down 
slowly for movement affect. Enable God Mode button (to prevent death).

Crypto Grab
Enable choice of player (change sprite). Change score to increment if fiat is grabbed, and remove then (not at bottom of screen).
*/

// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 1200;
var GAME_HEIGHT = 800;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var MAX_ENEMIES = 8;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 75;

// These two constants keep us from using "magic numbers" in our code, I add up and down arrow codes
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var DOWN_ARROW_CODE = 40;
var UP_ARROW_CODE = 38;

// These two constants allow us to DRIVE - I added up and down
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP = 'up';
var MOVE_DOWN = 'down';

// Preload game images
var images = {};
['enemy.png', 'stars.png', 'player.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});


// fun fact, Parent classes need to be above children.
class Render {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}

// This section is where you will be doing most of your coding
class Enemy extends Render {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }

}

class Player extends Render {
    constructor() {
        super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10 ;
        this.sprite = images['player.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed. I added up down for fun
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        } else if (direction === MOVE_UP && this.y > 0) {
            this.y = this.y - PLAYER_HEIGHT;
        } else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT - PLAYER_HEIGHT) {
            this.y = this.y + PLAYER_HEIGHT;
        }
    }
}

/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();
        
        // Setup enemies, making sure there are always three
        this.setupEnemies();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
            //console.log(this.enemies);        
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            //console.log();
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = (GAME_WIDTH / ENEMY_WIDTH) + 1; //added +1 here to increase the array slots
        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (!enemySpot || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
            //console.log("in while loop " + enemySpot);
            //console.log(enemySpot);
        }
        
        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH - ENEMY_WIDTH); // did a - enemy width to start at x=0
        //console.log(enemySpot * ENEMY_WIDTH);
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

        // Listen for keyboard left/right and update the player. I've added up and down as global vars
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            } else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            } else if (e.keyCode === UP_ARROW_CODE) {
                this.player.move(MOVE_UP);
            } else if (e.keyCode === DOWN_ARROW_CODE) {
                this.player.move(MOVE_DOWN);
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score! - This is the high Score version :)
        this.score += timeDiff * 10;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + ' GAME OVER', 5, 30);
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 50px Impact';
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillText(this.score, 5, 50);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }
    
    isPlayerDead() {
        // TODO: fix this function!
        // if any enemys x,y crosses over the players xy then the player is dead.
        var dead = this.enemies.some((enemy) => {
            // console.log(this.enemies);
            // if the bottom of the enemy y is bigger than the top of player y & the top of the enemy y is smaller than the bottom of the player y & the x is the same. 
            if (enemy.y + ENEMY_HEIGHT > this.player.y && enemy.y < this.player.y + (0.75 * PLAYER_HEIGHT) && enemy.x === this.player.x) {
                return true;
            }
        });
        return dead;
    }
}


// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();