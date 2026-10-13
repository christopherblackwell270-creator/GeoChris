// Generative topographic contours for the hero, small map thumbnails for
// project cards, and copy buttons for contact details.
(function () {
  "use strict";

  // Smooth value noise, seeded so the map looks the same on every load.
  function makeNoise(seed) {
    var p = [];
    for (var i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      var j = seed % (i + 1), t = p[i]; p[i] = p[j]; p[j] = t;
    }
    var perm = p.concat(p), vals = perm.map(function (v) { return v / 255; });
    function lerp(a, b, t) { return a + (b - a) * t; }
    function fade(t) { return t * t * (3 - 2 * t); }
    function n2(x, y) {
      var xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
      var xf = x - Math.floor(x), yf = y - Math.floor(y);
      var a = vals[perm[xi + perm[yi]]], b = vals[perm[xi + 1 + perm[yi]]];
      var c = vals[perm[xi + perm[yi + 1]]], d = vals[perm[xi + 1 + perm[yi + 1]]];
      var u = fade(xf), v = fade(yf);
      return lerp(lerp(a, b, u), lerp(c, d, u), v);
    }
    return function (x, y) {
      return n2(x, y) * 0.6 + n2(x * 2.1, y * 2.1) * 0.28 + n2(x * 4.3, y * 4.3) * 0.12;
    };
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  // Marching squares contour lines over a noise field.
  function drawContours(canvas, opts) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    canvas.width = w * dpr; canvas.height = h * dpr;
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var noise = makeNoise(opts.seed || 42);
    var cell = opts.cell || 10, scale = opts.scale || 0.006;
    var cols = Math.ceil(w / cell) + 1, rows = Math.ceil(h / cell) + 1;
    var field = [];
    for (var y = 0; y < rows; y++) {
      field[y] = [];
      for (var x = 0; x < cols; x++) {
        var dx = x * cell, dy = y * cell;
        // Bias elevation upward toward the right, like a coastal ridge.
        field[y][x] = noise(dx * scale, dy * scale) * 0.8 + (dx / w) * 0.25;
      }
    }
    var levels = opts.levels || 18;
    for (var l = 1; l < levels; l++) {
      var t = l / levels;
      var index = l % 5 === 0;
      ctx.strokeStyle = index ? opts.indexColor : opts.color;
      ctx.lineWidth = index ? 1.3 : 0.8;
      ctx.beginPath();
      for (y = 0; y < rows - 1; y++) {
        for (x = 0; x < cols - 1; x++) {
          var a = field[y][x], b = field[y][x + 1], c = field[y + 1][x + 1], d = field[y + 1][x];
          var code = (a > t ? 8 : 0) | (b > t ? 4 : 0) | (c > t ? 2 : 0) | (d > t ? 1 : 0);
          if (code === 0 || code === 15) continue;
          var px = x * cell, py = y * cell;
          var top = [px + cell * (t - a) / (b - a), py];
          var right = [px + cell, py + cell * (t - b) / (c - b)];
          var bottom = [px + cell * (t - d) / (c - d), py + cell];
          var left = [px, py + cell * (t - a) / (d - a)];
          var segs = {
            1: [left, bottom], 2: [bottom, right], 3: [left, right], 4: [top, right],
            5: [left, top, bottom, right], 6: [top, bottom], 7: [left, top],
            8: [left, top], 9: [top, bottom], 10: [left, bottom, top, right],
            11: [top, right], 12: [left, right], 13: [bottom, right], 14: [left, bottom]
          }[code];
          for (var s = 0; s < segs.length; s += 2) {
            ctx.moveTo(segs[s][0], segs[s][1]);
            ctx.lineTo(segs[s + 1][0], segs[s + 1][1]);
          }
        }
      }
      ctx.stroke();
    }
  }

  // Classified raster, like an NDVI change map.
  function drawRaster(canvas, seed) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d"), noise = makeNoise(seed);
    var ramp = [cssVar("--ochre"), cssVar("--paper-2"), cssVar("--sage"), cssVar("--sea")];
    var px = 8;
    for (var y = 0; y < h; y += px) {
      for (var x = 0; x < w; x += px) {
        var v = noise(x * 0.012, y * 0.012);
        ctx.fillStyle = ramp[Math.min(3, Math.floor(v * 4.4))];
        ctx.fillRect(x, y, px, px);
      }
    }
  }

  // Survey points over faint contours, like plot locations on a transect.
  function drawPoints(canvas, seed) {
    drawContours(canvas, { seed: seed, cell: 8, scale: 0.012, levels: 12, color: cssVar("--contour"), indexColor: cssVar("--contour") });
    var ctx = canvas.getContext("2d"), w = canvas.clientWidth, h = canvas.clientHeight;
    var s = seed;
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    for (var i = 0; i < 26; i++) {
      var x = 20 + rnd() * (w - 40), y = 20 + rnd() * (h - 40);
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = i % 4 === 0 ? cssVar("--ochre") : cssVar("--sage");
      ctx.fill();
    }
  }

  // Thermal surface: smooth hot spots from cool to warm.
  function drawHeat(canvas, seed) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d"), noise = makeNoise(seed);
    var ramp = [cssVar("--sea"), cssVar("--sage"), cssVar("--ochre"), "#c0532b"];
    var px = 5;
    for (var y = 0; y < h; y += px) {
      for (var x = 0; x < w; x += px) {
        var v = noise(x * 0.02, y * 0.02);
        ctx.fillStyle = ramp[Math.max(0, Math.min(3, Math.floor((v - 0.2) * 6)))];
        ctx.fillRect(x, y, px, px);
      }
    }
  }

  // Parcel fabric with a few candidate sites highlighted.
  function drawParcels(canvas, seed) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d"), s = seed;
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    ctx.fillStyle = cssVar("--paper-2"); ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = cssVar("--ink-soft"); ctx.lineWidth = 0.7;
    var y = 0;
    while (y < h) {
      var rh = 22 + rnd() * 30, x = 0;
      while (x < w) {
        var rw = 26 + rnd() * 60, r = rnd();
        if (r > 0.86) { ctx.fillStyle = cssVar("--sage"); ctx.fillRect(x, y, rw, rh); }
        else if (r > 0.8) { ctx.fillStyle = cssVar("--ochre"); ctx.fillRect(x, y, rw, rh); }
        ctx.strokeRect(x + 0.5, y + 0.5, rw, rh);
        x += rw;
      }
      y += rh;
    }
  }

  function render() {
    var hero = document.getElementById("hero-map");
    if (hero) drawContours(hero, { seed: 1917, cell: 9, scale: 0.0045, levels: 20, color: cssVar("--contour"), indexColor: cssVar("--ochre") });
    document.querySelectorAll("canvas[data-thumb]").forEach(function (c, i) {
      var kind = c.getAttribute("data-thumb");
      if (kind === "raster") drawRaster(c, 300 + i);
      else if (kind === "heat") drawHeat(c, 900 + i);
      else if (kind === "parcels") drawParcels(c, 40 + i);
      else if (kind === "points") drawPoints(c, 77 + i);
      else drawContours(c, { seed: 500 + i, cell: 7, scale: 0.014, levels: 14, color: cssVar("--sea"), indexColor: cssVar("--ochre") });
    });
  }

  var timer;
  window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(render, 150); });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", render);
  }
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = document.getElementById(btn.getAttribute("data-copy")).textContent.trim();
      function done() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1600); }
      try {
        navigator.clipboard.writeText(text).then(done, select);
      } catch (e) { select(); }
      function select() {
        var range = document.createRange();
        range.selectNodeContents(document.getElementById(btn.getAttribute("data-copy")));
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      }
    });
  });

  // Header dropdowns: tap to open on touch screens, close on outside tap or link choice.
  var dds = document.querySelectorAll(".dd");
  function closeAll(except) {
    dds.forEach(function (dd) {
      if (dd !== except) { dd.classList.remove("open"); dd.querySelector(".dd-btn").setAttribute("aria-expanded", "false"); }
    });
  }
  dds.forEach(function (dd) {
    var btn = dd.querySelector(".dd-btn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !dd.classList.contains("open");
      closeAll(dd);
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    dd.querySelectorAll(".dd-menu a").forEach(function (a) {
      a.addEventListener("click", function () { closeAll(); if (document.activeElement) document.activeElement.blur(); });
    });
  });
  document.addEventListener("click", function () { closeAll(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
