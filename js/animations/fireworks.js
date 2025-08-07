const fireworks = (sketch) => {

  var fireworks = [];
  var fireworkCount = 1;
  const minExplosionRadius = 30,
        maxExplosionRadius = 60;
  const minExplosionHeight = 0.35,
        maxExplosionHeight = 0.65;
  const minSpeed = 12,
        maxSpeed = 24;
  const minBrightness = 0.4,
        maxBrightness = 1;
  const minGlow = 0.5,
        maxGlow = 20;

  // p5 canvas setup
  sketch.setup = () => {
    const canvasWidth = $('header').width();
    const canvasHeight = $('header').height();
    sketch.createCanvas(canvasWidth, canvasHeight).id('animation-canvas');
    sketch.frameRate(60);

    for (let i = 0; i < fireworkCount; i++) {
      addFirework();
    }
    console.log(fireworks);

    // pause animation when canvas not in view
    handleAnimationRunning(sketch);
  };

  // p5 canvas redraw loop
  sketch.draw = () => {
    sketch.clear();
    fireworks.forEach(firework => {
      // console.log(firework.x, firework.y);
      drawFirework(firework);
    });
  };

  // draw firework
  const drawFirework = (firework) => {
    // const brightnessFactor = linearGradient(firework.x)
    const brightness = firework.opacity;
    const glowFactor = maxGlow;
    const color = `rgba(${firework.color}, ${brightness})`;
    sketch.noStroke();
    sketch.fill(color);
    sketch.drawingContext.shadowColor = color;
    sketch.drawingContext.shadowBlur = glowFactor;
    sketch.ellipse(sketch.x, sketch.y, 3, sketch.height);
    animateLaunch(firework);
  };

  // animate firework launch
  const animateLaunch = (firework) => {
    const explosionHeight = firework.explosionHeight * sketch.height;
    firework.y = Math.max(firework.y - firework.speed, explosionHeight);
    // sketch.circle(firework.x, firework.y, 4);
    if (firework.y <= explosionHeight) {
      firework.height = Math.max(firework.height - firework.length / 4, 0);
      if (firework.height <= 0) {
        const particles = firework.explosionRadius * 2;
        for (let i = 0; i < particles.length; i++) {
          addParticle(firework);
        }
        drawExplosion(firework);
      }
    }
  };

  // draw firework explosion
  const drawExplosion = (firework) => {
    sketch.fill(firework.color);
    firework.particles.forEach(particle => {
      sketch.circle(particle.x, particle.y, size);
    });

    firework.radius = Math.min(firework.radius + firework.speed * 0.1, firework.explosionRadius);
    if (firework.radius >= firework.explosionRadius) {
      explosionFade(firework);
    }
  };

  // animate firework explosion fading
  const explosionFade = (firework) => {
    if (firework.opacity > 0) {
      firework.y = firework.y + firework.speed * 0.001;
      firework.opacity = Math.max(firework.opacity - firework.speed * 0.001, 0);
    } else {
      resetFirework(firework);
    }
  };

  const addFirework = () => {
    const initialX = sketch.random(sketch.width / 4, sketch.width * 3 / 4);
    const initialSpeed = sketch.random(minSpeed, maxSpeed);
    fireworks.push({
      x: initialX,
      y: sketch.height,
      explosionX: initialX + sketch.random(-sketch.width / 8, sketch.width / 8),
      explosionHeight: sketch.random(minExplosionHeight, maxExplosionHeight),
      speed: initialSpeed,
      height: initialSpeed * 2,
      length: initialSpeed * 2,
      radius: 0,
      explosionRadius: sketch.random(minExplosionRadius, maxExplosionRadius),
      color: sketch.random(neonColors),
      opacity: minBrightness,
      particles: [],
    });
  };

  const resetFirework = (firework) => {
    firework.radius = 0;
    firework.height = firework.length;
    firework.opacity = minBrightness;
    firework.particles = [];
  }

  const addParticle = (firework) => {
    const destinationX = firework.explosionX + sketch.random(-firework.explosionRadius, firework.explosionRadius);
    const destinationY = Math.sqrt(Math.pow(firework.explosionRadius, 2) - Math.pow(destinationX - firework.explosionX, 2)) + firework.explosionY;
    firework.particles.push({
      x: firework.explosionX,
      y: firework.explosionHeight,
      size,
      destinationX: destinationX,
      destinationY: sketch.random(0, 2) > 1 ? destinationY : -destinationY,
    });
  };
};
