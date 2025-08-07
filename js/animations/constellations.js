const constellations = (sketch) => {

  var canvasWidth, canvasHeight;
  var currWidth, currHeight, gridWidth;
  var stars = [];
  const gridLowerBound = getBrowser() === "firefox" ? 72 : 64,
        gridUpperBound = getBrowser() === "firefox" ? 80 : 72;
  const sizeLowerBound = 1,
        sizeUpperBound = 4;
  const speedLowerBound = 0.1,
        speedUpperBound = 1.0;
  const minBrightness = 0.6,
        maxBrightness = 1.0;
  const minGlow = 0.5,
        maxGlow = 6;
  var lineHue = 0;
  const lineHueDelta = 0.1,
        lineAlpha = 0.15;

  // p5 canvas setup
  sketch.setup = () => {
    canvasWidth = $('header').width();
    canvasHeight = $('header').height();
    sketch.createCanvas(canvasWidth, canvasHeight).id('animation-canvas');
    sketch.frameRate(60);

    gridWidth = sketch.random(gridLowerBound, gridUpperBound);
    currWidth = Math.floor(canvasWidth / gridWidth);
    currHeight = Math.floor(canvasHeight / gridWidth);
    for (let w = 0; w < currWidth; w++) {
      for (let h = 0; h < currHeight; h++) {
        addStar(w, h);
      }
    }
    sketch.colorMode(sketch.HSB);

    // pause animation when canvas not in view
    handleAnimationRunning(sketch);
  };

  // p5 canvas redraw loop
  sketch.draw = () => {
    sketch.clear();
    drawLines();
    stars.forEach(star => {
      drawStar(star);
    });
  };

  // handle p5 canvas resize
  sketch.windowResized = () => {
    canvasWidth = $('header').width();
    canvasHeight = $('header').height();
    sketch.resizeCanvas(canvasWidth, canvasHeight);
    const newWidth = Math.floor(canvasWidth / gridWidth);
    const newHeight = Math.floor(canvasHeight / gridWidth);
    if (currWidth === newWidth && currHeight === newHeight)
      return;
    // create stars when width increases
    if (newWidth > currWidth) {
      for (let w = currWidth; w < newWidth; w++) {
        for (let h = 0; h < newHeight; h++) {
          if (!starExists(w, h))
            addStar(w, h);
        }
      }
    }
    // create stars when height increases
    if (newHeight > currHeight) {
      for (let h = currHeight; h < newHeight; h++) {
        for (let w = 0; w < newWidth; w++) {
          if (!starExists(w, h))
            addStar(w, h);
        }
      }
    }
    // reset width and height tracker
    currWidth = newWidth;
    currHeight = newHeight;
  }

  // draws a star point
  const drawStar = (star) => {
    const radius = Math.min(sketch.windowWidth, sketch.windowHeight) / 4;
    const brightness = radialGradient(star.x, star.y, radius, maxBrightness, minBrightness);
    const glowFactor = radialGradient(star.x, star.y, radius, maxGlow, minGlow);
    const color = `rgba(${star.color}, ${brightness})`;

    sketch.noStroke();
    sketch.fill(color);
    sketch.drawingContext.shadowColor = color;
    sketch.drawingContext.shadowBlur = glowFactor;
    sketch.circle(star.x, star.y, star.size);
    moveStar(star);
  };

  // draws constellation lines between stars
  const drawLines = () => {
    lineHue = (lineHue + lineHueDelta) % 360;
    sketch.stroke(lineHue, 100, 100, lineAlpha);
    sketch.noFill();

    const targetStars = stars.filter(star => sketch.dist(star.x, star.y, sketch.mouseX, sketch.mouseY) <= Math.min(sketch.windowWidth, sketch.windowHeight) / 12);
    targetStars.forEach(star1 => {
      targetStars.forEach(star2 => {
        if (star1.x === star2.x && star1.y === star2.y)
          return;
        sketch.line(star1.x, star1.y, star2.x, star2.y);
      });
    });
  };

  // animate star motion
  const moveStar = (star) => {
    if (star.x <= 0 || star.x >= sketch.windowWidth) {
      star.vx *= -1;
    }
    if (star.y <= 0 || star.y >= sketch.windowHeight) {
      star.vy *= -1;
    }
    star.x += star.vx;
    star.y += star.vy;
  };

  // creates star point with random offset
  const addStar = (w, h) => {
    const star = {
      x: w * gridWidth + sketch.random(gridWidth),
      y: h * gridWidth + sketch.random(gridWidth),
      size: sketch.random(0, Math.abs(sizeUpperBound - sizeLowerBound)) + sizeLowerBound,
      vx: sketch.random(0, Math.abs(speedUpperBound - speedLowerBound)) + speedLowerBound,
      vy: sketch.random(0, Math.abs(speedUpperBound - speedLowerBound)) + speedLowerBound,
      color: sketch.random(neonColors),
      opacity: minBrightness,
    };
    if (sketch.random([true, false]))
      star.vx *= -1;
    if (sketch.random([true, false]))
      star.vy *= -1;
    stars.push(star);
  };

  // checks if star already exists at given coordinates
  const starExists = (w, h) => {
    return !!stars.find(star => {
      const xBounds = star.x > w * gridWidth && star.x < (w + 1) * gridWidth;
      const yBounds = star.y > h * gridWidth && star.y < (h + 1) * gridWidth;
      return xBounds && yBounds;
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
