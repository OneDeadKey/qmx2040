// choc spacing = 18*17mm, scaled to stay close to x-keyboard's 60*60px
const kw = 60.0;  // key width
const kh = 56.67; // key height

const keyboards = {
  qmx: {
    columns: [ "extra", "outer", "pinky", "ring", "middle", "index", "inner", "tmx" ],
    thumbs: [ "tucked3", "tucked2", "tucked1", "comfy", "reachy" ],
    rows: [ "num", "top", "home", "bottom" ],
    col_stagger: [ 0, 0, 0.5, 0, 0, 0, 0, 0.5],
    col_splay:   [ 0, 0, 0, 0, 0, 0, 0, 0 ],
    thumb_stagger: [ -1, 0, 0, 0, 0 ],
    thumb_spread:  [ -2.3, 0.05, 0, 0, 0 ],
    thumb_splay:   [ 0, 0,  15, 15, 15 ],
    view_box: "45 -45 940 400",
  },
};

function setGeometry(name) {
  const geometry = keyboards[name];
  document.documentElement.className.baseVal = name;
  document.documentElement.setAttribute("viewBox", geometry.view_box);

  // Ergogen values, relative to one another, from outer/pinky to inner/index
  const columns = geometry.columns || [ "outer", "pinky", "ring", "middle", "index", "inner" ];
  const thumbs  = geometry.thumbs  || [ "tucked", "comfy", "reachy" ];
  const rows    = geometry.rows    || [ "top", "home", "bottom" ];

  const col_stagger = geometry.col_stagger || [ 0, 0, 0, 0, 0, 0 ];
  const col_splay   = geometry.col_splay   || [ 0, 0, 0, 0, 0, 0 ];
  const alt_stagger = geometry.alt_stagger || [ 0.305, 0.695, 0.0, 0.0, 0.0, 0.305 ];

  const thumb_stagger = geometry.thumb_stagger || [ 0, 0, 0 ];
  const thumb_spread  = geometry.thumb_spread  || [ 0, 0, 0 ];
  const thumb_splay   = geometry.thumb_splay   || [ 0, 0, 0 ];

  // apply keyboard geometry
  let sheet = window.document.styleSheets[0];
  const cssTransform = (selector, transform) => {
    sheet.insertRule(`${selector} { transform: ${transform} }`);
  }
  const svgTransform = (selector, transform) => {
    document.querySelectorAll(selector).forEach(element => {
      element.setAttribute("transform", transform);
    });
  }

  const matrix = (dx, dy, angle) => {
    const rad = angle * Math.PI / 180.0;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const tx = kw * (dx + sin * 2);
    const ty = kh * dy;
    return [
      `matrix(${cos}, ${sin}, ${-sin}, ${cos}, ${tx}, ${-ty})`,
      `matrix(${cos}, ${-sin}, ${sin}, ${cos}, ${-tx}, ${-ty})`
    ];
  }

  columns.forEach((name, i) => {
    const [left, right] = matrix(1, col_stagger[i], col_splay[i]);
    svgTransform(`#left  .${name}`, left);
    svgTransform(`#right .${name}`, right);
    svgTransform(`.col${6 - i}m`, `translate(0 ${alt_stagger[i] * kh})`);
  });
  rows.forEach((name, i) => { // XXX ends up with a lot of unused rules
    cssTransform(`.${name}`, `translateY(${i * kh}px)`);
  });

  const leftThumb  = document.querySelector("#left  .thumbCluster");
  const rightThumb = document.querySelector("#right .thumbCluster");
  leftThumb.setAttribute("x", -kw);
  leftThumb.setAttribute("y", 3 * kh);
  rightThumb.setAttribute("x", kw);
  rightThumb.setAttribute("y", 3 * kh);
  thumbs.forEach((name, i) => {
    const [left, right] = matrix(1 + thumb_spread[i], thumb_stagger[i], thumb_splay[i]);
    svgTransform(`.leftThumb  .${name}`, left);
    svgTransform(`.rightThumb .${name}`, right);
  });
}

function setFlavor(flavor, vim) {
  document.querySelector("#left").setAttribute("class", flavor);
  document.querySelector("#right").setAttribute("class", flavor);
  ["left", "right"].forEach(id => {
    document.querySelector(`#${id} .thumbCluster`).setAttribute("href", `#${id}Thumb-${flavor}`);
  })
}

const drawKeys = () => {
  // show keys and dual keys
  const padding = 1.0;
  const ikw = kw - 2 * padding; // inner key width
  const ikh = kh - 2 * padding; // inner key width
  const radius = 4.0;

  document.querySelectorAll("rect").forEach(rect => {
    rect.setAttribute("x", padding);
    rect.setAttribute("y", padding);
    rect.setAttribute("rx", radius);
    rect.setAttribute("ry", radius);
    rect.setAttribute("width",  ikw);
    rect.setAttribute("height", ikh);
  });
  document.querySelectorAll("rect.sticky").forEach(rect => {
    rect.setAttribute("width",  ikw / 2);
  });
  document.querySelectorAll("rect.holdTap").forEach(rect => {
    rect.setAttribute("y", padding + ikh / 2);
    rect.setAttribute("width",  ikw / 2);
    rect.setAttribute("height", ikh / 2);
  });
  document.querySelectorAll(".specialKey rect.holdTap").forEach(rect => {
    rect.setAttribute("width", ikw);
  });
};

const drawLabels = () => {
  // show keyboard layout/config
  const x0 = kw * 0.50;
  const x1 = kw * 0.25;
  const x2 = kw * 0.75;

  // const y0 = kh * 0.58;
  const y0 = kh * 0.58;
  const y1 = kh * 0.80;
  const y2 = kh * 0.32;

  document.querySelectorAll(".level0").forEach(text => {
    text.setAttribute("x", x0);
    text.setAttribute("y", y0);
  });
  document.querySelectorAll(".level1").forEach(text => {
    text.setAttribute("x", x1);
    text.setAttribute("y", y1);
  });
  document.querySelectorAll(".level2").forEach(text => {
    text.setAttribute("x", x1);
    text.setAttribute("y", y2);
  });
  document.querySelectorAll(".layerSym, .layerNum").forEach(text => {
    text.setAttribute("x", x2);
    text.setAttribute("y", y2);
  });
  document.querySelectorAll(".layerNav, .layerVim, .layerFun",).forEach(text => {
    text.setAttribute("x", x2);
    text.setAttribute("y", y1);
  });
  document.querySelectorAll(".specialKey .level1, .specialKey .level2").forEach(text => {
    text.setAttribute("x", x0);
  });
  document.querySelectorAll("text.sticky").forEach(text => {
    text.setAttribute("x", -kh / 2);
    text.setAttribute("y", 20);
  });
};

function setLayout(keymap) {
  const setChar = (key, level, char) => {
    const label = key?.querySelector(`[class="${level}"]`);
    if (!label) {
      return;
    }
    if (!char) {
      label.textContent = "";
    }
    else if (char.length === 1) {
      label.textContent = char;
    }
    else if (char === "**") {
      label.textContent = "★";
    }
    else {
      label.textContent = char[1];
    }
  }
  if (!keymap.IntlBackslash) {
    keymap.IntlBackslash = keymap.Backslash;
  }
  for (const id in keymap) {
    const key = document.getElementById(id);
    const [ lower, upper ] = keymap[id];
    setChar(key, "level2", upper);
    setChar(key, "level1", lower.toUpperCase() !== upper
                         ? lower : "");
  }
}

setGeometry("qmx");
setFlavor("ez");
drawKeys();
drawLabels();

// keyboard layout
const setKeebLayout = (layout) => {
  if (layout) {
    fetch(`layouts/${layout}.json`)
      .then(response => response.json())
      .then(data => setLayout(data.keymap));
  } else {
    setLayout();
  }
  // selector.value = layout;
};
setKeebLayout('us');
