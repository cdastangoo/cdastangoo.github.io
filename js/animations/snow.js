const snow = (sketch) => {

  var canvasWidth, canvasHeight;
  var flakes = [];
  var flakeCount = 400;
  const flakeGap = isBrowserSupported() ? 3 : 4;
  const minSize = 4,
        maxSize = 8;
  const maxGrowth = 2;
  const minBrightness = 0.65,
        maxBrightness = 1;
  const minGlow = 4,
        maxGlow = 12;

  // p5 canvas setup
  sketch.setup = () => {
    canvasWidth = $('header').width();
    canvasHeight = $('header').height();
    sketch.createCanvas(canvasWidth, canvasHeight).id('animation-canvas');
    sketch.frameRate(60);

    flakeCount = Math.floor(canvasWidth / flakeGap);
    for (let i = 0; i < flakeCount; i++) {
      addSnow();
    }
    sketch.noStroke();

    // pause animation when canvas not in view
    handleAnimationRunning(sketch);
  }

  // p5 canvas redraw loop
  sketch.draw = () => {
    sketch.clear();
    flakes.forEach(flake => {
      animateFall(flake);
      drawFlake(flake);
    });
  };

  // handle p5 canvas resize
  sketch.windowResized = () => {
    canvasWidth = $('header').width();
    canvasHeight = $('header').height();
    sketch.resizeCanvas(canvasWidth, canvasHeight);
    const newCount = Math.floor(canvasWidth / flakeGap);
    if (newCount > flakeCount) {
      for (let i = 0; i < newCount - flakeCount; i++) {
        addSnow();
      }
    } else if (newCount < flakeCount) {
      flakes.splice(-(flakeCount - newCount));
    }
    flakeCount = newCount;
  };

  // draws snowflake
  const drawFlake = (flake) => {
    const radius = Math.min(sketch.windowWidth, sketch.windowHeight) / 4;
    const sizeFactor = radialGradient(flake.x, flake.y, radius, maxGrowth);
    const brightness = radialGradient(flake.x, flake.y, radius, maxBrightness, minBrightness);
    const glowFactor = radialGradient(flake.x, flake.y, radius, maxGlow, minGlow);
    const color = `rgba(${flake.color}, ${brightness})`;
    sketch.fill(color);
    sketch.drawingContext.shadowColor = color;
    sketch.drawingContext.shadowBlur = glowFactor;
    sketch.circle(flake.x, flake.y, flake.size * sizeFactor);
  };

  // animates the falling spiral motion of a snowflake
  const animateFall = (flake) => {
    if (flake.y < sketch.height + flake.size) {
      const omega = 0.6;
      const time = sketch.frameCount / 60;
      const theta = omega * time + flake.direction;
      flake.x = sketch.width / 2 + flake.offset + flake.spiralRadius * Math.sin(theta);
      flake.y = flake.y + Math.sqrt(flake.size);
    } else {
      resetFlake(flake);
    }
  };

  // resets snowflake once it reaches the bottom of the screen
  const resetFlake = (flake) => {
    flake.x = 0;
    flake.y = sketch.random(0 - flake.size, -100);
    flake.direction = sketch.random(0, -100);
    flake.offset = sketch.random(-sketch.width / 10, sketch.width / 10);
    flake.spiralRadius = Math.sqrt(sketch.random(Math.pow(sketch.width / 2, 2)));
  };

  // creates snowflake with random properties
  const addSnow = () => {
    flakes.push({
      x: 0,
      y: sketch.random(0, sketch.height),
      size: sketch.random(minSize, maxSize),
      direction: sketch.random(0, 2 * Math.PI),
      offset: sketch.random(-sketch.width / 10, sketch.width / 10),
      spiralRadius: Math.sqrt(sketch.random(Math.pow(sketch.width / 2, 2))),
      color: sketch.random(pastelColors),
    });
  };

  // formula for radial gradient based on position relative to mouse pointer
  const radialGradient = (x, y, r, max, min = 1) => {
    const distance = sketch.dist(x, y, sketch.mouseX, sketch.mouseY);
    if (distance > r)
      return min;
    return (1 - distance / r) * (max - min) + min;
  };
};
