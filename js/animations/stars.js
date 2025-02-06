const stars = (sketch) => {

  var canvasWidth, canvasHeight;
  var currWidth, currHeight, gridWidth;
  var stars = [];
  const gridLowerBound = getBrowser() === "firefox" ? 36 : 24,
        gridUpperBound = getBrowser() === "firefox" ? 42 : 32;
  const sizeLowerBound = 0.5,
        sizeUpperBound = 3;
  const maxGrowth = 4;
  const minBrightness = 0.6,
        maxBrightness = 1.0;
  const minGlow = 0.5,
        maxGlow = 6;
  const flickerRarity = 4000;

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

    // pause animation when canvas not in view
    handleAnimationRunning(sketch);
  };

  // p5 canvas redraw loop
  sketch.draw = () => {
    sketch.clear();
    sketch.noStroke();
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
  };

  // draws a star point
  const drawStar = (star) => {
    if (flicker())
      return;
    const radius = Math.min(sketch.windowWidth, sketch.windowHeight) / 4;
    const sizeFactor = radialGradient(star.x, star.y, radius, maxGrowth);
    const brightness = radialGradient(star.x, star.y, radius, maxBrightness, minBrightness);
    const glowFactor = radialGradient(star.x, star.y, radius, maxGlow, minGlow);
    const color = `rgba(${star.color}, ${brightness})`;
    sketch.fill(color);
    sketch.drawingContext.shadowColor = color;
    sketch.drawingContext.shadowBlur = glowFactor;
    sketch.circle(star.x, star.y, star.size * sizeFactor);
  };

  // creates star point with random offset
  const addStar = (w, h) => {
    stars.push({
      x: w * gridWidth + sketch.random(gridWidth),
      y: h * gridWidth + sketch.random(gridWidth),
      size: sketch.random(0, Math.abs(sizeUpperBound - sizeLowerBound)) + sizeLowerBound,
      color: sketch.random(neonColors),
      opacity: minBrightness,
    });
  };

  // checks if star already exists at given coordinates
  const starExists = (w, h) => {
    return !!stars.find(star => {
      const xBounds = star.x > w * gridWidth && star.x < (w + 1) * gridWidth;
      const yBounds = star.y > h * gridWidth && star.y < (h + 1) * gridWidth;
      return xBounds && yBounds;
    });
  };

  // randomly flickers star
  const flicker = () => {
    return Math.floor(sketch.random(flickerRarity)) === 0;
  };

  // formula for radial gradient based on position relative to mouse pointer
  const radialGradient = (x, y, r, max, min = 1) => {
    const distance = sketch.dist(x, y, sketch.mouseX, sketch.mouseY);
    if (distance > r)
      return min;
    return (1 - distance / r) * (max - min) + min;
  };

  // check if mouse pointer is within canvas bounds
  const inBounds = () => {
    return sketch.mouseX <= sketch.windowWidth && sketch.mouseX >= 0 && sketch.mouseY <= sketch.windowHeight && sketch.mouseY >= 0;
  };
};
