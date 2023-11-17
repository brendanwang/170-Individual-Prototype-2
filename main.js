let title = "Evasion";

let description = `
[Tap] 
Go Up & Down
`;

let characters = [
  `
  lll
  lll
  `,
  `
  lll
  lll
  `,
  `
  ll
  ll
  ll
  ll
  ll
  ll
  ll
  ll
  ll
  ll
  `,
  `
  llllllll
  llllllll
  `
];

let options = {
  theme: "dark",
  isPlayingBgm: true,
  isReplayEnabled: true,
};

let pos;
let vel;
let state;
let move = false;
let isFlipped = false; 
let cPos;
let cSpeed;
let cActive;
let cArray = [];
let diagonalObstacles = [];
let stars = [];
let powerUps = [];
let score = 0;
let highScore = 0;
let isGameOver = false;
let immunityDuration = 0;

let collectedStarThisFrame = false;

function applyPowerUpEffect() {
  immunityDuration = 180; // Set the duration of immunity in ticks (3 seconds at 60 fps)
}

function update() {
  if (!ticks) {
    vel = vec(2);
    pos = vec(9, 50);
    move = false;
    cActive = true;
    cPos = vec(105, 50);
    cSpeed = -2;
  }

  color("white");
  rect(0, 30, 1000, 70);
  color("black");
  if (input.isJustPressed) {
    play("jump")
    isFlipped = !isFlipped;
    move = !move;
  }
  if (isFlipped) {
    if (immunityDuration && ticks % 2 === 0) {
      color("green");
    } else {
      color("black");
      char("a", pos.x, pos.y);
    }
  } else {
    if (immunityDuration && ticks % 2 === 0) {
      color("green");
    } else {
      color("black");
      char("b", pos.x, pos.y);
    }
  }

  if (move === false && pos.y + 1 < 99) {
    pos.y += 1.5;
  }
  if (move === true && pos.y - 1 > 31) {
    pos.y -= 1.5;
  }

  if (cArray.length < 7) {
    if (rnd(100) < 10) {
      const newC = {
        pos: vec(105, rnd(33, 99)),
        speed: rnd(0.8, 1.5) * -1,
        active: true
      };
      cArray.push(newC);
    }
  }

  if (diagonalObstacles.length < 10) {
    if (rnd(200) < 10) {
      const newDiagonalObstacle = {
        pos: vec(105, rnd(33, 100)),
        speedX: rnd(0.5, 1.5) * -1,
        speedY: rnd(0.5, 1.5) * (rnd() > 0.5 ? 1 : -1),
        active: true
      };
      diagonalObstacles.push(newDiagonalObstacle);
    }
  }

  if (stars.length < 5) {
    if (rnd(200) < 10) {
      const newStar = {
        pos: vec(105, rnd(33, 100)),
        speed: rnd(0.8, 1.5) * -1,
        active: true
      };
      stars.push(newStar);
    }
  }

  if (powerUps.length < 3) {
    if (rnd(300) < 5) {
      const newPowerUp = {
        pos: vec(105, rnd(33, 100)),
        speed: rnd(0.8, 1.5) * -1,
        active: true,
        duration: 500
      };
      powerUps.push(newPowerUp);
    }
  }

  stars.forEach((star, i) => {
    if (star.active) {
      star.pos.x += star.speed;
      color("yellow");
      char("*", star.pos);

      if (!immunityDuration && !collectedStarThisFrame && ((isFlipped && char("a", pos.x, pos.y).isColliding.char["*"]) ||
          (!isFlipped && char("b", pos.x, pos.y).isColliding.char["*"]))) {
        play("coin");
        score += 1;
        collectedStarThisFrame = true;
        stars.splice(i, 1);
      }

      if (star.pos.x < -5) {
        stars.splice(i, 1);
      }
    }
  });

  powerUps.forEach((powerUp, i) => {
    if (powerUp.active) {
      powerUp.pos.x += powerUp.speed;
      color("green");
      char("P", powerUp.pos);

      if (!immunityDuration && ((isFlipped && char("a", pos.x, pos.y).isColliding.char["P"]) ||
          (!isFlipped && char("b", pos.x, pos.y).isColliding.char["P"]))) {
        play("powerUp");
        powerUp.active = false;
        applyPowerUpEffect();
      }

      if (powerUp.pos.x < -5) {
        powerUps.splice(i, 1);
      }
    }
  });

  diagonalObstacles.forEach((diagonalObstacle, i) => {
    if (diagonalObstacle.active) {
      diagonalObstacle.pos.x += diagonalObstacle.speedX;
      diagonalObstacle.pos.y += diagonalObstacle.speedY;
      color("red");
      if (immunityDuration && ticks % 2 === 0) {
        color("transparent");
      } else {
        color("black");
        char("d", diagonalObstacle.pos);
      }

      if (!immunityDuration && ((isFlipped && char("a", pos.x, pos.y).isColliding.char.d) ||
          (!isFlipped && char("b", pos.x, pos.y).isColliding.char.d))) {
        play("explosion");
        isGameOver = true;

        if (score > highScore) {
          highScore = score;
        }
      }

      if (diagonalObstacle.pos.x < -5 || diagonalObstacle.pos.y < 30 || diagonalObstacle.pos.y > 100) {
        diagonalObstacles.splice(i, 1);
      }
    }
  });

  cArray.forEach((c, i) => {
    if (c.active) {
      c.pos.x += c.speed;
      color("red");
      if (immunityDuration && ticks % 2 === 0) {
        color("transparent");
      } else {
        color("black");
        char("c", c.pos);
      }

      if (c.pos.x < -5) {
        cArray.splice(i, 1);
      }
    }
  });

  color("black");
  if (immunityDuration && ticks % 2 === 0) {
    color("transparent");
  } else {
    char("b", pos.x, pos.y);
  }

  if (!isGameOver) {
    cArray.forEach((c, i) => {
      if (c.active) {
        if (!immunityDuration && ((isFlipped && char("a", pos.x, pos.y).isColliding.char.c) ||
            (!isFlipped && char("b", pos.x, pos.y).isColliding.char.c))) {
          play("explosion");
          isGameOver = true;

          if (score > highScore) {
            highScore = score;
          }
        }

        if (immunityDuration && ticks % 2 === 0) {
          color("transparent");
        } else {
          color("black");
          char("c", c.pos);
        }

        if (c.pos.x < -5) {
          cArray.splice(i, 1);
        }
      }
    });

    color("black");
    text(`Score: ${score}`, 6, 12);
    text(`High Score: ${highScore}`, 6, 24);
  } else {
    color("white");
    rect(0, 0, 1000, 1000); 
    color("red");
    text("Game Over", 25, 30);
    text(`Score:${score}`, 27, 50);
    text(`High Score:${highScore}`, 15, 70);

    color("black");
    text("Tap to Restart", 8 , 60);

    if (input.isJustPressed) {
      isGameOver = false; 
      score = 0; 
      pos = vec(9, 50); 

      cArray = [];
      diagonalObstacles = [];
      stars = [];
      powerUps = [];

      play("select"); 
    }
  }

  collectedStarThisFrame = false;

  if (immunityDuration > 0) {
    immunityDuration--;
  }
}

addEventListener("load", () => {
  init({
    update: update,
    title: title,
    description: description,
    characters: characters,
    options: options,
  });
});
