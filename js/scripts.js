// smooth scroll transition to link anchors
const $root = $('html, body');
$(document).on('click', 'a[href^="#"]', function (e) {
  e.preventDefault();
  const href = $.attr(this, 'href');
  const scrollHeight = $(href).offset().top;
  const currentHeight = $(window).scrollTop();
  const scrollDelay = Math.abs(scrollHeight - currentHeight) / 4;
  $root.animate({
    scrollTop: scrollHeight,
  }, scrollDelay, function () {
    window.location.hash = href;
  });
  return false;
});

/* theme selection */

// const themes = ['futuristic', 'hacker', 'neon', 'modern', 'hippie', 'professor'];
var currentTheme = 'futuristic';

var fadeGridTimeout;
var fadeGridInterval;

const fadeGrid = () => {
  const $grid = $('#futuristic-grid');
  let brightnessFactor = 1.0;
  fadeGridInterval = setInterval(() => {
    if (brightnessFactor > 0.0) {
      $grid.css('mask-image', `radial-gradient(calc(100vw / 4) circle at var(--x) var(--y), rgb(255 255 255 / ${10 + (100 - 10) * brightnessFactor}%), rgb(255 255 255 / ${10 + (50 - 10) * brightnessFactor}%) 10%, rgb(255 255 255 / ${10 + (25 - 10) * brightnessFactor}%), rgb(255 255 255 / 10%))`);
      brightnessFactor -= 0.01;
    } else {
      $grid.css('mask-image', 'radial-gradient(circle at center, rgb(255 255 255 / 10%), rgb(255 255 255 / 10%))');
      clearInterval(fadeGridInterval);
    }
  }, 5);
};

const futuristicThemeMouseMove = (e) => {
  clearTimeout(fadeGridTimeout);
  clearInterval(fadeGridInterval);

  const $grid = $('#futuristic-grid');
  $grid.css('mask-image', "radial-gradient(calc(100vw / 4) circle at var(--x) var(--y), var(--primary), rgb(255 255 255 / 50%) 10%, rgb(255 255 255 / 25%), rgb(255 255 255 / 10%))");
  $grid.css('-webkit-mask-image', "radial-gradient(calc(100vw / 4) circle at var(--x) var(--y), var(--primary), rgb(255 255 255 / 50%) 10%, rgb(255 255 255 / 25%), rgb(255 255 255 / 10%))");

  const ypos = e.clientY + $(window).scrollTop() - $(window).height() - 64;
  $grid.css('--x', `${e.clientX}px`);
  $grid.css('--y', `${ypos}px`);

  // fadeGrid();
  fadeGridTimeout = setTimeout(() => fadeGrid(), 400);
};

const handleMouseMove = (e) => {
  switch (currentTheme) {
    case 'futuristic':
      futuristicThemeMouseMove(e);
    default:
      return;
  }
};

$(window).on('mousemove', (e) => handleMouseMove(e));
$(window).on('touchmove', (e) => handleMouseMove(e.touches[0]));

/* theme colors */

const themeColors = ['white', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'magenta', 'pink', 'rainbow'];
var darkMode = true;
var currentThemeColor;
var currentThemeHue = 0;
var rainbowFadeInterval;

// configure initial random theme color
currentThemeColor = 'cyan';
$(':root').css('--theme-color', `var(--${currentThemeColor})`);
$('.btn-radio').each((_idx, button) => {
  if (button.value === 'rainbow')
    return;
  button.style.backgroundColor = `rgb(var(--${button.value}))`;
});
$(`.btn-radio[value="${currentThemeColor}"]`).addClass('checked');

// deslect current radio button and set target radio button to checked
const handleSelectRadioButton = (themeColor) => {
  $('.btn-radio.checked').removeClass('checked');
  $(`.btn-radio[value="${themeColor}"]`).addClass('checked');
};

// change background color gradually
const handleRainbowFade = () => {
  currentThemeHue = (currentThemeHue + 1) % 360;
  const color = convertHSVtoRGB(currentThemeHue);
  $(':root').css('--theme-color', `${color[0]}, ${color[1]}, ${color[2]}`);
};

// toggles theme color
const handleToggleThemeColor = (target) => {
  const themeColor = target.value;
  if (!themeColors.includes(themeColor) || themeColor === currentThemeColor)
    return;
  currentThemeColor = themeColor;
  if (themeColor === 'rainbow') {
    currentThemeHue = 0;
    rainbowFadeInterval = setInterval(() => handleRainbowFade(), 20);
  } else {
    clearInterval(rainbowFadeInterval);
    $(':root').css('--theme-color', `var(--${themeColor})`);
  }
  handleSelectRadioButton(themeColor);
};

$('.btn-radio').click((e) => {
  handleToggleThemeColor(e.currentTarget);
});

/* navbar */

// change navbar transparency on scroll
const handleNavbarScroll = () => {
  if (isMobile())
    return;
  const $navbar = $('.navbar');
  if ($(window).scrollTop() >= 1) {
    $navbar.css('background-color', '#0a0a0a');
  } else {
    $navbar.css('background-color', 'transparent');
  }
};

// expand navbar when toggled on
const handleNavbarExpand = () => {
  if (isMobile()) {
    const $navbar = $('.navbar-menu');
    $navbar.addClass('navbar-open');
    $navbar.css('margin-bottom', '0');
    $navbar.css('pointer-events', 'auto');
    $('.navbar-items').css('transform', 'translateY(0)');
  }
};

// collapse navbar when toggled off
const handleNavbarCollapse = () => {
  if (isMobile()) {
    const $navbar = $('.navbar-menu');
    $navbar.removeClass('navbar-open');
    $navbar.css('margin-bottom', 'var(--menu-offset)');
    $navbar.css('pointer-events', 'none');
    $('.navbar-items').css('transform', 'translateY(var(--menu-offset))');
  }
};

// toggle navbar when menu clicked
const handleNavbarToggle = () => {
  if (!isMobile())
    return;
  if ($('.navbar-menu').hasClass('navbar-open')) {
    handleNavbarCollapse();
  } else {
    handleNavbarExpand();
  }
};

// hide or show scroll top button based on scroll height
const viewScrollTopButton = () => {
  const $scrollTop = $('#scroll-top');
  if ($(window).scrollTop() <= (isMobile() ? 160 : 20)) {
    $scrollTop.hide();
  }
  else if (isMobile() && $(window).scrollTop() >= $(document).height() - $('header').height() - $('footer').height()) {
    $scrollTop.hide();
  }
  else {
    $scrollTop.show();
  }
};

// change navbar transparency and collapse on scroll
$(window).scroll(() => {
  handleNavbarCollapse();
  handleNavbarScroll();
  viewScrollTopButton();
});

// collapse navbar when clicked away
$(window).click(e => {
  if (!isMobile() || $(e.target).hasClass('navbar-toggle'))
    return;
  if ($('.navbar-menu').hasClass('navbar-open') && isClickOutside(e.target, 'navbar-menu')) {
    handleNavbarCollapse();
  }
});

// toggle navbar on menu button click
$('.navbar-toggle').click(() => {
  handleNavbarToggle();
});

/* dropdowns */

// handle dropdown open
const handleOpenDropdown = ($dropdown) => {
  $dropdown.children('.dropdown-items').children('ul').show();
  $dropdown.children('.dropdown-container').children('span').last().text('▲');
  $dropdown.addClass('dropdown-open');
};

// handle dropdown close
const handleCloseDropdown = ($dropdown) => {
  $dropdown.children('.dropdown-items').children('ul').hide();
  $dropdown.children('.dropdown-container').children('span').last().text('▼');
  $dropdown.removeClass('dropdown-open');
};

// collapse dropdown when clicked away
$(window).click(e => {
  $('.dropdown-open').each((_idx, dropdown) => {
    if (isClickOutside(e.target, 'dropdown-open')) {
      handleCloseDropdown($(dropdown));
    }
  });
});

// animation dropdown click listener
$('.dropdown').click(e => {
  const $dropdown = $(e.currentTarget);
  if ($dropdown.hasClass('dropdown-open')) {
    handleCloseDropdown($dropdown);
  }
  else {
    handleOpenDropdown($dropdown);
  }
  // close all other open dropdowns
  $(`.dropdown-open:not(#${e.currentTarget.id})`).each((_idx, dropdown) => {
    handleCloseDropdown($(dropdown));
  });
});

// set animation type based on dropdown selection
const handleAnimationDropdownSelection = (optionId) => {
  const animationName = optionId;
  if (!Object.keys(animationNames).includes(animationName)) {
    console.error(`${animationName} is not a valid animation type`);
    return;
  }
  setAnimation(eval(animationName));
};

// set theme type based on dropdown selection
const handleThemeDropdownSelection = (optionId) => {
  const themeName = optionId;
  return;
};

// handle dropdown selection logic
const handleDropdownSelection = ($option) => {
  if ($option.hasClass('selected'))
    return;
  const $options = $option.parent();
  const $dropdown = $options.parents().eq(1);
  const $label = $dropdown.children('.dropdown-container').children('span').first();

  $options.children('.selected').removeClass('selected');
  $option.addClass('selected');
  $label.text($option.text());
  const dropdownId = $dropdown.attr('id');
  const optionId = $option.attr('id')

  if (dropdownId === 'animation-dropdown') {
    handleAnimationDropdownSelection(optionId);
  }
  else if (dropdownId === 'theme-dropdown') {
    handleThemeDropdownSelection(optionId);
  }
};

// dropdown item selection
$('.dropdown-items ul li').click(e => {
  handleDropdownSelection($(e.currentTarget));
});

/* accordions */

// toggle accordion content open and closed
const handleToggleAccordion = (e) => {
  const $header = $(e.currentTarget);
  const $icon = $header.children().last();
  const $accordion = $header.parent();
  const $content = $accordion.children().last();
  if ($accordion.hasClass('open')) {
    $accordion.removeClass('open');
    $icon.text("+");
    $content.css('max-height', '0');
  }
  else {
    $accordion.addClass('open');
    $icon.text("-");
    $content.css('max-height', `${$content.get(0).scrollHeight + 32}px`);
  }
};

const addAccordionListeners = () => {
  // accordion header on click action
  $('.accordion-header').click(e => {
    handleToggleAccordion(e);
  });

  // set initial open state for each accordion
  $('.accordion').each((idx, $accordion) => {
    const $content = $($accordion).children().last();
    $content.css('max-height', idx === 0 ? `${$content.get(0).scrollHeight + 32}px` : '0');
  });
};

/* modals */

// open a modal
const handleOpenModal = ($modal) => {
  if (!$modal) {
    console.error(`Couldn't find or open modal with id ${projectId}`);
    return;
  }
  $('body').addClass('disable-scroll');
  $modal.addClass('modal-open');
  $modal.show();
};

const addCardListeners = () => {
  // project card listener to open corresponding modal by ID
  $('.project-card').click(e => {
    const $project = $(e.currentTarget);
    const projectId = $project.attr('id');
    if (!projectId)
      return;
    const $modal = $(`.modal[id=${projectId}]`);
    handleOpenModal($modal);
  });
};

// close an open modal
const handleCloseModal = ($modal) => {
  const $body = $('body');
  if ($body.hasClass('disable-scroll')) {
    $body.removeClass('disable-scroll');
  }
  if ($modal.hasClass('modal-open')) {
    $modal.removeClass('modal-open');
  }
  $modal.hide();
};

const addModalListeners = () => {
  // close button listener to close a currently open modal
  $('.btn-close').click(e => {
    const $modal = $(e.currentTarget).parents().eq(2);
    handleCloseModal($modal);
  });

  // modal listener to close a currently open modal
  $('.modal,.modal-open').click(e => {
    if (isClickOutside(e.target, 'modal-container')) {
      const $modal = $(e.currentTarget);
      handleCloseModal($modal);
    }
  });
};

/* expand buttons */

const addExpandButtonListeners = () => {
  $('.expand-btn').click(e => {
    const $button = $(e.currentTarget);
    $button.hide();
    $button.parent().children('div').each((_idx, elem) => {
      $(elem).removeClass('hidden');
    });
  })
};
