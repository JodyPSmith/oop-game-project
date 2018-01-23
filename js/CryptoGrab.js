/* 
    Crypto Grab MVP
    Multiple randomized Enemies (Done)
    Import bitcoin price , set as var right now would be nice if it was live (HTML/Javascript done but from var right now.)
    Add Cash Bonus (done)
    Change score to increase only if bonus grabbed, score 100 each time. (done - set to 1k for demo)
    Market crash lose 30% (done)
    Change score to increment if fiat is grabbed, and remove them (as well as at bottom of screen). (done)
    Add concept of 3 lives. (Remove icon at top when loss.) (done - would be nice to switch image)
    Winner if you reach Bitcoin price (done)
    Paralax type moving "moutain background" looks like graphs (done - doesn't loop)

    Click Start to begin
    bonus variable for dollars and eth/neo
    cartoonify enemies?
    instructions on side div?
    mining blitz (double bonus for x seconds?)
    Click Restart to try again (button in js instead of html)
    Loop Background Music
    

    
    replace image with FUD when collision?
    Use Imported bitcoin price , set it as goal and game winner when you meet it, 
    Spacebar Restart bug - once called, the listener will always respond, can't seem to tear it down. 
    extra life at 2000 points not working, function at bottom of file (extraLife) and at line ~ 324is to call function
*/

// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 1200;
var GAME_HEIGHT = 700;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 125;
var MAX_ENEMIES = 9;


var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 75;
var PLAYER_LIVES = 3;
var START_LIVES = PLAYER_LIVES;

var BONUS_WIDTH = 75;
var BONUS_HEIGHT = 156;
var MAX_BONUS = 7;
var BONUS_FLOOR = 100;

// These constants keep us from using "magic numbers" in our code, I add up and down arrow codes and space to use a life
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var DOWN_ARROW_CODE = 40;
var UP_ARROW_CODE = 38;
var SPACE_BAR = 32;

// These two constants allow us to DRIVE - I added up and down
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP = 'up';
var MOVE_DOWN = 'down';

// Sound effects
var cheer = new Audio('./audio/cheer.mp3');
var chaching = new Audio('./audio/chaching.mp3');
var collision = new Audio('./audio/collision.mp3');
var boo = new Audio('./audio/boo.mp3');
var backgroundAudio = new Audio('./audio/bg_music.mp3');

// Preload game images
var images = {};
['enemy1.png', 'enemy2.png', 'enemy3.png', 'enemy4.png', 'enemy5.png', 'enemy6.png', 'bg1.png', 'winner.png', 'player.png', 'priceline.png', 'lives.png', 'lifelost.png', 'bonus.png', 'bonus1.png', 'bonus2.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});

// Play those funky background beats.
backgroundAudio.play();

// fun fact, Parent classes need to be above children.
class Render {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

// class for the background price lines animation
class PriceLine extends Render {
    constructor(xPos) {
        super();
        this.x = 0;
        this.y = 100;
        this.sprite = images['priceline.png'];
    }

    scroll(timeDiff) {
        this.x = this.x - timeDiff / 5
    }
}

// This section is where you will be doing most of your coding
class Enemy extends Render {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        var baddy;
        var randomish = Math.random() * 100
        if (randomish <= 15) {
            baddy = 'enemy1.png';
        } else if (randomish <= 30) {
            baddy = 'enemy2.png';
        } else if (randomish <= 45) {
            baddy = 'enemy3.png';
        } else if (randomish <= 60) {
            baddy = 'enemy4.png';
        } else if (randomish <= 75) {
            baddy = 'enemy5.png';
        } else if (randomish <= 100) {
            baddy = 'enemy6.png';
        }
        this.sprite = images[baddy];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }
}

class Lives extends Render {
    constructor(lives) { //need to pass PLAYER_LIVES in here as lives
        super();
        this.x = lives + GAME_WIDTH - 250; // put lives sprite on right and shift left 20 + # of lives each time
        this.y = 20;
        this.sprite = images['lives.png'];
    }
}

class Bonus extends Render {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -BONUS_HEIGHT;
        var moohla;
        var multiplier;
        var randomish = Math.random() * 100
        if (randomish <= 75) {
            moohla = 'bonus.png';
            this.speed = Math.random() + 0.25;
            multiplier = 1;
        } else if (randomish <= 95) {
            moohla = 'bonus2.png';
            this.speed = Math.random() + 0.4;
            multiplier = 5;
        } else if (randomish <= 100) {
            moohla = 'bonus1.png';
            this.speed = Math.random() + 0.75;
            multiplier = 10;
        }
        this.sprite = images[moohla];
        this.bonusMultiplier = multiplier;
    }
}

class Player extends Render {
    constructor() {
        super();
        this.x = 7 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed. I added up down for fun
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        } else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
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

        // Setup priceline background
        this.setUpBG();

        // Setup enemies, making sure there are however many specified
        this.setupEnemies();

        // Setup Lives, making sure we start with three
        this.setupLives();

        // Setup the Moohla Baby
        this.setupBonuses();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        canvas.id = "canvas";
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */

    setupLives() {
        if (!this.lives) {
            this.lives = [];
        }

        for (var i = 1; i < PLAYER_LIVES; i++) {
            this.lives[i] = new Lives(i * PLAYER_WIDTH);
        }

        // while (this.lives.filter(e => !!e).length < PLAYER_LIVES) {
        //     //console.log();
        //     this.addLives();
        // }
    }

    // drastic copying of the enemies concept to replicate the same array and drop approach
    setupBonuses() {
        if (!this.bonuses) {
            this.bonuses = [];
            //console.log(this.enemies);        
        }

        while (this.bonuses.filter(e => !!e).length < MAX_BONUS) {
            //console.log();
            this.addBonus();
        }
    }

    addBonus() {
        var bonusSpots = (GAME_WIDTH / ENEMY_WIDTH);
        var bonusSpot;
        // Keep looping until we find a free enemy spot at random
        while (this.bonuses[bonusSpot]) {
            bonusSpot = Math.floor(Math.random() * bonusSpots);
        }

        this.bonuses[bonusSpot] = new Bonus(bonusSpot * BONUS_WIDTH, );
    }

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
        var enemySpots = (GAME_WIDTH / ENEMY_WIDTH); //added +1 here to increase the array slots + 1
        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH); // did a - enemy width to start at x=0 - ENEMY_WIDTH
    }

    // This Method allows the background price line to be animated
    setUpBG() {
        if (!this.backgrounds) {
            this.backgrounds = [];
        }

        this.addBG();
    }

    addBG(timediff) {
        this.backgrounds[0] = new PriceLine();  
    }

    // This method kicks off the game and listens for input but not much else
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

        // Increase the score! - This is the earn your money version :)
        // this.score += timeDiff;
        // if (this.isPlayerRich()) {
        //     this.score += BONUS_FLOOR;
        //     //console.log
        // }
        this.isPlayerRich();

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Call the same update for my Bonus Moohla
        this.bonuses.forEach(bonus => bonus.update(timeDiff));

        // call update for priceline
        this.backgrounds.forEach(bg => bg.scroll(timeDiff));
        
        if (this.backgrounds[0].x <= -3600) {
            this.backgrounds[0].x = 0;
        }

        // Draw everything!
        this.ctx.drawImage(images['bg1.png'], 0, 0); // draw the background
        //this.ctx.drawImage(images['priceline.png'], 0, 0);
        //this.backgrounds.forEach(background => background.scroll(this.ctx));
        this.backgrounds.forEach(background => background.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player
        this.bonuses.forEach(bonus => bonus.render(this.ctx)); // draw the bonuses
        this.lives.forEach(lives => lives.render(this.ctx)); //draw the lives


        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        // Kill the money if player didn't grab it
        this.bonuses.forEach((bonus, bonusIdx) => {
            if (bonus.y > GAME_HEIGHT) {
                delete this.bonuses[bonusIdx];
            }
        });
        this.setupBonuses();

        // Check if they've earned another life - no worky yet
        // this.extraLife();

        // Check if player is dead

        if (this.isPlayerDead() && PLAYER_LIVES == 1) {
            // If no more lives then really dead, then it's game over!
            this.ctx.font = 'bold 60px Lato';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText("YOU SCORED $" + this.score + ' AND CRASHED!!', 50, GAME_HEIGHT / 2 - 100);
            this.ctx.fillText('GAME OVER', 450, GAME_HEIGHT / 2);
            this.ctx.fillText('GO BACK TO YOUR DAY JOB', 275, GAME_HEIGHT / 2 + 100);
            document.removeEventListener('keydown', spacebar); //doesn't seem to work
            boo.play();


        } else if (this.isPlayerDead() && PLAYER_LIVES > 1) {
            // this is lost lives but not dead area
            this.wipeOutEverything();
            // Reduce the players lives by 1
            this.removeLife();

            this.ctx.font = 'bold 50px Lato';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText("SCORE: $" + this.score, 20, 75);
            this.ctx.fillText("LIVES: ", GAME_WIDTH - 375, 75)
            this.ctx.fillText('MARKET CRASH ! YOU LOST 30%', 200, GAME_HEIGHT / 2 - 100);
            this.ctx.fillText('PRESS SPACE TO CONTINUE', 250, GAME_HEIGHT / 2);
            this.score = Math.round(this.score / 100) * 70;
            collision.load();
            collision.play();



            var spacebar = e => {
                if (e.keyCode === SPACE_BAR) {
                    // retart the loop                  
                    this.lastFrame = Date.now();
                    requestAnimationFrame(this.gameLoop);
                }
            }
            document.addEventListener('keydown', spacebar);

            // Set the time marker and redraw

        } else if (this.score >= getBtcPrice()) {
            this.ctx.drawImage(images['winner.png'], 0, 0); // draw the star bg
            this.ctx.font = 'bold 240px Lato';
            this.ctx.fillStyle = '#FE470D';
            this.ctx.fillText('WINNER!!', 25, GAME_HEIGHT / 2 + 100);
            this.ctx.font = 'bold 50px Lato';
            this.ctx.fillStyle = '#FE470D';
            this.ctx.fillText('You exceeded the btc price of $' + getBtcPrice() + ' for today', 75, 100);
            cheer.play();
            this.wipeOutEverything();

        } else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 50px Lato';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText("SCORE: $" + this.score, 20, 75);
            this.ctx.fillText("LIVES: ", GAME_WIDTH - 375, 75)

            // Set the time marker and redraw

            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    isPlayerDead() {
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

    isPlayerRich() {
        // This is the fun bit - if any bonuses are touched by the player they need to disappear and increase the score by 100.
        // so basically same as is dead but if touching bonus score is increased by 100
        var rich = this.bonuses.some((bonus, bonusIdx) => {
            if (bonus.y + BONUS_HEIGHT > this.player.y && bonus.y < this.player.y + PLAYER_HEIGHT && bonus.x === this.player.x) {
                delete this.bonuses[bonusIdx];
                //have to reload the sound before playing it again incase two bonuses are collected at the same time, otherwise it will only play one and the second sounds weird.
                chaching.load();
                chaching.play();
                this.score += BONUS_FLOOR * bonus.bonusMultiplier;
                return true;
            }
        })
        return rich;
    }

    wipeOutEverything() {
        // Wipe out enemies
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > 1) {
                delete this.enemies[enemyIdx];
            }
        });

        // Wipe out on screen bonuses
        this.bonuses.forEach((bonus, bonusIdx) => {
            if (bonus.y > 1) {
                delete this.bonuses[bonusIdx];
            }
        });
    }

    removeLife() {
        PLAYER_LIVES -= 1;
        // this.lives.splice(START_LIVES - PLAYER_LIVES, 1, this.lives.sprite = images['lifelost.png']);
        delete this.lives[START_LIVES - PLAYER_LIVES]
        console.log("After decrement " + PLAYER_LIVES);
    }

    // extraLife () {
    //     // Check for extra life every 2000 up to max 3.
    //     if (PLAYER_LIVES <= 3 && this.score % 2000 == 0) {
    //         console.log(this.score % 2000);
    //         PLAYER_LIVES += 1;
    //         console.log("end of extralife func " + PLAYER_LIVES);
    //     }
    // }
}


// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();
