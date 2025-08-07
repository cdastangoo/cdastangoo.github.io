const circleOfFifths = (sketch) => {
  const id = 'circle-of-fifths';

  var running = false;
  var muted = false;

  var instrument = "electric-piano";
  var tempo = 120;
  var volume = 50;
  var clockwise = true;

  var radius;
  var angle = 0;

  const notes = [];
  const noteLabels = ['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
  // const noteLabels = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'E♭', 'B♭', 'F'];
  const tones = ['C4', 'G4', 'D4', 'A4', 'E4', 'B4', 'Gb4', 'Db4', 'Ab4', 'Eb4', 'Bb4', 'F4'];
  const noteColors = ["red", "orange", "yellow", "#80ff00", "#0f0", "#00ff80", "cyan", "#0080ff", "blue", "#7f00ff", "magenta", "pink"];

  const shapes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const shapeNames = ["Triangle (3)", "Square (4)", "Pentagon (5)", "Hexagon (6)", "Heptagon (7)", "Octagon (8)", "Nonagon (9)", "Decagon (10)", "Hendecagon (11)", "Dodecagon (12)", "Major 7th Trapezoid", "Minor 7th Trapezoid"];
  const shapeColors = ["lime", "cyan", "magenta", "orange", "blue", "yellow", "pink", "#7f00ff", "#0080ff", "red"];
  var shape = shapeNames[0];

  var font;
  var fontColor = "white";

  // preload jazz font
  sketch.preload = () => {
    if (!location.origin || location.origin === "file://" || location.protocol === "file:") {
      console.warn("Skipping preload of MuseJazzText.otf font file");
      return;
    }
    font = sketch.loadFont('assets/fonts/MuseJazzText.otf');
  };

  // p5.js setup
  sketch.setup = () => {
    // setup canvas
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.createCanvas(size, size).id(`canvas-${id}`);
    radius = Math.min(sketch.width, sketch.height) * 0.8 / 2;
    sketch.textAlign('center');
    if (font) {
      sketch.textFont(font);
    }

    // add notes
    for (let i = 0; i < tones.length; i++) {
      notes.push({
        angle: i * 360 / 12,
        label: noteLabels[i],
        color: noteColors[i],
        tone: tones[i],
        sound: false,
      });
    }

    // render elements and add listeners
    appendCanvas(id);
    createDropdown(id, 'shape-dropdown', shapeNames);
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
    sketch.stroke(fontColor);
    sketch.strokeWeight(4);
    sketch.noFill();
    sketch.circle(sketch.width / 2, sketch.height / 2, radius * 2);

    // draw notes
    notes.forEach(note =>{
      drawNote(note);
    });

    // draw shape
    sketch.strokeWeight(4);
    sketch.noFill();
    const n = shapeNames.indexOf(shape);
    if (n < shapes.length) {
      drawPolygon(n);
    }
    else {
      drawTrapezoid();
    }

    // rotate shape
    if (running) {
      const delta = 0.25 * tempo / 60;
      angle = ((clockwise ? angle + delta : angle - delta) % 360 + 360) % 360;
    }
  };

  sketch.windowResized = () => {
    const size = $(`.tab-content.active .canvas-container`).width();
    sketch.resizeCanvas(size, size);
    radius = Math.min(sketch.width, sketch.height) * 0.8 / 2;
  };

  // draw note label and ball on circle
  const drawNote = (note) => {
    const noteColor = running && note.sound ? note.color : fontColor;
    sketch.stroke(noteColor);
    sketch.fill(noteColor);

    // draw balls
    const theta = note.angle * Math.PI / 180;
    const xPos = sketch.width / 2 + radius * Math.cos(-theta + Math.PI / 2);
    const yPos = sketch.height / 2 - radius * Math.sin(-theta + Math.PI / 2);
    const ballSize = Math.min(sketch.width, sketch.height / 25);
    sketch.circle(xPos, yPos, Math.min(ballSize, 16));

    // draw labels
    sketch.strokeWeight(1);
    sketch.textSize(ballSize);
    const textX = sketch.width / 2 + (radius + ballSize * 1.2) * Math.cos(-theta + Math.PI / 2);
    const textY = sketch.height / 2 - (radius + ballSize * 1.24) * Math.sin(-theta + Math.PI / 2) + ballSize * 0.36;
    sketch.text(note.label, textX, textY);
  }

  // draw polygon
  const drawPolygon = (idx) => {
    const sides = shapes[idx];
    sketch.stroke(shapeColors[idx]);
    for (let i = 0; i < sides; i++) {
      const theta = angle * Math.PI / 180;
      const subdivision = 2 * Math.PI / sides;
      sketch.line(sketch.width / 2 + radius * Math.cos(theta + 3 * Math.PI / 2 + subdivision * i),
                  sketch.height / 2 + radius * Math.sin(theta + 3 * Math.PI / 2 + subdivision * i),
                  sketch.width / 2 + radius * Math.cos(theta + 3 * Math.PI / 2 + subdivision * (i + 1)),
                  sketch.height / 2 + radius * Math.sin(theta + 3 * Math.PI / 2 + subdivision * (i + 1)));
      // check collisions
      if (running) {
        const shapeAngle = ((theta + subdivision * i) * 180 / Math.PI) % 360;
        checkCollision(shapeAngle);
      }
    }
  };

  // draw trapezoid
  const drawTrapezoid = () => {
    const theta = angle * Math.PI / 180;
    const interval = 2 * Math.PI / 12;
    let units = [];
    if (shape.includes("Major")) {
      sketch.stroke("cyan");
      units = [0, 1, 4, 5, 0];
    }
    else if (shape.includes("Minor")) {
      sketch.stroke("red");
      units = [0, 1, 9, 10, 0];
    }
    for (let i = 0; i < units.length; i++) {
      sketch.line(sketch.width / 2 + radius * Math.cos(theta + 3 * Math.PI / 2 + interval * units[i]),
                  sketch.height / 2 + radius * Math.sin(theta + 3 * Math.PI / 2 + interval * units[i]),
                  sketch.width / 2 + radius * Math.cos(theta + 3 * Math.PI / 2 + interval * units[i + 1]),
                  sketch.height / 2 + radius * Math.sin(theta + 3 * Math.PI / 2 + interval * units[i + 1]));
      // check collisions
      if (running) {
        const shapeAngle = ((theta + interval * units[i]) * 180 / Math.PI) % 360;
        const playBass = i === 0;
        checkCollision(shapeAngle, playBass);
      }
    }
  };

  // check if shape corner angle has collision with any notes
  function checkCollision(shapeAngle, playBass = false) {
    shapeAngle = clockwise ? shapeAngle : 360 - shapeAngle;
    notes.forEach(note => {          
      const from = clockwise ? note.angle : 360 - note.angle;
      const mid = from + (0.5 * 360.0 / notes.length);
      const to = from + (360.0 / notes.length);
      if (shapeAngle >= from && shapeAngle < mid && !note.sound) {
        note.sound = true;
        playSound(note.tone);
        if (playBass) {
          playSound(`${note.tone.slice(0, -1)}2`);
        }
      }
      if (shapeAngle >= mid && shapeAngle < to && note.sound) {
        note.sound = false;
      }
    });
  };

  const resetSounds = () => {
    stopSounds(instrument);
    notes.forEach(note => note.sound = false);
  };

  const playSound = (tone) => {
    playInstrument(instrument, tone, tempo > 180 ? "3n" : "2n", volume, muted);
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
      angle = 0;
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
      angle = 0;
      tempo = 120;
      volume = 50;
      instrument = "electric-piano";
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

  // shape type dropdown
  $('select[id=shape-dropdown]').on('change', e => {
    if (getActiveId() === id) {
      const shapeIdx = $(e.currentTarget).val();
      shape = shapeNames[shapeIdx];
    }
  });
};
