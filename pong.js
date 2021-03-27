//=============================================================================
// PONG
//=============================================================================

Pong = {

  Defaults: {
    width: 640,   // logical canvas width (browser will scale to physical canvas size - which is controlled by @media css queries)
    height: 480,   // logical canvas height (ditto)
    wallWidth: 12,
    paddleWidth: 12,
    paddleHeight: 60,
    paddleSpeed: 2,     // should be able to cross court vertically   in 2 seconds
    ballSpeed: 4,     // should be able to cross court horizontally in 4 seconds, at starting speed ...
    ballAccel: 8,     // ... but accelerate as time passes
    ballRadius: 5,
    sound: true
  },

  Colors: {
    walls: 'white',
    ball: 'white',
    score: 'white',
    footprint: '#333',
    predictionGuess: 'yellow',
    predictionExact: 'red'
  },

  Images: [
    "images/press1.png",
    "images/press2.png",
    "images/winner.png"
  ],

  Levels: [
    { aiReaction: 0.2, aiError: 40 }, // 0:  ai is losing by 8
    { aiReaction: 0.3, aiError: 50 }, // 1:  ai is losing by 7
    { aiReaction: 0.4, aiError: 60 }, // 2:  ai is losing by 6
    { aiReaction: 0.5, aiError: 70 }, // 3:  ai is losing by 5
    { aiReaction: 0.6, aiError: 80 }, // 4:  ai is losing by 4
    { aiReaction: 0.7, aiError: 90 }, // 5:  ai is losing by 3
    { aiReaction: 0.8, aiError: 100 }, // 6:  ai is losing by 2
    { aiReaction: 0.9, aiError: 110 }, // 7:  ai is losing by 1
    { aiReaction: 1.0, aiError: 120 }, // 8:  tie
    { aiReaction: 1.1, aiError: 130 }, // 9:  ai is winning by 1
    { aiReaction: 1.2, aiError: 140 }, // 10: ai is winning by 2
    { aiReaction: 1.3, aiError: 150 }, // 11: ai is winning by 3
    { aiReaction: 1.4, aiError: 160 }, // 12: ai is winning by 4
    { aiReaction: 1.5, aiError: 170 }, // 13: ai is winning by 5
    { aiReaction: 1.6, aiError: 180 }, // 14: ai is winning by 6
    { aiReaction: 1.7, aiError: 190 }, // 15: ai is winning by 7
    { aiReaction: 1.8, aiError: 200 }  // 16: ai is winning by 8
  ],

  //-----------------------------------------------------------------------------

  initialize: function (runner, cfg) {
    Game.loadImages(Pong.Images, function (images) {
      this.cfg = cfg;
      this.runner = runner;
      this.width = runner.width;
      this.height = runner.height;
      this.images = images;
      this.playing = false;
      this.scores = [0, 0];
      this.menu = Object.construct(Pong.Menu, this);
      this.court = Object.construct(Pong.Court, this);
      this.leftPaddle = Object.construct(Pong.Paddle, this);
      this.rightPaddle = Object.construct(Pong.Paddle, this, true);
      this.ball = Object.construct(Pong.Ball, this);
      this.sounds = Object.construct(Pong.Sounds, this);
      this.runner.start();
      my_game.initialize(this);
    }.bind(this));
  },

  startDemo: function () { this.start(0); },
  startSinglePlayer: function () { this.start(1); },
  startDoublePlayer: function () { this.start(2); },

  start: function (numPlayers) {
    if (!this.playing) {
      this.scores = [0, 0];
      this.playing = true;
      this.leftPaddle.setAuto(numPlayers < 1, this.level(0));
      this.rightPaddle.setAuto(numPlayers < 2, this.level(1));
      this.ball.reset();
      this.runner.hideCursor();
    }
  },

  stop: function (ask) {
    if (this.playing) {
      if (!ask || this.runner.confirm('Abandon game in progress ?')) {
        this.playing = false;
        this.leftPaddle.setAuto(false);
        this.rightPaddle.setAuto(false);
        this.runner.showCursor();
      }
    }
  },

  level: function (playerNo) {
    return 8 + (this.scores[playerNo] - this.scores[playerNo ? 0 : 1]);
  },

  goal: function (playerNo) {
    this.sounds.goal();
    this.scores[playerNo] += 1;
    if (this.scores[playerNo] == 9) {
      this.menu.declareWinner(playerNo);
      this.stop();
    }
    else {
      this.ball.reset(playerNo);
      this.leftPaddle.setLevel(this.level(0));
      this.rightPaddle.setLevel(this.level(1));
    }
  },

  update: function (dt) {
    this.leftPaddle.update(dt, this.ball);
    this.rightPaddle.update(dt, this.ball);
    if (this.playing) {
      var dx = this.ball.dx;
      var dy = this.ball.dy;
      this.ball.update(dt, this.leftPaddle, this.rightPaddle);
      if (this.ball.dx < 0 && dx > 0)
        this.sounds.ping();
      else if (this.ball.dx > 0 && dx < 0)
        this.sounds.pong();
      else if (this.ball.dy * dy < 0)
        this.sounds.wall();

      if (this.ball.left > this.width)
        this.goal(0);
      else if (this.ball.right < 0)
        this.goal(1);
    }
  },

  draw: function (ctx) {
    this.court.draw(ctx, this.scores[0], this.scores[1]);
    this.leftPaddle.draw(ctx);
    this.rightPaddle.draw(ctx);
    if (this.playing)
      this.ball.draw(ctx);
    else
      this.menu.draw(ctx);
  },

  onkeypress: function (keyCode) {
    my_game.onKeyHold && my_game.onKeyHold(keyboardMap[keyCode].toUpperCase(), keyCode);
  },

  onkeydown: function (keyCode) {
    switch (keyCode) {
      case Game.KEY.ZERO: this.startDemo(); break;
      case Game.KEY.ONE: this.startSinglePlayer(); break;
      case Game.KEY.TWO: this.startDoublePlayer(); break;
      case Game.KEY.ESC: this.stop(true); break;

      // case Game.KEY.Q: if (!this.leftPaddle.auto) this.leftPaddle.moveUp(); break;
      // case Game.KEY.A: if (!this.leftPaddle.auto) this.leftPaddle.moveDown(); break;
      // case Game.KEY.P: if (!this.rightPaddle.auto) this.rightPaddle.moveUp(); break;
      // case Game.KEY.L: if (!this.rightPaddle.auto) this.rightPaddle.moveDown(); break;
    }

    my_game.onKeyPress(keyboardMap[keyCode].toUpperCase(), keyCode);
  },

  onkeyup: function (keyCode) {
    switch (keyCode) {
      // case Game.KEY.Q: if (!this.leftPaddle.auto) this.leftPaddle.stopMovingUp(); break;
      // case Game.KEY.A: if (!this.leftPaddle.auto) this.leftPaddle.stopMovingDown(); break;
      // case Game.KEY.P: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingUp(); break;
      // case Game.KEY.L: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingDown(); break;
    }

    my_game.onKeyRelease(keyboardMap[keyCode].toUpperCase(), keyCode);
  },

  showStats: function (on) { this.cfg.stats = on; },
  showFootprints: function (on) { this.cfg.footprints = on; this.ball.footprints = []; },
  showPredictions: function (on) { this.cfg.predictions = on; },
  enableSound: function (on) { this.cfg.sound = on; },

  //=============================================================================
  // MENU
  //=============================================================================

  Menu: {

    initialize: function (pong) {
      var press1 = pong.images["images/press1.png"];
      var press2 = pong.images["images/press2.png"];
      var winner = pong.images["images/winner.png"];
      this.press1 = { image: press1, x: 10, y: pong.cfg.wallWidth };
      this.press2 = { image: press2, x: (pong.width - press2.width - 10), y: pong.cfg.wallWidth };
      this.winner1 = { image: winner, x: (pong.width / 2) - winner.width - pong.cfg.wallWidth, y: 6 * pong.cfg.wallWidth };
      this.winner2 = { image: winner, x: (pong.width / 2) + pong.cfg.wallWidth, y: 6 * pong.cfg.wallWidth };
    },

    declareWinner: function (playerNo) {
      this.winner = playerNo;
    },

    draw: function (ctx) {
      ctx.drawImage(this.press1.image, this.press1.x, this.press1.y);
      ctx.drawImage(this.press2.image, this.press2.x, this.press2.y);
      if (this.winner == 0)
        ctx.drawImage(this.winner1.image, this.winner1.x, this.winner1.y);
      else if (this.winner == 1)
        ctx.drawImage(this.winner2.image, this.winner2.x, this.winner2.y);
    }

  },

  //=============================================================================
  // SOUNDS
  //=============================================================================

  Sounds: {

    initialize: function (pong) {
      this.game = pong;
      this.supported = Game.ua.hasAudio;
      if (this.supported) {
        this.files = {
          ping: Game.createAudio("sounds/ping.wav"),
          pong: Game.createAudio("sounds/pong.wav"),
          wall: Game.createAudio("sounds/wall.wav"),
          goal: Game.createAudio("sounds/goal.wav")
        };
      }
    },

    play: function (name) {
      if (this.supported && this.game.cfg.sound && this.files[name])
        this.files[name].play();
    },

    ping: function () { this.play('ping'); },
    pong: function () { this.play('pong'); },
    wall: function () { /*this.play('wall');*/ },
    goal: function () { /*this.play('goal');*/ }

  },

  //=============================================================================
  // COURT
  //=============================================================================

  Court: {

    initialize: function (pong) {
      var w = pong.width;
      var h = pong.height;
      var ww = pong.cfg.wallWidth;

      this.ww = ww;
      this.walls = [];
      this.walls.push({ x: 0, y: 0, width: w, height: ww });
      this.walls.push({ x: 0, y: h - ww, width: w, height: ww });
      var nMax = (h / (ww * 2));
      for (var n = 0; n < nMax; n++) { // draw dashed halfway line
        this.walls.push({
          x: (w / 2) - (ww / 2),
          y: (ww / 2) + (ww * 2 * n),
          width: ww, height: ww
        });
      }

      var sw = 3 * ww;
      var sh = 4 * ww;
      this.score1 = { x: 0.5 + (w / 2) - 1.5 * ww - sw, y: 2 * ww, w: sw, h: sh };
      this.score2 = { x: 0.5 + (w / 2) + 1.5 * ww, y: 2 * ww, w: sw, h: sh };
    },

    draw: function (ctx, scorePlayer1, scorePlayer2) {
      ctx.fillStyle = Pong.Colors.walls;
      for (var n = 0; n < this.walls.length; n++)
        ctx.fillRect(this.walls[n].x, this.walls[n].y, this.walls[n].width, this.walls[n].height);
      this.drawDigit(ctx, scorePlayer1, this.score1.x, this.score1.y, this.score1.w, this.score1.h);
      this.drawDigit(ctx, scorePlayer2, this.score2.x, this.score2.y, this.score2.w, this.score2.h);
    },

    drawDigit: function (ctx, n, x, y, w, h) {
      ctx.fillStyle = Pong.Colors.score;
      var dw = dh = this.ww * 4 / 5;
      var blocks = Pong.Court.DIGITS[n];
      if (blocks[0])
        ctx.fillRect(x, y, w, dh);
      if (blocks[1])
        ctx.fillRect(x, y, dw, h / 2);
      if (blocks[2])
        ctx.fillRect(x + w - dw, y, dw, h / 2);
      if (blocks[3])
        ctx.fillRect(x, y + h / 2 - dh / 2, w, dh);
      if (blocks[4])
        ctx.fillRect(x, y + h / 2, dw, h / 2);
      if (blocks[5])
        ctx.fillRect(x + w - dw, y + h / 2, dw, h / 2);
      if (blocks[6])
        ctx.fillRect(x, y + h - dh, w, dh);
    },

    DIGITS: [
      [1, 1, 1, 0, 1, 1, 1], // 0
      [0, 0, 1, 0, 0, 1, 0], // 1
      [1, 0, 1, 1, 1, 0, 1], // 2
      [1, 0, 1, 1, 0, 1, 1], // 3
      [0, 1, 1, 1, 0, 1, 0], // 4
      [1, 1, 0, 1, 0, 1, 1], // 5
      [1, 1, 0, 1, 1, 1, 1], // 6
      [1, 0, 1, 0, 0, 1, 0], // 7
      [1, 1, 1, 1, 1, 1, 1], // 8
      [1, 1, 1, 1, 0, 1, 0]  // 9
    ]

  },

  //=============================================================================
  // PADDLE
  //=============================================================================

  Paddle: {

    initialize: function (pong, rhs) {
      this.pong = pong;
      this.width = pong.cfg.paddleWidth;
      this.height = pong.cfg.paddleHeight;
      this.minY = pong.cfg.wallWidth;
      this.maxY = pong.height - pong.cfg.wallWidth - this.height;
      this.speed = (this.maxY - this.minY) / pong.cfg.paddleSpeed;
      this.setpos(rhs ? pong.width - this.width : 0, this.minY + (this.maxY - this.minY) / 2);
      this.setdir(0);
      this.color = Pong.Colors.walls;
    },

    setpos: function (x, y) {
      this.x = x;
      this.y = y;
      this.left = this.x;
      this.right = this.left + this.width;
      this.top = this.y;
      this.bottom = this.y + this.height;
    },

    setdir: function (dy) {
      this.up = (dy < 0 ? -dy : 0);
      this.down = (dy > 0 ? dy : 0);
    },

    setAuto: function (on, level) {
      if (on && !this.auto) {
        this.auto = true;
        this.setLevel(level);
      }
      else if (!on && this.auto) {
        this.auto = false;
        this.setdir(0);
      }
    },

    setLevel: function (level) {
      if (this.auto)
        this.level = Pong.Levels[level];
    },

    update: function (dt, ball) {
      if (this.auto)
        this.ai(dt, ball);

      var amount = this.down - this.up;
      if (amount != 0) {
        var y = this.y + (amount * dt * this.speed);
        if (y < this.minY)
          y = this.minY;
        else if (y > this.maxY)
          y = this.maxY;
        this.setpos(this.x, y);
      }
    },

    ai: function (dt, ball) {
      if (((ball.x < this.left) && (ball.dx < 0)) ||
        ((ball.x > this.right) && (ball.dx > 0))) {
        this.stopMovingUp();
        this.stopMovingDown();
        return;
      }

      this.predict(ball, dt);

      if (this.prediction) {
        if (this.prediction.y < (this.top + this.height / 2 - 5)) {
          this.stopMovingDown();
          this.moveUp();
        }
        else if (this.prediction.y > (this.bottom - this.height / 2 + 5)) {
          this.stopMovingUp();
          this.moveDown();
        }
        else {
          this.stopMovingUp();
          this.stopMovingDown();
        }
      }
    },

    predict: function (ball, dt) {
      // only re-predict if the ball changed direction, or its been some amount of time since last prediction
      if (this.prediction &&
        ((this.prediction.dx * ball.dx) > 0) &&
        ((this.prediction.dy * ball.dy) > 0) &&
        (this.prediction.since < this.level.aiReaction)) {
        this.prediction.since += dt;
        return;
      }

      var pt = Pong.Helper.ballIntercept(ball, { left: this.left, right: this.right, top: -10000, bottom: 10000 }, ball.dx * 10, ball.dy * 10);
      if (pt) {
        var t = this.minY + ball.radius;
        var b = this.maxY + this.height - ball.radius;

        while ((pt.y < t) || (pt.y > b)) {
          if (pt.y < t) {
            pt.y = t + (t - pt.y);
          }
          else if (pt.y > b) {
            pt.y = t + (b - t) - (pt.y - b);
          }
        }
        this.prediction = pt;
      }
      else {
        this.prediction = null;
      }

      if (this.prediction) {
        this.prediction.since = 0;
        this.prediction.dx = ball.dx;
        this.prediction.dy = ball.dy;
        this.prediction.radius = ball.radius;
        this.prediction.exactX = this.prediction.x;
        this.prediction.exactY = this.prediction.y;
        var closeness = (ball.dx < 0 ? ball.x - this.right : this.left - ball.x) / this.pong.width;
        var error = this.level.aiError * closeness;
        this.prediction.y = this.prediction.y + Game.random(-error, error);
      }
    },

    setColor: function (color) {
      this.color = color;
    },

    draw: function (ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      if (this.prediction && this.pong.cfg.predictions) {
        ctx.strokeStyle = Pong.Colors.predictionExact;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.exactY - this.prediction.radius, this.prediction.radius * 2, this.prediction.radius * 2);
        ctx.strokeStyle = Pong.Colors.predictionGuess;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.y - this.prediction.radius, this.prediction.radius * 2, this.prediction.radius * 2);
      }
    },

    moveUp: function () { this.up = 1; },
    moveDown: function () { this.down = 1; },
    stopMovingUp: function () { this.up = 0; },
    stopMovingDown: function () { this.down = 0; }

  },

  //=============================================================================
  // BALL
  //=============================================================================

  Ball: {

    initialize: function (pong) {
      this.pong = pong;
      this.radius = pong.cfg.ballRadius;
      this.minX = this.radius;
      this.maxX = pong.width - this.radius;
      this.minY = pong.cfg.wallWidth + this.radius;
      this.maxY = pong.height - pong.cfg.wallWidth - this.radius;
      this.speed = (this.maxX - this.minX) / pong.cfg.ballSpeed;
      this.accel = pong.cfg.ballAccel;
      this.color = Pong.Colors.ball;
    },

    setSpeed: function (speed) {
      if (speed == 0) {
        this.speed = 0;
      } else {
        this.speed = (this.maxX - this.minX) / Math.min(Math.max(10 - speed, 1), 10);
      }
    },
    reset: function (playerNo) {
      this.footprints = [];
      this.setpos(playerNo == 1 ? this.maxX : this.minX, Game.random(this.minY, this.maxY));
      this.setdir(playerNo == 1 ? -this.speed : this.speed, this.speed);
    },

    setpos: function (x, y) {
      this.x = x;
      this.y = y;
      this.left = this.x - this.radius;
      this.top = this.y - this.radius;
      this.right = this.x + this.radius;
      this.bottom = this.y + this.radius;
    },

    setdir: function (dx, dy) {
      this.dxChanged = ((this.dx < 0) != (dx < 0)); // did horizontal direction change
      this.dyChanged = ((this.dy < 0) != (dy < 0)); // did vertical direction change
      this.dx = dx;
      this.dy = dy;
    },

    footprint: function () {
      if (this.pong.cfg.footprints) {
        if (!this.footprintCount || this.dxChanged || this.dyChanged) {
          this.footprints.push({ x: this.x, y: this.y });
          if (this.footprints.length > 50)
            this.footprints.shift();
          this.footprintCount = 5;
        }
        else {
          this.footprintCount--;
        }
      }
    },

    update: function (dt, leftPaddle, rightPaddle) {

      pos = Pong.Helper.accelerate(this.x, this.y, this.dx, this.dy, this.accel, dt);

      if ((pos.dy > 0) && (pos.y > this.maxY)) {
        pos.y = this.maxY;
        pos.dy = -pos.dy;
      }
      else if ((pos.dy < 0) && (pos.y < this.minY)) {
        pos.y = this.minY;
        pos.dy = -pos.dy;
      }

      var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;
      var pt = Pong.Helper.ballIntercept(this, paddle, pos.nx, pos.ny);

      if (pt) {
        switch (pt.d) {
          case 'left':
          case 'right':
            pos.x = pt.x;
            pos.dx = -pos.dx;
            break;
          case 'top':
          case 'bottom':
            pos.y = pt.y;
            pos.dy = -pos.dy;
            break;
        }

        // add/remove spin based on paddle direction
        if (paddle.up)
          pos.dy = pos.dy * (pos.dy < 0 ? 0.5 : 1.5);
        else if (paddle.down)
          pos.dy = pos.dy * (pos.dy > 0 ? 0.5 : 1.5);
      }

      this.setpos(pos.x, pos.y);
      this.setdir(pos.dx, pos.dy);
      this.footprint();
    },

    setColor: function (color) {
      this.color = color;
    },

    draw: function (ctx) {
      var w = h = this.radius * 2;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.radius, this.y - this.radius, w, h);
      if (this.pong.cfg.footprints) {
        var max = this.footprints.length;
        ctx.strokeStyle = Pong.Colors.footprint;
        for (var n = 0; n < max; n++)
          ctx.strokeRect(this.footprints[n].x - this.radius, this.footprints[n].y - this.radius, w, h);
      }
    }

  },

  //=============================================================================
  // HELPER
  //=============================================================================

  Helper: {

    accelerate: function (x, y, dx, dy, accel, dt) {
      var x2 = x + (dt * dx) + (accel * dt * dt * 0.5);
      var y2 = y + (dt * dy) + (accel * dt * dt * 0.5);
      var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
      var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
      return { nx: (x2 - x), ny: (y2 - y), x: x2, y: y2, dx: dx2, dy: dy2 };
    },

    intercept: function (x1, y1, x2, y2, x3, y3, x4, y4, d) {
      var denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
      if (denom != 0) {
        var ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
        if ((ua >= 0) && (ua <= 1)) {
          var ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            var x = x1 + (ua * (x2 - x1));
            var y = y1 + (ua * (y2 - y1));
            return { x: x, y: y, d: d };
          }
        }
      }
      return null;
    },

    ballIntercept: function (ball, rect, nx, ny) {
      var pt;
      if (nx < 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
          rect.right + ball.radius,
          rect.top - ball.radius,
          rect.right + ball.radius,
          rect.bottom + ball.radius,
          "right");
      }
      else if (nx > 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
          rect.left - ball.radius,
          rect.top - ball.radius,
          rect.left - ball.radius,
          rect.bottom + ball.radius,
          "left");
      }
      if (!pt) {
        if (ny < 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
            rect.left - ball.radius,
            rect.bottom + ball.radius,
            rect.right + ball.radius,
            rect.bottom + ball.radius,
            "bottom");
        }
        else if (ny > 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
            rect.left - ball.radius,
            rect.top - ball.radius,
            rect.right + ball.radius,
            rect.top - ball.radius,
            "top");
        }
      }
      return pt;
    }

  }

  //=============================================================================

}; // Pong

var keyboardMap = [
  "", // [0]
  "", // [1]
  "", // [2]
  "CANCEL", // [3]
  "", // [4]
  "", // [5]
  "HELP", // [6]
  "", // [7]
  "BACK_SPACE", // [8]
  "TAB", // [9]
  "", // [10]
  "", // [11]
  "CLEAR", // [12]
  "ENTER", // [13]
  "ENTER_SPECIAL", // [14]
  "", // [15]
  "SHIFT", // [16]
  "CONTROL", // [17]
  "ALT", // [18]
  "PAUSE", // [19]
  "CAPS_LOCK", // [20]
  "KANA", // [21]
  "EISU", // [22]
  "JUNJA", // [23]
  "FINAL", // [24]
  "HANJA", // [25]
  "", // [26]
  "ESCAPE", // [27]
  "CONVERT", // [28]
  "NONCONVERT", // [29]
  "ACCEPT", // [30]
  "MODECHANGE", // [31]
  "SPACE", // [32]
  "PAGE_UP", // [33]
  "PAGE_DOWN", // [34]
  "END", // [35]
  "HOME", // [36]
  "LEFT", // [37]
  "UP", // [38]
  "RIGHT", // [39]
  "DOWN", // [40]
  "SELECT", // [41]
  "PRINT", // [42]
  "EXECUTE", // [43]
  "PRINTSCREEN", // [44]
  "INSERT", // [45]
  "DELETE", // [46]
  "", // [47]
  "0", // [48]
  "1", // [49]
  "2", // [50]
  "3", // [51]
  "4", // [52]
  "5", // [53]
  "6", // [54]
  "7", // [55]
  "8", // [56]
  "9", // [57]
  "COLON", // [58]
  "SEMICOLON", // [59]
  "LESS_THAN", // [60]
  "EQUALS", // [61]
  "GREATER_THAN", // [62]
  "QUESTION_MARK", // [63]
  "AT", // [64]
  "A", // [65]
  "B", // [66]
  "C", // [67]
  "D", // [68]
  "E", // [69]
  "F", // [70]
  "G", // [71]
  "H", // [72]
  "I", // [73]
  "J", // [74]
  "K", // [75]
  "L", // [76]
  "M", // [77]
  "N", // [78]
  "O", // [79]
  "P", // [80]
  "Q", // [81]
  "R", // [82]
  "S", // [83]
  "T", // [84]
  "U", // [85]
  "V", // [86]
  "W", // [87]
  "X", // [88]
  "Y", // [89]
  "Z", // [90]
  "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
  "", // [92]
  "CONTEXT_MENU", // [93]
  "", // [94]
  "SLEEP", // [95]
  "NUMPAD0", // [96]
  "NUMPAD1", // [97]
  "NUMPAD2", // [98]
  "NUMPAD3", // [99]
  "NUMPAD4", // [100]
  "NUMPAD5", // [101]
  "NUMPAD6", // [102]
  "NUMPAD7", // [103]
  "NUMPAD8", // [104]
  "NUMPAD9", // [105]
  "MULTIPLY", // [106]
  "ADD", // [107]
  "SEPARATOR", // [108]
  "SUBTRACT", // [109]
  "DECIMAL", // [110]
  "DIVIDE", // [111]
  "F1", // [112]
  "F2", // [113]
  "F3", // [114]
  "F4", // [115]
  "F5", // [116]
  "F6", // [117]
  "F7", // [118]
  "F8", // [119]
  "F9", // [120]
  "F10", // [121]
  "F11", // [122]
  "F12", // [123]
  "F13", // [124]
  "F14", // [125]
  "F15", // [126]
  "F16", // [127]
  "F17", // [128]
  "F18", // [129]
  "F19", // [130]
  "F20", // [131]
  "F21", // [132]
  "F22", // [133]
  "F23", // [134]
  "F24", // [135]
  "", // [136]
  "", // [137]
  "", // [138]
  "", // [139]
  "", // [140]
  "", // [141]
  "", // [142]
  "", // [143]
  "NUM_LOCK", // [144]
  "SCROLL_LOCK", // [145]
  "WIN_OEM_FJ_JISHO", // [146]
  "WIN_OEM_FJ_MASSHOU", // [147]
  "WIN_OEM_FJ_TOUROKU", // [148]
  "WIN_OEM_FJ_LOYA", // [149]
  "WIN_OEM_FJ_ROYA", // [150]
  "", // [151]
  "", // [152]
  "", // [153]
  "", // [154]
  "", // [155]
  "", // [156]
  "", // [157]
  "", // [158]
  "", // [159]
  "CIRCUMFLEX", // [160]
  "EXCLAMATION", // [161]
  "DOUBLE_QUOTE", // [162]
  "HASH", // [163]
  "DOLLAR", // [164]
  "PERCENT", // [165]
  "AMPERSAND", // [166]
  "UNDERSCORE", // [167]
  "OPEN_PAREN", // [168]
  "CLOSE_PAREN", // [169]
  "ASTERISK", // [170]
  "PLUS", // [171]
  "PIPE", // [172]
  "HYPHEN_MINUS", // [173]
  "OPEN_CURLY_BRACKET", // [174]
  "CLOSE_CURLY_BRACKET", // [175]
  "TILDE", // [176]
  "", // [177]
  "", // [178]
  "", // [179]
  "", // [180]
  "VOLUME_MUTE", // [181]
  "VOLUME_DOWN", // [182]
  "VOLUME_UP", // [183]
  "", // [184]
  "", // [185]
  "SEMICOLON", // [186]
  "EQUALS", // [187]
  "COMMA", // [188]
  "MINUS", // [189]
  "PERIOD", // [190]
  "SLASH", // [191]
  "BACK_QUOTE", // [192]
  "", // [193]
  "", // [194]
  "", // [195]
  "", // [196]
  "", // [197]
  "", // [198]
  "", // [199]
  "", // [200]
  "", // [201]
  "", // [202]
  "", // [203]
  "", // [204]
  "", // [205]
  "", // [206]
  "", // [207]
  "", // [208]
  "", // [209]
  "", // [210]
  "", // [211]
  "", // [212]
  "", // [213]
  "", // [214]
  "", // [215]
  "", // [216]
  "", // [217]
  "", // [218]
  "OPEN_BRACKET", // [219]
  "BACK_SLASH", // [220]
  "CLOSE_BRACKET", // [221]
  "QUOTE", // [222]
  "", // [223]
  "META", // [224]
  "ALTGR", // [225]
  "", // [226]
  "WIN_ICO_HELP", // [227]
  "WIN_ICO_00", // [228]
  "", // [229]
  "WIN_ICO_CLEAR", // [230]
  "", // [231]
  "", // [232]
  "WIN_OEM_RESET", // [233]
  "WIN_OEM_JUMP", // [234]
  "WIN_OEM_PA1", // [235]
  "WIN_OEM_PA2", // [236]
  "WIN_OEM_PA3", // [237]
  "WIN_OEM_WSCTRL", // [238]
  "WIN_OEM_CUSEL", // [239]
  "WIN_OEM_ATTN", // [240]
  "WIN_OEM_FINISH", // [241]
  "WIN_OEM_COPY", // [242]
  "WIN_OEM_AUTO", // [243]
  "WIN_OEM_ENLW", // [244]
  "WIN_OEM_BACKTAB", // [245]
  "ATTN", // [246]
  "CRSEL", // [247]
  "EXSEL", // [248]
  "EREOF", // [249]
  "PLAY", // [250]
  "ZOOM", // [251]
  "", // [252]
  "PA1", // [253]
  "WIN_OEM_CLEAR", // [254]
  "" // [255]
];