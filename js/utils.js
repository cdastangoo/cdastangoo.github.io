/* DOM utility functions */

// is window width within mobile size
const isMobile = () => {
  return $(window).width() <= 768;
};

// is window click outside target or its direct parent
const clickOutside = (target, className) => {
  return target.className !== className && target.parentElement.className !== className;
};

// is window click outside of an element
const isClickOutside = (target, className) => {
  if (target.constructor.name === '') {
    target = target.target;
  }
  if (target.constructor.name !== '$') {
    target = $(target);
  }
  // check if click target or any of its parents are below the scope of the target element
  const parents = target.parents().toArray();
  const classes = parents.map(elem => elem.className.split(' ')).flat();
  return (target.attr('class') !== className && !classes.includes(className));
};

// is element visible
const isVisible = (className) => {
  return $(`.${className}`).is(":visible");
};

// is element hidden
const isHidden = (className) => {
  return $(`.${className}`).is(":hidden");
};

/* helper functions */

// get random element from array or get random number between two values
const random = (a, b = null) => {
  // get random element from array
  if (Array.isArray(a)) {
    if (a.length === 0)
      return null;
    const idx = Math.floor(Math.random() * a.length);
    return a[idx];
  }
  // guard clauses
  if (b === null || b === undefined || a === b)
    return a;
  if (b < a) {
    const temp = a;
    a = b;
    b = temp;
  }
  // get random number between two values
  a = Math.ceil(a);
  b = Math.floor(b);
  return Math.floor(Math.random() * (b - a + 1)) + a;
};

// converts HSV color code to RGB values - according to this formula https://www.rapidtables.com/convert/color/hsv-to-rgb.html
const convertHSVtoRGB = (hue, saturation = 1, volume = 1) => {
  hue = hue - 360 * Math.floor(hue / 360);
  let c = 255 * volume;
  let m = c * (1 - saturation);
  const x = (c - m) * (1 - Math.abs((hue / 60) % 2 - 1));
  const z = Math.round(x + m);
  c = Math.round(c);
  m = Math.round(m);
  if (hue < 60) return [c, z, m];
  else if (hue < 120) return [z, c, m];
  else if (hue < 180) return [m, c, z];
  else if (hue < 240) return [m, z, c];
  else if (hue < 300) return [z, m, c];
  else if (hue < 360) return [c, m, z];
  else return [255, 255, 255];
};

// converts RGB color code to HSV values - according to this formula https://www.rapidtables.com/convert/color/rgb-to-hsv.html
const convertRGBtoHSV = (red, green, blue) => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const cmax = Math.max(r, g, b);
  const cmin = Math.min(r, g, b);
  const delta = cmax - cmin;
  let hue = 0;
  if (delta === 0)
    hue = 0;
  else if (cmax === r)
    hue = 60 * (((g - b) / delta) % 6);
  else if (cmax === g)
    hue = 60 * ((b - r) / delta + 2);
  else if (cmax === b)
    hue = 60 * ((r - g) / delta + 4);
  hue = Math.round(hue);
  const saturation = (cmax === 0) ? 0 : delta / cmax;
  const volume = cmax;
  return [hue, saturation, volume];
};

/* browser utility functions */

const isChrome = () => {
  return !!window.chrome && navigator.userAgent.indexOf("Edg") === -1;
};

const isSafari = () => {
  /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));
};

const isEdge = () => {
  return !!window.StyleMedia || isEdgeChromium();
};

const isFirefox = () => {
  return typeof InstallTrigger !== 'undefined';
};

const isOpera = () => {
  (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
};

const isBrave = () => {
  return !!navigator.brave;
};

const isEdgeChromium = () => {
  return !!window.chrome && navigator.userAgent.indexOf("Edg") != -1;
};

// get the current browser as a string
const getBrowser = () => {
  if (isChrome())
    return "chrome";
  else if (isSafari())
    return "safari";
  else if (isEdge())
    return "edge";
  else if (isFirefox())
    return "firefox";
  else if (isOpera())
    return "opera";
  else if (isBrave())
    return "brave";
};

// check if current browser is "fully" supported
const supportedBrowsers = ["chrome", "brave", "edge"];
const isBrowserSupported = () => {
  return supportedBrowsers.includes(getBrowser());
};

/* device utility functions */

const getDevice = () => {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes("win"))
    return "windows";
  else if (platform.includes("mac"))
    return "mac";
  else if (platform.includes("linux"))
    return "linux";
  else if (platform.includes("android"))
    return "android";
  else if (platform.slice(0, 2) === 'ip')
    return platform.split(' ')[0];
  else
    return platform;
};

const isWindows = () => {
  return getDevice() === "windows";
};

const isMac = () => {
  return getDevice() === "mac";
};

const isLinux = () => {
  return getDevice() === "linux";
};

const isAndroid = () => {
  return getDevice() === "android";
};

const isIPhone = () => {
  return getDevice() === "iphone";
};

const isIPad = () => {
  return getDevice() === "ipad";
};
