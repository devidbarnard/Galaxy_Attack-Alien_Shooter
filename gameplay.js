let player;
let playerImg;
let plyrImg2;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let score = 0;
let level = 1;
let playerEnergy = 100;
let stars = [];
let giantEnemy = null;
let devilEnemy = null;
let levelKills = 0;
let totalKills = 0;
let distanceTraveled = 0;
let gameOver = false;
let levelUpMessageTime = 0;
let showLevelUpMessage = false;
let asteroids = [];
let asteroidImgs = [];
let enemyDirection = 1; // 1 means moving right, -1 means moving left
let barrier;
let elixirOfLife;
let equip;
let shieldActivating;
let button, button2, button3,
button4, button5;

function preload() {
  playerImg = loadImage('player.png');
  plyrImg2 = loadImage('player2.png');
  plyrImg3 = loadImage('player3.png');
  plyrImg4 = loadImage('player4.png');
  plyrImg5 = loadImage('player5.png');
  enemyImg = loadImage('enemy.png');
  barrier = loadImage('shield.png');
  elixirOfLife = loadImage('healing_agent.png');
  giantEnemyImg = loadImage('giantEnemy.png')
  devilEnemyImg = loadImage('devilEnemy.png');
  shieldActivating = loadImage('loading.gif');
  equip =  loadImage('equiping.gif');
  for (let i = 0; i < 7; i++) {
    asteroidImgs.push(loadImage(`asteroid${i + 1}.png`));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  player = new Player();
  createEnemies(level);
  createStars(100);
  createAsteroids(20);
  shieldActivating.resize(500, 500);
  equip.resize(100,100);
}

let shield;
let healingAgent;
let shieldActive = false;
let shieldActivatedTime = 0;


function draw() {
  background(0);
  distanceTraveled += 1;

  for (let star of stars) {
    star.show();
    star.move();
  }

  for (let asteroid of asteroids) {
    asteroid.show();
    asteroid.move();
  }

  if (showLevelUpMessage) {
    fill(255, 0, 0);
    textSize(165);
    textAlign(CENTER, CENTER);
    text(`Level ${level}`, width / 2, height / 2);

    if (millis() - levelUpMessageTime > 500) {
      showLevelUpMessage = false;
    }
    return;
  }

  if (!gameOver) {
    player.show();
    player.move();

    if (frameCount % 10 === 0) {
      bullets.push(new Bullet(player.x + player.width / 2, player.y));
    }

    for (let bullet of bullets) {
      bullet.show();
      bullet.move();
      for (let enemy of enemies) {
        if (bullet.hits(enemy)) {
          enemy.die();
          bullet.die();
          score += 10;
          levelKills++;
          totalKills++;
        }
      }
      if (giantEnemy && bullet.hits(giantEnemy)) {
        giantEnemy.energy -= 5;
        bullet.die();
        if (giantEnemy.energy <= 0) {
          giantEnemy.die();
          score += 50;
          levelKills++;
          totalKills++;
        }
      }
      if (devilEnemy && bullet.hits(devilEnemy)) {
        devilEnemy.energy -= 5;
        bullet.die();
        if (devilEnemy.energy <= 0) {
          devilEnemy.die();
          score += 100;
          levelKills++;
          totalKills++;
        }
      }
    }

    for (let enemy of enemies) {
      enemy.show();
      enemy.move(); // Implement zigzag movement
      if (enemy.hits(player)) {
        gameOver = true;
      }
      if (random(1) < 0.01) {
        enemyBullets.push(new EnemyBullet(enemy.x + enemy.width / 2, enemy.y + enemy.height));
      }
    }

    if (giantEnemy && !giantEnemy.toDelete) {
      giantEnemy.show();
      giantEnemy.move();
      if (giantEnemy.hits(player)) {
        gameOver = true;
      }
      if (random(1) < 0.02) {
        enemyBullets.push(new EnemyBullet(giantEnemy.x + giantEnemy.width / 4, giantEnemy.y + giantEnemy.height));
        enemyBullets.push(new EnemyBullet(giantEnemy.x + 3 * giantEnemy.width / 4, giantEnemy.y + giantEnemy.height));
      }
      fill(255);
      textSize(16);
      text(`Energy: ${giantEnemy.energy}`, giantEnemy.x, giantEnemy.y - 10);
    }

    if (devilEnemy && !devilEnemy.toDelete) {
      devilEnemy.show();
      devilEnemy.move();
      if (devilEnemy.hits(player)) {
        gameOver = true;
      }
      if (random(1) < 0.02) {
        enemyBullets.push(new EnemyBullet(devilEnemy.x + devilEnemy.width / 4, devilEnemy.y + devilEnemy.height));
        enemyBullets.push(new EnemyBullet(devilEnemy.x + 3 * devilEnemy.width / 4, devilEnemy.y + devilEnemy.height));
      }
      fill(255);
      textSize(16);
      text(`Energy: ${devilEnemy.energy}`, devilEnemy.x, devilEnemy.y - 10);
    }

    for (let bullet of bullets) {
      if (!bullet.toDelete) {
        bullet.show();
        bullet.move();
      }
    }

    for (let bullet of enemyBullets) {
      bullet.show();
      bullet.move();
      if (bullet.hits(player)) {
        if (!shieldActive) {
          playerEnergy -= 2;
        }
        bullet.die();
        if (playerEnergy <= 0) {
          gameOver = true;
          newShip = true
        }
      }
    }

    bullets = bullets.filter(bullet => !bullet.toDelete);
    enemies = enemies.filter(enemy => !enemy.toDelete);
    enemyBullets = enemyBullets.filter(bullet => !bullet.toDelete);

    // More frequent Shield and HealingAgent
    if (!shield && frameCount % 180 === 0) { // Spawning more frequently
      shield = new Shield();
    }

    if (!healingAgent && frameCount % 240 === 0) { // Spawning more frequently
      healingAgent = new HealingAgent();
    }

    if (shield) {
      shield.show();
      shield.move();
      if (shield.hits(player)) {
        shieldActive = true;
        shieldActivatedTime = millis();
        shield = null;
      }
    }

    if (shieldActive && millis() - shieldActivatedTime > 60000) {
      shieldActive = false;
    }

    if (shieldActive) {
      fill(0, 0, 255, 100);
      ellipse(player.x + player.width / 2, player.y + player.height / 2, player.width + 20, player.height + 20);
      
      fill(0, 255, 255, 200);
      textSize(24);
      text(`⚔️🛡️⚔️Shield Activated⚔️🛡️⚔️`,width- 360, 10);
      image(shieldActivating, 10, 190, 130, 100);
      image(equip, width-280, 35, 200, 70);
    }

    if (healingAgent) {
      healingAgent.show();
      healingAgent.move();
      if (healingAgent.hits(player)) {
        playerEnergy = 100;
        healingAgent = null;
      }
    }

    if (enemies.length === 0 && (!giantEnemy || giantEnemy.toDelete) && (!devilEnemy || devilEnemy.toDelete)) {
      level++;
      playerEnergy = 100; // Reset player energy at the beginning of each level
      levelKills = 0;
      showLevelUpMessage = true;
      levelUpMessageTime = millis();

      if (level === 4) {
        giantEnemy = new GiantEnemy();
      } else if (level === 5) {
        devilEnemy = new DevilEnemy();
      } else if (level === 6) {
        giantEnemy = new GiantEnemy();
      } else if (level === 7) {
        giantEnemy = new GiantEnemy();
        enemies.push(new GiantEnemy());
      } else if (level === 8) {
        devilEnemy = new DevilEnemy();
      } else if (level === 9) {
        devilEnemy = new DevilEnemy();
        enemies.push(new DevilEnemy());
      } else if (level === 10) {
        giantEnemy = new GiantEnemy();
        devilEnemy = new DevilEnemy();
        enemies.push(new GiantEnemy());
      } else if (level === 11) {
        giantEnemy = new GiantEnemy();
      } else if (level === 12) {
        devilEnemy = new DevilEnemy();
      }

      createEnemies(level);
      createStars(100);
      createAsteroids(20);
      
      shield = new Shield();
      healingAgent = new HealingAgent();
    }
  }

  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`Score: ${score}P`, 10, 10);
  text(`Level: ${level}`, 10, 40);
  text(`Energy: ${playerEnergy}%`, 10, 70);
  text(`Level Kills: ${levelKills}`, 10, 100);
  text(`Total Kills: ${totalKills}`, 10, 130);
  text(`Distance: ${distanceTraveled} km`, 10, 160);

  if (gameOver) {
    textSize(98);
    textAlign(CENTER);
    text('Game Over', width / 2, height / 2 - 100);
    textSize(44);
    text('Tap to Replay', width / 2, height / 2 );
  }
  
  
  if (level === 12){
    fill(255);
    textSize(98);
    textAlign(CENTER, CENTER);
    fill('tomato');
    text('Enjoy the Game?\n⭐⭐⭐⭐⭐', width / 2, height / 2 - 105);
    noLoop();
    textSize(50);
    
    button = createButton('PLAY AGAIN');
    button.position(width/2 -205, height/2 +35);
    button.style('font-size','70px');
    button.style('background-color', 'green')
    
    button.mousePressed(rePlay);
    
    button2 = createButton('🌟Try NEW🌟');
    button2.position(width / 2 -130, height / 2 - 800);
    button2.style('font-size', '35px');
    button2.style('background-color', 'orangered');
    button2.mousePressed(unlockedNewSpaceShip);
    
    button3 = createButton('Intermediate Spaceship👾 Unlocked🔐');
    button3.position(width / 2 - 330, height / 2 - 700);
    button3.style('font-size', '35px');
    text('🔓',    width/2+ 340, height / 2 - 680)
    button3.style('background-color', 'indianred');
    button3.mousePressed(unlockedNewSpaceShip3);
    
    button4 = createButton('Super Upgraded🚀 Spaceship Unlocked 🔓');
    button4.position(width / 2 - 360, height / 2 - 600);
    button4.style('font-size', '35px');
    text('🔓'    ,width / 2 + 370, height / 2 - 580)
    button4.style('background-color', 'darkred');
    button4.mousePressed(unlockedNewSpaceShip4);
     
    button5 = createButton('🔓Unlocked invincible RUINATOR🛸');
    button5.position(width / 2 - 305, height / 2 - 500);
    button5.style('font-size', '35px');
    text('🔓',width / 2 +320, height / 2 - 480)
    button5.style('background-color', 'red');
    button5.mousePressed(unlockedNewSpaceShip5);
    
    
  }

}

function createEnemies(level) {
  let rows = 2 + (level/2 - 1);
  let cols = 3 + (level/2 - 1);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = 80 + j * 100;
      let y = 50 + i * 60;
      enemies.push(new Enemy(x, y));
    }
  }
}

function createStars(num) {
  stars = [];
  for (let i = 0; i < num; i++) {
    stars.push(new Star());
  }
}

function createAsteroids(num) {
  asteroids = [];
  for (let i = 0; i < num; i++) {
    asteroids.push(new Asteroid());
  }
}

function mousePressed() {
  if (gameOver) {
    resetGame();
  } else {
    bullets.push(new Bullet(player.x + player.width / 2, player.y));
  } 
  return false;
}

function resetGame() {
  player = new Player();
  enemies = [];
  bullets = [];
  enemyBullets = [];
  score = 0;
  level = 1;
  playerEnergy = 100;
  stars = [];
  giantEnemy = null;
  devilEnemy = null;
  levelKills = 0;
  totalKills = 0;
  distanceTraveled = 0;
  gameOver = false;
  showLevelUpMessage = false;
  levelUpMessageTime = 0;
  createEnemies(level);
  createStars(100);
  createAsteroids(20);
  button.remove();
  button2.remove();
  button3.remove();
  button4.remove();
  button5.remove();
}

class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 160;
    this.width = 210;
    this.height = 160;
    this.speed = 7;
  }

  show() {
    image(playerImg, this.x, this.y, this.width, this.height);
  }

  move() {
    if (mouseIsPressed) {
      this.x = mouseX - this.width / 2;
    }
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > width - this.width) {
      this.x = width - this.width;
    }
  }
}

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 180;
    this.height = 180;
    this.speed = 1;
    this.direction = 1;
    this.toDelete = false;
    this.sinOffset = random(TWO_PI); // Random offset for zig-zag pattern
  }

  show() {
    fill(255, 0, 0);
    ellipse(this.x + this.width / 2, this.y + this.height / 2 + 20, this.width / 2, this.height / 2);
    image(enemyImg, this.x, this.y, this.width, this.height);
  }

  move() {
    this.x += this.speed * this.direction;
    this.y += sin(frameCount * 0.05 + this.sinOffset) * 2; // More pronounced zig-zag motion
    if (this.x > width - this.width || this.x < 0) {
      this.direction *= -1;
      this.y += this.height;
    }
    /*this.x += this.speed * this.direction;
    if (this.x > width - this.width || this.x < 0) {
      this.direction *= -1;
      this.y += this.height;
    }*/
  }

  hits(player) {
    return collideRectRect(this.x, this.y, this.width, this.height, player.x, player.y, player.width, player.height);
  }

  die() {
    this.toDelete = true;
  }
}


class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 20;
    this.toDelete = false;
  }

  show() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, this.width, this.height);
  }

  move() {
    this.y -= 5;
  }

  hits(enemy) {
    return collideRectRect(this.x, this.y, this.width, this.height, enemy.x, enemy.y, enemy.width, enemy.height);
  }

  die() {
    this.toDelete = true;
  }
}

class EnemyBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 20;
    this.toDelete = false;
  }

  show() {
    fill(255, 0, 0);
    noStroke();
    ellipse(this.x, this.y, this.width, this.height);
  }

  move() {
    this.y += 5;
  }

  hits(player) {
    return collideRectRect(this.x, this.y, this.width, this.height, player.x, player.y, player.width, player.height);
  }

  die() {
    this.toDelete = true;
  }
}

class GiantEnemy {
  constructor() {
    this.x = width / 2 - 175;
    this.y = 50;
    this.width = 450;
    this.height = 500;
    this.energy = 50;
    this.toDelete = false;
    this.speed = 2;
  }

  show() {
    /*fill(255, 0, 0);
    ellipse(this.x + this.width / 2, this.y + this.height / 2 + 30, this.width / 2, this.height / 2);*/
    image( giantEnemyImg, this.x, this.y, this.width, this.height);
    fill(255);
    textSize(16);
    text(`Energy: ${this.energy}`, this.x, this.y - 10);
  }

  move() {
    this.x += this.speed * enemyDirection * 0.5;
    if (this.x > width - this.width || this.x < 0) {
      enemyDirection *= -1;
      this.y += this.height;
    }
  }

  hits(player) {
    return collideRectRect(this.x, this.y, this.width, this.height, player.x, player.y, player.width, player.height);
  }

  die() {
    this.toDelete = true;
  }
}

class DevilEnemy {
  constructor() {
    this.x = width / 2 - 175;
    this.y = 50;
    this.width = 500;
    this.height = 500;
    this.energy = 100;
    this.toDelete = false;
    this.speed = 5;
  }

  show() {
    image(devilEnemyImg, this.x, this.y, this.width, this.height);
    fill(255);
    textSize(16);
    text(`Energy: ${this.energy}`, this.x, this.y - 10);
  }

  move() {
    this.x += this.speed * enemyDirection * 0.5;
    if (this.x > width - this.width || this.x < 0) {
      enemyDirection *= -1;
      this.y += this.height;
    }
  }

  hits(player) {
    return collideRectRect(this.x, this.y, this.width, this.height, player.x, player.y, player.width, player.height);
  }

  die() {
    this.toDelete = true;
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 5);
    this.speed = random(1, 3);
    this.color = color(random(255), random(255), random(255));
  }

  show() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }

  move() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
    }
  }
}

class Asteroid {
  constructor() {
    this.img = random(asteroidImgs);
    this.x = random(width);
    this.y = random(-height, 0);
    this.size = random(30, 100) * level;
    this.speed = random(1, 3);
    this.angle = 0;
    this.rotationSpeed = random(-0.05, 0.05);
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    image(this.img, 0, 0, this.size, this.size);
    pop();
  }

  move() {
    this.y += this.speed;
    this.angle += this.rotationSpeed;
    if (this.y > height) {
      this.y = random(-height, 0);
      this.x = random(width);
    }
  }
}

class Shield {
  constructor() {
    this.x = random(width);
    this.y = -50;
    this.size = 50;
    this.speed = 5;
  }

  show() {
    fill(0, 0, 255, 25); // Transparent blue
    image( barrier, this.x -50, this.y-50, this.size*2, this.size*2);
    ellipse(this.x, this.y, this.size, this.size);
  }

  move() {
    this.y += this.speed;
  }

  hits(player) {
    return collideRectCircle(player.x, player.y, player.width, player.height, this.x, this.y, this.size);
  }
}

class HealingAgent {
  constructor() {
    this.x = random(width);
    this.y = -50;
    this.size = 50;
    this.speed = 5;
  }

  show() {
    fill(0, 255, 255, 50); // Transparent green
    image(elixirOfLife, this.x-50, this.y-50, this.size*2, this.size*2);
    ellipse(this.x, this.y, this.size, this.size);
  }

  move() {
    this.y += this.speed;
  }

  hits(player) {
    return collideRectCircle(player.x, player.y, player.width, player.height, this.x, this.y, this.size);
  }
}

function unlockedNewSpaceShip(){
  playerImg = plyrImg2;
  resetGame();
  loop();
}

function unlockedNewSpaceShip3() {
  playerImg = plyrImg3;
  resetGame();
  loop();
}

function unlockedNewSpaceShip4() {
  playerImg = plyrImg4;
  resetGame();
  loop();
}

function unlockedNewSpaceShip5() {
  playerImg = plyrImg5;
  resetGame();
  loop();
}
  
function rePlay() {
   resetGame()
   loop();
  }
