/* modules */

const modules = [circleOfFifths, polygons, bouncingBalls, spirals];
const moduleIds = modules.map(module => module.name.split(/(?=[A-Z])/).join('-').toLowerCase());

$(document).ready(() => {
  modules.forEach(module => new p5(module));
});

/* tabs */

// hide tabs on page load
const hideTabs = () => {
  $('.tab-content').each((_idx, tab) => {
    const $tab = $(tab);
    if (!$tab.hasClass("active")) {
      $(tab).removeClass("active").css('display', 'none');
    }
  });
};
hideTabs();

// hide controls on page load
const hideControls = () => {
  moduleIds.slice(1).forEach(id => {
    $(`#canvas-controls div[id*='${id}']`).css('display', 'none');
  });
};
hideControls();

// handle tab switch logic
$('.tabs button').click(e => {
  // toggle tab buttons
  const $button = $(e.currentTarget);
  if ($button.hasClass("active"))
    return;
  $('.tabs button.active').removeClass("active");
  $button.addClass("active");

  // toggle tab content
  const targetId = $button.attr('id').replace('btn-', '');
  const $tab = $(`#${targetId}`);
  $('.tab-content').removeClass("active").css('display', 'none');
  $tab.addClass("active").css('display', 'flex');

  // toggle canvas elements
  $('.module-start').css('display', 'flex');
  $tab.children('.canvas-container').children('.fullscreen-btn').hide();

  // toggle control buttons
  $('#play').children().first().removeClass("fa-pause").addClass("fa-play");
  $('#mute').children().first().removeClass("fa-volume-xmark").addClass("fa-volume-high");

  // toggle controls
  moduleIds.forEach(id => {
    if (id === targetId)
      return;
    $(`#canvas-controls div[id*='${id}']`).css('display', 'none');
  });
  $(`#canvas-controls div[id*='${targetId}']`).css('display', 'flex');

  // set tempo
  const $tempo = $('#tempo-slider');
  if (targetId === 'spirals') {
    $tempo.parent().css('display', 'none');
  } else {
    $tempo.parent().css('display', 'flex');
    const tempo = targetId === 'circle-of-fifths' ? 120 : 80;
    $tempo.val(tempo);
    handleTempoSliderChange($tempo);
  }

  // set instrument
  switch (targetId) {
    case 'circle-of-fifths':
      $('#instrument-dropdown').val("electric-piano");
      break;
    case 'polygons':
      $('#instrument-dropdown').val("xylophone");
      break;
    case 'bouncing-balls':
      $('#instrument-dropdown').val("pluck");
      break;
    case 'spirals':
      $('#instrument-dropdown').val("bright-piano");
      break;
    default:
      $('#instrument-dropdown').val("grand-piano");
      break;
  }

  // set volume
  const $volume = $('#volume-slider');
  $volume.val(50);
  handleVolumeSliderChange($volume);

  // set page title
  const title = targetId.split('-').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join(' ')
  $(document).attr('title', `Polyrhythms | ${title}`);
});

// gets the id of the active tab module
const getActiveId = () => {
  return $('.tab-content.active').attr('id');
};

/* canvas controls */

// append canvas module to container
const appendCanvas = (name) => {
  const canvas = $(`#canvas-${name}`);
  const container = $(`#${name} .canvas-container`);
  canvas.detach().appendTo(container);
};

// adds canvas click listeners given id / func as key value pairs
const addListeners = (actions) => {
  Object.keys(actions).forEach(id => {
    $(id).click(() => {
      actions[id]();
    })
  });
};

// module click listener
$('.module-start').click(e => {
  const $canvas = $(e.currentTarget);
  $([document.documentElement, document.body]).animate({
    scrollTop: $(e.currentTarget).offset().top - 16,
  }, 200);
  $('.module-start').hide();
  const $play = $('#play').children().first();
  if ($play.hasClass("fa-play")) {
    $play.removeClass("fa-play");
    $play.addClass("fa-pause");
  }
  $canvas.parent().children('.fullscreen-btn').show();
});

const enableFullscreen = ($canvas) => {
  if ($canvas.hasClass("fullscreen"))
    return;
  $('#background-blur').show();
  $canvas.addClass("fullscreen");
  $('body').css('overflow-y', 'hidden');
  const size = Math.min($(window).width(), $(window).height());
  const margin = size < 768 ? '1rem' : '2rem';
  $canvas.css('width', `${size}px`);
  $canvas.css('height', `${size}px`);
  $canvas.css('max-width', `calc(${size}px - 2*${margin})`);
  $canvas.css('max-height', `calc(${size}px - 2*${margin})`);
  window.dispatchEvent(new Event('resize'));
};

const disableFullscreen = () => {
  const $canvas = $('.canvas-container');
  if (!$canvas.hasClass("fullscreen"))
    return;
  $canvas.removeClass("fullscreen");
  $('body').css('overflow-y', 'scroll');
  const size = $(window).height() < 1156 ? 'calc(620px - 2rem)' : 'calc(768px - 2rem)';
  $canvas.css('max-width', size);
  $canvas.css('max-height', size);
  $canvas.css('width', '100%');
  $canvas.css('height', '100%');
  window.dispatchEvent(new Event('resize'));
  $('#background-blur').hide();
};

// full screen button listener
$('.fullscreen-btn').click(e => {
  const $button = $(e.currentTarget);
  const $icon = $button.children('.icon');
  const $canvas = $button.parent();
  if ($canvas.hasClass("fullscreen")) {
    disableFullscreen();
    $icon.removeClass("fa-minimize");
    $icon.addClass("fa-maximize");
  } else {
    enableFullscreen($canvas);
    $icon.removeClass("fa-maximize");
    $icon.addClass("fa-minimize");
  }
});

// exit full screen click listener
$('#background-blur').click(() => {
  disableFullscreen();
});

/* buttons */

// play button click listener
$('#play').click(e => {
  $('.module-start').hide();
  $('.tab-content.active').children('.canvas-container').children('.fullscreen-btn').show();
  const $icon = $(e.currentTarget).children().first();
  if ($icon.hasClass("fa-play")) {
    $icon.removeClass("fa-play");
    $icon.addClass("fa-pause");
  }
  else if ($icon.hasClass("fa-pause")) {
    $icon.removeClass("fa-pause");
    $icon.addClass("fa-play");
  }
});

// mute button click listener
$('#mute').click(e => {
  const $icon = $(e.currentTarget).children().first();
  if ($icon.hasClass("fa-volume-high")) {
    $icon.removeClass("fa-volume-high");
    $icon.addClass("fa-volume-xmark");
  }
  else if ($icon.hasClass("fa-volume-xmark")) {
    $icon.removeClass("fa-volume-xmark");
    $icon.addClass("fa-volume-high");
  }
});

// adds button listeners given array of callback functions
const addButtonListeners = (actions) => {
  actions.forEach(func => {
    $(`#${func.name}`).click(() => {
      func();
    });
  });
};

/* sliders */

/* tempo slider change logic
 * 40 - 55    Largo
 * 56 - 75    Adagio
 * 76 - 107   Andante
 * 108 - 119  Moderato
 * 120 - 167  Allegro
 * 168 - 208  Presto
*/
const handleTempoSliderChange = ($slider) => {
  const $label = $slider.parent().children('h4').first();
  let tempo = parseInt($slider.val());
  let label = $label.text().split(' ')[0];
  if (tempo < 40)
    tempo = 40;
  else if (tempo > 208)
    tempo = 208;
  else if (tempo < 56) {
    label = "Largo";
  }
  else if (tempo < 76) {
    label = "Adagio";
  }
  else if (tempo < 108) {
    label = "Andante";
  }
  else if (tempo < 120) {
    label = "Moderato";
  }
  else if (tempo < 168) {
    label = "Allegro";
  }
  else if (tempo <= 208) {
    label = "Presto";
  }
  $label.text(`${label} ( 𝅘𝅥 = ${tempo} )`);
};

// tempo slider
$(document).on('input', '#tempo-slider', e => {
  const $slider = $(e.currentTarget);
  handleTempoSliderChange($slider);
});


/* volume slider change logic
 * 0-4     ppp
 * 5-14    pp
 * 15-29   p
 * 30-59   mp
 * 50-79   mf
 * 70-84   f
 * 85-94   ff
 * 95-100  fff
*/
const handleVolumeSliderChange = ($slider) => {
  const $dynamics = $slider.parent().children('h4').first();
  const $label = $slider.parent().children('h4').last();
  let volume = parseInt($slider.val());
  let dynamics = $dynamics.text();
  if (volume < 0)
    volume = 0;
  else if (volume > 100)
    volume = 100;
  else if (volume === 0) {
    dynamics = "ø";
  }
  else if (volume < 5) {
    dynamics = "ppp";
  }
  else if (volume < 15) {
    dynamics = "pp";
  }
  else if (volume < 30) {
    dynamics = "p";
  }
  else if (volume < 50) {
    dynamics = "mp";
  }
  else if (volume < 70) {
    dynamics = "mf";
  }
  else if (volume < 85) {
    dynamics = "f";
  }
  else if (volume < 95) {
    dynamics = "ff";
  }
  else if (volume <= 100) {
    dynamics = "fff";
  }
  $dynamics.text(dynamics);
  $label.text(`( ${volume} )`);
};

// volume slider
$(document).on('input', '#volume-slider', e => {
  const $slider = $(e.currentTarget);
  handleVolumeSliderChange($slider);
});

/* dropdowns */

// create dropdown menu
const createDropdown = (parentId, name = 'dropdown', options) => {
  const $dropdown = $(`#${parentId}-${name} select[id=${name}]`);
  options.forEach((option, idx) => {
    $dropdown.append($("<option>").attr('value', idx).text(option));
  });
};

/* checkboxes */

// create checkbox
const createCheckbox = (parentId, value, checked = false) => {
  const $container = $(`.checkbox-container[id=${parentId}-checkboxes]`);
  const $wrapper = $("<div>").addClass("checkbox-wrapper");
  const $checkbox = $("<div>").addClass("checkbox").attr('id', `polygons-checkbox-${value}`);
  const $note = $("<span>").text('♪').hide();
  $checkbox.append($note);
  if (checked) {
    $checkbox.addClass("checked");
    $note.show();
  }
  $wrapper.append($checkbox);
  $wrapper.append($("<p>").text(value));
  $container.append($wrapper);
};

const addCheckboxListeners = (callback) => {
  $('.checkbox').click(e => {
    const $checkbox = $(e.currentTarget);
    if ($checkbox.hasClass("checked")) {
      $checkbox.removeClass("checked");
      $checkbox.children('span').first().hide();
    }
    else {
      $checkbox.addClass("checked");
      $checkbox.children('span').first().show();
    }
  });

  $('.checkbox').click(e => {
    const checkboxId = parseInt($(e.currentTarget).attr('id').split('-').slice(-1));
    callback(checkboxId);
  });
};
