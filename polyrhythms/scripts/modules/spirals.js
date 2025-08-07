const spirals = (sketch) => {
  const id = 'spirals';

  var running = false;
  var muted = false;

  var instrument = "bright-piano";
  var volume = 50;
  var ballsCount = 16;

  var outerRadius, innerRadius;
  var balls = [];
  const ballSize = 10;
  const period = 300;

  const scaleTypes = ["Major Pentatonic", "Minor Pentatonic", "Major", "Minor", "Chromatic"];
  const tones = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5", "A5", "C6"];

  // p5.js setup
  sketch.setup = () => {
    // setup canvas
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.createCanvas(size, size).id(`canvas-${id}`);
    sketch.frameRate(60);
    sketch.colorMode(sketch.HSB);
    outerRadius = Math.min(sketch.width, sketch.height) * 0.9 / 2;
    innerRadius = outerRadius * 0.4 / 2;

    // add balls
    for (let i = 0; i < ballsCount; i++) {    
      const radius = i * (outerRadius - innerRadius) / (ballsCount - 1) + innerRadius;
      const speed = (50 - ballsCount + i) * 2 * Math.PI / period;
      const hue = i * 360 / ballsCount;
      balls.push({
        radius: radius,
        angle: 90.0,
        speed: speed,
        hue: hue,
        tone: tones[i],
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
    sketch.clear();
    sketch.background(0);
    drawTrack();

    drawLines();
    drawBalls();
    if (running) {
      moveBalls();
    }
  };

  // canvas resize
  sketch.windowResized = () => {
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.resizeCanvas(size, size);
    outerRadius = Math.min(sketch.width, sketch.height) * 0.9 / 2;
    innerRadius = outerRadius * 0.4 / 2;
    balls.forEach((ball, idx) => {
      ball.radius = idx * (outerRadius - innerRadius) / (ballsCount - 1) + innerRadius;
    });
  };

  // draw track
  const drawTrack = () => {
    sketch.noFill();
    sketch.stroke("white");
    sketch.drawingContext.shadowBlur = 0;
    sketch.strokeWeight(1);
    sketch.line(sketch.width / 2, sketch.height / 2 - outerRadius, sketch.width / 2, sketch.height / 2 - innerRadius);
    sketch.strokeWeight(2);
    sketch.circle(sketch.width / 2, sketch.height / 2, outerRadius * 2);
    sketch.circle(sketch.width / 2, sketch.height / 2, innerRadius * 2);
  };

  // draw connecting lines between balls
  const drawLines = () => {
    sketch.strokeWeight(1);
    for (let b = 0; b < ballsCount - 1; b++) {
      // calculate ball positions
      const theta1 = balls[b].angle * Math.PI / 180;
      const x1 = sketch.width / 2 + balls[b].radius * Math.cos(theta1);
      const y1 = sketch.height / 2 - balls[b].radius * Math.sin(theta1);
      const theta2 = balls[b + 1].angle * Math.PI / 180;
      const x2 = sketch.width / 2 + balls[b + 1].radius * Math.cos(theta2);
      const y2 = sketch.height / 2 - balls[b + 1].radius * Math.sin(theta2);

      // calculate gradient segments
      const d = Math.sqrt(Math.abs(x2 - x1) ** 2 + Math.abs(y2 - y1) ** 2);
      const n = balls[b + 1].hue - balls[b].hue;
      for (let i = 0; i < n; i++) {
        let d1 = i * d / n;
        let d2 = (i + 1) * d / n;
        const startX = (d1 * x2 + (d - d1) * x1) / d;
        const startY = (d1 * y2 + (d - d1) * y1) / d;
        const endX = (i < n - 1) ? (d2 * x2 + (d - d2) * x1) / d : x2;
        const endY = (i < n - 1) ? (d2 * y2 + (d - d2) * y1) / d : y2;
        sketch.stroke(balls[b].hue + i, 100, 100);
        sketch.line(startX, startY, endX, endY);
      }
    }
    sketch.noStroke();
  };

  // draw balls
  const drawBalls = () => {
    balls.forEach(ball => {
      const theta = ball.angle * Math.PI / 180;
      const xPos = sketch.width / 2 + ball.radius * Math.cos(theta);
      const yPos = sketch.height / 2 - ball.radius * Math.sin(theta);
      const inRange = ball.angle >= 90 && ball.angle <= 105;

      if (inRange && running) {
        sketch.drawingContext.shadowColor = `hsl(${ball.hue} 100% 100%)`;
        sketch.drawingContext.shadowBlur = 12;
      }
      else {
        sketch.drawingContext.shadowBlur = 0;
      }
      sketch.fill(ball.hue, 100, 100);
      sketch.circle(xPos, yPos, ballSize);

      if (inRange && running && !ball.sound) {
        ball.sound = true;
        playSound(ball.tone);
      }
      if (ball.angle > 105.0 && running && ball.sound) {
        ball.sound = false;
      }
    });
  };

  // move balls
  const moveBalls = () => {
    balls.forEach(ball => {
      ball.angle = (ball.angle + ball.speed) % 360;
    });
  };

  const resetSounds = () => {
    stopSounds(instrument);
    balls.forEach(ball => ball.sound = false);
  };

  const playSound = (tone) => {
    const vol = instrument === "flute" ? volume * 0.5 : volume;
    playInstrument(instrument, tone, "1n", vol, muted);
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
      for (let i = 0; i < ballsCount; i++) {
        balls[i].angle = 90.0;
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
      for (let i = 0; i < ballsCount; i++) {
        balls[i].angle = 90.0;
      }
      volume = 50;
      instrument = "bright-piano";
    }
  };

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
