const polygons = (sketch) => {
  const id = 'polygons';

  var running = false;
  var muted = false;

  var instrument = "xylophone";
  var tempo = 80;
  var volume = 50;

  var display = {
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: false,
    8: false,
    9: false,
    12: false,
    16: false,
  };

  var radius;
  const balls = [];
  const ballSize = 16;

  const sizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 16];
  const maxSize = sizes.at(-1);
  const colors = ["cyan", "red", "lime", "yellow", "magenta", "orange", "cyan", "red", "lime", "", "", "pink", "", "", "", "yellow"];
  const notes = ["C3", "E3", "G3", "C4", "E4", "G4", "C5", "E5", "G5", "", "", "C6", "", "", "", "E6"];

  // p5.js setup
  sketch.setup = () => {
    // setup canvas
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.createCanvas(size, size).id(`canvas-${id}`);
    sketch.frameRate(60);
    radius = Math.min(sketch.width, sketch.height) * 0.9 / 2;

    // add balls
    for (let i = 0; i < maxSize; i++) {
      balls.push({
        angle: 0.0,
        color: colors[i],
        show: false,
        note: notes[i],
        sound: false,
      })
    }

    // render elements and add listeners
    appendCanvas(id);
    Object.keys(display).forEach(val => createCheckbox(id, val, display[val]));
    addListeners({
      "#play": play,
      "#reset": reset,
      "#mute": mute,
      ".tabs button": stop,
      ".module-start": play,
    });
    addCheckboxListeners(toggle);
  };

  // p5.js draw loop
  sketch.draw = () => {
    sketch.clear();
    sketch.background(0);
    for (let size = maxSize; size > 0; size--) {
      if (display[size.toString()]) {
        drawShape(size);
      }
    }
    for (let size = maxSize; size > 0; size--) {
      if (display[size.toString()]) {
        drawBall(size);
      }
    }
    moveBalls();
  };

  // canvas resize
  sketch.windowResized = () => {
    const initial = running;
    running = false;
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.resizeCanvas(size, size);
    radius = Math.min(sketch.width, sketch.height) * 0.9 / 2;
    running = initial;
  };

  // draw track shape
  const drawShape = (size) => {
    sketch.stroke(colors[size - 1]);
    sketch.strokeWeight(sketch.width / 200);
    sketch.noFill();
    if (size === 1) {
      sketch.circle(sketch.width / 2, sketch.height / 2, radius * 2);
    }
    else if (size === 2) {
      sketch.line(sketch.width / 2, sketch.height / 2 - radius, sketch.width / 2, sketch.height / 2 + radius);
    }
    else {
      for (let i = 0; i < size; i++) {
        const subdivision = 2 * Math.PI / size;
        sketch.line(sketch.width / 2 + radius * Math.cos(3 * Math.PI / 2 + subdivision * i),
                    sketch.height / 2 + radius * Math.sin(3 * Math.PI / 2 + subdivision * i),
                    sketch.width / 2 + radius * Math.cos(3 * Math.PI / 2 + subdivision * (i + 1)),
                    sketch.height / 2 + radius * Math.sin(3 * Math.PI / 2 + subdivision * (i + 1)));
      }
    }
  };

  // draw ball and handle collision sounds
  const drawBall = (size) => {
    sketch.stroke(colors[size - 1]);
    sketch.fill(colors[size - 1]);
    const ball = balls[size - 1];
    const theta = ball.angle * Math.PI / 180;
    if (size === 1) {
      const xPos = sketch.width / 2 + radius * Math.cos(-theta + Math.PI / 2);
      const yPos = sketch.height / 2 - radius * Math.sin(-theta + Math.PI / 2);
      ballCollision(ball, ball.angle);
      sketch.circle(xPos, yPos, ballSize);
      sketch.drawingContext.shadowBlur = 0;
    }
    else {
      const xValues = [];
      const yValues = [];
      for (let i = 0; i < size; i++) {
        const subdivision = 2 * Math.PI / size;
        xValues.push([sketch.width / 2 + radius * Math.cos(3 * Math.PI / 2 + subdivision * i), sketch.width / 2 + radius * Math.cos(3 * Math.PI / 2 + subdivision * (i + 1))]);
        yValues.push([sketch.height / 2 + radius * Math.sin(3 * Math.PI / 2 + subdivision * i), sketch.height / 2 + radius * Math.sin(3 * Math.PI / 2 + subdivision * (i + 1))]);
      }
      const subdivision = 360 / size;
      const n = Math.floor(ball.angle / subdivision);

      const xFrom = xValues[n][0];
      const xTo = xValues[n][1];
      const xDiff = xTo - xFrom;
      const yFrom = yValues[n][0];
      const yTo = yValues[n][1];
      const yDiff = yTo - yFrom;

      const angleFactor = (ball.angle % subdivision) / subdivision;
      const xPos = xFrom + xDiff * angleFactor;
      const yPos = yFrom + yDiff * angleFactor;

      ballCollision(ball, angleFactor * 100.0);
      sketch.circle(xPos, yPos, ballSize);
      sketch.drawingContext.shadowBlur = 0;
    }
  };

  // play sound and glow on collision
  const ballCollision = (ball, angle) => {
    if (running && angle <= 15.0) {
      sketch.drawingContext.shadowColor = ball.color;
      sketch.drawingContext.shadowBlur = 24;
      if (!ball.sound) {
        ball.sound = true;
        playSound(ball.note);
      }
    }
    if (angle > 15.0 && ball.sound) {
      ball.sound = false;
    }
  };

  // move balls for next frame
  const moveBalls = () => {
    if (running) {
      // angle increment per frame = (90deg * BPM / 60 * FPS) = 1.5 * BPM / FPS
      const delta = 1.5 * tempo / sketch.frameRate();
      balls.forEach(ball => {
        ball.angle = (ball.angle + delta) % 360;
      });
    }
  };

  const resetSounds = () => {
    stopSounds(instrument);
    balls.forEach(ball => ball.sound = false);
  };

  const playSound = (tone) => {
    const duration = instrument === "strings" ? "32n" : (["synth", "flute"].includes(instrument) ? "16n" : "8n");
    const vol = ["synth", "strings"].includes(instrument) ? volume * 2 : volume;
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
      balls.forEach(ball => {
        ball.angle = 0.0;
        ball.sound = false;
      });
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
      balls.forEach(ball => {
        ball.angle = 0.0;
        ball.sound = false;
      });
      tempo = 80;
      volume = 50;
      instrument = "xylophone";
    }
  };

  // shape number toggle
  const toggle = (value) => {
    if (getActiveId() === id) {
      if (value in display) {
        display[value] = !display[value];
      }
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
