const rain = (sketch) => {

  var canvasWidth, canvasHeight;
  var drops = [];
  var dropCount = 250;
  const dropGap = isBrowserSupported() ? (isMac() ? 8 : 4) : 8;
  const minSplashRadius = 15,
        maxSplashRadius = 30;
  const minSplashHeight = 0.8,
        maxSplashHeight = 0.95;
  const minSpeed = 8,
        maxSpeed = 20;
  const minBrightness = 0.25,
        maxBrightness = 0.8;
  const minGlow = 0.5,
        maxGlow = 20;

  // p5 canvas setup
  sketch.setup = () => {
    canvasWidth = $('header').width();
    canvasHeight = $('header').height();
    sketch.createCanvas(canvasWidth, canvasHeight).id('animation-canvas');
    sketch.frameRate(60);

    dropCount = Math.floor(canvasWidth / dropGap);
    for (let i = 0; i < dropCount; i++) {
      addDrop();
    }

    // pause animation when canvas not in view
    handleAnimationRunning(sketch);
  };

  // p5 canvas redraw loop
  sketch.draw = () => {
    sketch.clear();
    drops.forEach(drop => {
      drawDrop(drop);
    });
  };

  // handle p5 canvas resize
  sketch.windowResized = () => {
    canvasWidth = $('header').width();
    canvasHeight = $('header').height();
    sketch.resizeCanvas(canvasWidth, canvasHeight);
    const newCount = Math.floor(canvasWidth / dropGap);
    if (newCount > dropCount) {
      for (let i = 0; i < newCount - dropCount; i++) {
        addDrop();
      }
    } else if (newCount < dropCount) {
      drops.splice(-(dropCount - newCount));
    }
    dropCount = newCount;
  };

  // draw rain drop given it's data
  const drawDrop = (drop) => {
    const length = sketch.width / 10;
    const brightnessFactor = linearGradient(drop.x, length, maxBrightness / minBrightness);
    const brightness = brightnessFactor * drop.opacity;
    const glowFactor = linearGradient(drop.x, length, maxGlow, minGlow);
    const color = `rgba(${drop.color}, ${brightness})`;
    sketch.noStroke();
    sketch.fill(color);
    sketch.drawingContext.shadowColor = color;
    sketch.drawingContext.shadowBlur = glowFactor;
    sketch.ellipse(drop.x, drop.y, 3, drop.height);
    animateFall(drop, color);
  };

  // animate rain drop falling
  const animateFall = (drop, color) => {
    const splashHeight = drop.splashHeight * sketch.height;
    drop.y = Math.min(drop.y + drop.speed, splashHeight);
    if (drop.y >= splashHeight) {
      drop.height = Math.max(drop.height - drop.length / 4, 0);
      if (drop.height <= 0) {
        drawSplash(drop, color, splashHeight);
      }
    }
  };

  // draw rain drop splash ripple
  const drawSplash = (drop, color) => {
    sketch.noFill();
    sketch.strokeWeight(2);
    sketch.stroke(color);
    sketch.ellipse(drop.x, drop.splashHeight * sketch.height + drop.length * 2/3, drop.radius * 2, drop.radius / 2);
    drop.radius = Math.min(drop.radius + drop.speed * 0.1, drop.splashRadius);
    if (drop.radius >= drop.splashRadius) {
      splashFade(drop);
    }
  };

  // animate splash ripple fading
  const splashFade = (drop) => {
    if (drop.opacity > 0) {
      drop.opacity = Math.max(drop.opacity - drop.speed * 0.001, 0);
    } else {
      resetDrop(drop);
    }
  };

  // resets rain drop to random position at top of screen
  const resetDrop = (drop) => {
    drop.x = sketch.random(0, sketch.width);
    drop.y = sketch.random(0, -100);
    drop.radius = 0;
    drop.height = drop.length;
    drop.opacity = minBrightness;
  };

  // create rain drop with random properties
  const addDrop = () => {
    const initialSpeed = sketch.random(minSpeed, maxSpeed);
    drops.push({
      x: sketch.random(0, sketch.width),
      y: sketch.random(0, -1000),
      speed: initialSpeed,
      height: initialSpeed * 2,
      length: initialSpeed * 2,
      radius: 0,
      splashRadius: sketch.random(minSplashRadius, maxSplashRadius),
      splashHeight: sketch.random(minSplashHeight, maxSplashHeight),
      color: sketch.random(neonColors),
      opacity: minBrightness,
    });
  };

  // returns adjusted drop opacity in linear gradient based on proximity to mouse pointer
  const linearGradient = (x, length, max, min = 1) => {
    const distance = Math.abs(x - sketch.mouseX);
    if (distance > length)
      return min;
    return (1 - distance / length) * (max - min) + min;
  };
};
