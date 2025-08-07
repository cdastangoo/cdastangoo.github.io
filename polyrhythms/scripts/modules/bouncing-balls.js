const bouncingBalls = (sketch) => {
  const id = 'bouncing-balls';

  var running = false;
  var muted = false;

  var instrument = "pluck";
  var beats = 6;
  var tempo = 80;
  var volume = 50;

  const balls = [];
  var initialFall = true;
  const UP = 1;
  const DOWN = -1;
  const HEIGHT_SCALE = 100.0;

  const maxBeats = 8;
  const colors = ["red", "lime", "cyan", "yellow", "magenta", "orange", "blue", "pink"];
  // const notes = ["C2", "D2", "E4", "G4", "A4", "C5"];
  const notes = ["Db1", "Db2", "B4", "Db5", "Gb5", "Bb5", "Db6", "Bb6"];

  // p5.js setup
  sketch.setup = () => {
    // setup canvas
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.createCanvas(size, size).id(`canvas-${id}`);
    sketch.frameRate(60);

    // add balls
    for (let i = 1; i <= beats; i++) {
      balls.push({
        maxHeight: HEIGHT_SCALE / i,
        height: HEIGHT_SCALE / i,
        speed: 0.0,
        direction: DOWN,
        color: colors[i - 1],
        note: notes[i - 1],
        sound: false,
      });
    }

    // render elements and add listeners
    appendCanvas(id);
    addListeners({
      "#play": play,
      "#reset": reset,
      "#mute": mute,
      ".tabs button": stop,
      ".module-start": play,
    });
  };

  // p5.js draw loop
  sketch.draw = () => {
    // reset canvas
    sketch.clear();
    sketch.background(0);
    sketch.stroke("white");
    sketch.strokeWeight(4);
    sketch.noFill();
    sketch.line(sketch.width * 0.1, sketch.height * 0.9 + 2, sketch.width * 0.9, sketch.height * 0.9 + 2);

    // draw and animate balls
    drawBalls();
    moveBalls();
  };

  // canvas resize
  sketch.windowResized = () => {
    const initial = running;
    running = false;
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.resizeCanvas(size, size);
    running = initial;
  };

  // draw balls
  const drawBalls = () => {
    balls.forEach((ball, idx) => {
      const xPos = sketch.width * 0.15 + sketch.width * idx * 0.85 / beats;
      const yPos = sketch.height - (ball.height / HEIGHT_SCALE * sketch.height * 0.75) - sketch.height * 0.15;
      const ballSize = Math.min(sketch.width, sketch.height) * 0.1;
      if (running && ball.sound) {
        sketch.drawingContext.shadowColor = ball.color;
        sketch.drawingContext.shadowBlur = ballSize * 0.8;
      }
      else {
        sketch.drawingContext.shadowBlur = 0;
      }
      sketch.stroke(ball.color);
      sketch.fill(ball.color);
      sketch.circle(xPos, yPos, ballSize);
      if (running) {
        if (ball.height > Math.min(ball.maxHeight * 0.2, 10.0) && ball.direction === UP && ball.sound) {
          ball.sound = false;
        }
      }
    });
  };

  // move ball heights
  // time per bounce = BPM / (n/240)
  // frames per bounce -> FPS / time per bounce
  // movement per frame = distance / frames per bounce = distance / (FPS / (BPM / (n/240)))
  const moveBalls = () => {
    balls.forEach((ball, idx) => {
      const n = idx + 1;
      const timePerBounce = 60 / (0.5 * n * tempo);
      const framesPerBounce = 60 * timePerBounce;
      const delta = ball.maxHeight / framesPerBounce;
      if (running) {
        if (initialFall) {
          if (ball.height - delta <= 0) {
            ball.height = delta - ball.height;
            ball.direction = UP;
            playSound(ball.note);
            ball.sound = true;
            initialFall = false;
            syncBalls();
          }
          else if (idx === 0 || ball.height >= balls[idx - 1].height) {
            ball.height -= delta;
          }
        }
        else {
          if (ball.direction === UP && ball.height + delta >= ball.maxHeight) {
            ball.height = ball.maxHeight - (ball.height + delta - ball.maxHeight);
            ball.direction = DOWN;
          }
          else if (ball.direction === DOWN && ball.height - delta <= 0) {
            ball.height = delta - ball.height;
            ball.direction = UP;
            playSound(ball.note);
            ball.sound = true;
          }
          else {
            ball.height = ball.direction === UP ? ball.height + delta : ball.height - delta;
          }
        }
      }
    });
  };

  // sync when balls collide with the floor (sometimes needed because of float imprecisions)
  const syncBalls = () => {
    balls.forEach(ball => {
      ball.height = 0;
      ball.direction = UP;
      playSound(ball.note);
      ball.sound = true;
    });
  };

  const resetSounds = () => {
    stopSounds(instrument);
    balls.forEach(ball => ball.sound = false);
  };

  const playSound = (tone) => {
    const duration = instrument === "pluck" ? "8n" : (["synth", "wubs", "strings"].includes(instrument) ? "16n" : "32n");
    const vol = ["synth", "strings"].includes(instrument) || (instrument === "pluck" && tone === 'Db1') ? volume * 2 : volume
    if (["flute", "xylophone"].includes(instrument) && parseInt(tone.slice(-1)) <= 2) {
      tone = `Db${parseInt(tone.slice(-1)) + 1}`;
    }
    playInstrument(instrument, tone, duration, vol, muted);
  };

  // play / pause animation
  const play = () => {
    if (getActiveId() === id) {
      running = !running;
      if (!running) {
        resetSounds();
      }
    }
  };

  // reset animation
  const reset = () => {
    if (getActiveId() === id) {
      resetSounds();
      initialFall = true;
      for (let i = 0; i < balls.length; i++) {
        balls[i].height = HEIGHT_SCALE / (i + 1);
        balls[i].speed = 0.0;
        balls[i].direction = UP;
        balls[i].sound = false;
      }
    }
  };

  // mute sounds
  const mute = () => {
    if (getActiveId() === id) {
      muted = !muted;
      if (muted) {
        resetSounds();
      }
    }
  };

  // stop and reset animation
  const stop = () => {
    if (getActiveId() !== id) {
      running = false;
      muted = false;
      resetSounds();
      initialFall = true;
        for (let i = 0; i < balls.length; i++) {
          balls[i].height = HEIGHT_SCALE / (i + 1);
          balls[i].speed = 0.0;
          balls[i].direction = UP;
          balls[i].sound = false;
        }
      tempo = 80;
      volume = 50;
      instrument = "pluck";
    }
  };

  // tempo slider
  $(document).on('input', '#tempo-slider', e => {
    tempo = parseInt($(e.currentTarget).val());
  });

  // instrument type dropdown
  $('select[id=instrument-dropdown]').on('change', e => {
    if (getActiveId() === id) {
      const instrumentType = $(e.currentTarget).val();
      if (instrumentType in instruments) {
        resetSounds();
        instrument = instrumentType;
      } else {
        console.error(`Invalid instrument type ${instrumentType}`);
      }
    }
  });

  // volume slider
  $(document).on('input', '#volume-slider', e => {
    volume = parseInt($(e.currentTarget).val());
  });
};
