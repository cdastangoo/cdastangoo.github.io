/* color values */

const neonColors = [
  '255, 255, 255',  // white
  '255, 0, 0',      // red
  '255, 128, 0',    // orange
  '255, 255, 0',    // yellow
  '128, 255, 0',    // lime
  '0, 255, 0',      // green
  '0, 255, 255',    // cyan
  '0, 170, 255',    // light blue
  '255, 0, 255',    // magenta
  '255, 128, 255',  // pink
];

const pastelColors = [
  '255, 255, 255',  // white
  '255, 154, 154',  // red
  '255, 205, 154',  // peach
  '255, 255, 154',  // yellow
  '205, 255, 154',  // lime
  '154, 255, 154',  // green
  '154, 255, 205',  // mint
  '154, 255, 255',  // cyan
  '154, 205, 255',  // light blue
  '154, 154, 255',  // blue
  '205, 154, 255',  // lilac
  '255, 154, 255',  // magenta
  '255, 154, 205',  // pink
];

/* gradient utility functions */

// radial gradient - circular normalization in 2 directions
const radialGradient = (x, y, radius, max, min = 1) => {
  const distance = sketch.dist(x, y, sketch.mouseX, sketch.mouseY);
  if (distance > radius)
    return min;
  return (1 - distance / radius) * (max - min) + min;
};

// linear gradient normalization in x direction
const linearGradientX = (x, length, max, min = 1) => {
  const distance = Math.abs(x - sketch.mouseX);
  if (distance > length)
    return min;
  return (1 - distance / length) * (max - min) + min;
};

// linear gradient normalization in y direction
const linearGradientY = (y, length, max, min = 1) => {
  const distance = Math.abs(y - sketch.mouseY);
  if (distance > length)
    return min;
  return (1 - distance / length) * (max - min) + min;
};

/* animations */

// intersection observer for pausing animation when canvas is not in view
var observer;
const handleAnimationRunning = (sketch) => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      sketch.loop();
    } else {
      sketch.noLoop();
    }
  });
  observer.observe($('canvas').get(0));
};

const animationNames = {
  "rain": "Neon Rain",
  "constellations": "Constellations",
  "snow": "Pastel Snow",
  "stars": "Stars",
};

// replace current animation
const setAnimation = (newAnimation) => {
  if (!newAnimation)
    return;
  if (!allAnimations.includes(newAnimation)) {
    console.error(`${newAnimation} is an invalid animation type`);
    return;
  }
  sessionStorage.setItem("previousAnimation", animation.name);

  // reset intersection observer and p5
  if (observer) {
    observer.unobserve($('canvas').get(0));
    observer.disconnect();
  }
  if (p) {
    p.remove();
  }
  animation = newAnimation;
  p = new p5(animation);

  // set animation dropdown label
  const $dropdown = $('#animation-dropdown');
  const $label = $dropdown.children('.dropdown-container').children('span').first();
  const label = animationNames[animation.name];
  $label.text(label);

  // set selected dropdown option
  const $options = $dropdown.children('.dropdown-items').children('ul');
  $options.children('.selected').removeClass('selected');
  $(`#${animation.name}`).addClass('selected');
}

// handle animation refresh
const refreshAnimation = () => {
  const previousAnimation = sessionStorage.getItem("previousAnimation");
  const remainingAnimations = allAnimations.filter(an => an.name !== animation.name && an.name !== previousAnimation);
  const newAnimation = random(remainingAnimations);
  setAnimation(newAnimation);
};

// animation refresh button click
$('#animation-refresh').click(e => {
  refreshAnimation();
});

// animation types: neon rain, stars, pastel snow, fireworks, constellations, lasers, spiral, grid, fluid, fractals
const allAnimations = [rain, constellations, snow, stars];
const futuristicAnimations = [rain, constellations, snow, stars];

let initialAnimation = rain;
var animation = initialAnimation;
var p = new p5(animation);
