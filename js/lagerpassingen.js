(function () {
  var BANDS = [
    { over: 3, to: 6, label: "3–6" },
    { over: 6, to: 10, label: "6–10" },
    { over: 10, to: 18, label: "10–18" },
    { over: 18, to: 30, label: "18–30" },
    { over: 30, to: 40, label: "30–40" },
    { over: 40, to: 50, label: "40–50" }
  ];

  var SHAFT = {
    g6:  { es: [-4, -5, -6, -7, -9, -9], ei: [-12, -14, -17, -20, -25, -25] },
    h6:  { es: [0, 0, 0, 0, 0, 0], ei: [-8, -9, -11, -13, -16, -16] },
    j5:  { es: [3, 4, 5, 5, 6, 6], ei: [-2, -2, -3, -4, -5, -5] },
    j6:  { es: [6, 7, 8, 9, 11, 11], ei: [-2, -2, -3, -4, -5, -5] },
    js5: { es: [2.5, 3, 4, 4.5, 5.5, 5.5], ei: [-2.5, -3, -4, -4.5, -5.5, -5.5] },
    k5:  { es: [6, 7, 9, 11, 13, 13], ei: [1, 1, 1, 2, 2, 2] },
    k6:  { es: [9, 10, 12, 15, 18, 18], ei: [1, 1, 1, 2, 2, 2] }
  };

  var HOLE = {
    H7: { ES: [12, 15, 18, 21, 25, 25], EI: [0, 0, 0, 0, 0, 0] },
    H8: { ES: [18, 22, 27, 33, 39, 39], EI: [0, 0, 0, 0, 0, 0] },
    J7: { ES: [6, 8, 10, 12, 14, 14], EI: [-6, -7, -8, -9, -11, -11] },
    K7: { ES: [3, 5, 6, 6, 7, 7], EI: [-9, -10, -12, -15, -18, -18] },
    M7: { ES: [0, 0, 0, 0, 0, 0], EI: [-12, -15, -18, -21, -25, -25] },
    N7: { ES: [-4, -4, -5, -7, -8, -8], EI: [-16, -19, -23, -28, -33, -33] }
  };

  function bandIndex(d) {
    for (var i = 0; i < BANDS.length; i++) {
      if (d > BANDS[i].over && d <= BANDS[i].to) return i;
    }
    return -1;
  }

  function mmFromUm(um) {
    var n = um / 1000;
    var sign = n > 0 ? "+" : n < 0 ? "" : "+";
    var decimals = (Math.abs(um) % 1 === 0) ? 3 : 4;
    return sign + n.toFixed(decimals).replace(".", ",");
  }

  function readDiameter(input) {
    var raw = String(input.value).replace(",", ".").trim();
    if (raw === "" || !/^\d{1,4}$/.test(raw)) return NaN;
    return parseInt(raw, 10);
  }

  /* SKF: groefkogellagers, massieve stalen as, cilindrische boring.
     js5 alleen tot en met 17 mm; Ø 20 mm licht is j6. */
  function pick(d, rot, load) {
    var shaft, hole, holeAlt = null, note;

    if (rot === "binnen") {
      if (load === "licht") {
        shaft = d <= 17 ? "js5" : "j6";
        hole = "H7";
        holeAlt = "J7";
        note = "Lichte last (P ≤ 0,05 C): overgang op de as, huis verschuifbaar.";
      } else {
        if (d <= 10) shaft = "js5";
        else if (d <= 17) shaft = "j5";
        else shaft = "k5";
        hole = "H7";
        holeAlt = "K7";
        note = "Normale tot hoge last (P > 0,05 C): vastere as. Huis H7 als de buitenring moet kunnen schuiven; K7 als dat niet nodig is.";
      }
    } else if (rot === "buiten") {
      shaft = "g6";
      if (load === "licht") {
        hole = "M7";
        note = "Buitenring draait, lichte last: vaste huispassing (M7), as los (g6).";
      } else {
        hole = "N7";
        note = "Buitenring draait, normale tot hoge last: vaste huispassing (N7), as los (g6).";
      }
    } else {
      shaft = "g6";
      hole = "H7";
      note = "Stilstaande binnenring, axiale verschuiving gewenst: as g6. SKF: h6 als verschuiving op de as niet nodig is.";
    }

    return { shaft: shaft, hole: hole, holeAlt: holeAlt, note: note };
  }

  var lastCopy = "";

  function syncLoad(form) {
    var load = form.belasting;
    var wrap = load.closest("label");
    var stil = form.rotatie.value === "stil";
    load.disabled = stil;
    if (wrap) wrap.classList.toggle("is-disabled", stil);
  }

  function render() {
    var form = document.getElementById("lager-calc");
    var out = document.getElementById("lager-calc-out");
    if (!form || !out) return;
    syncLoad(form);

    var raw = String(form.diameter.value).trim();
    if (raw === "") {
      lastCopy = "";
      out.innerHTML = "<p class='dash-note'>Vul een as-Ø in.</p>";
      return;
    }
    var d = readDiameter(form.diameter);
    var rot = form.rotatie.value;
    var load = form.belasting.value;
    if (isNaN(d)) {
      lastCopy = "";
      out.innerHTML = "<p class='dash-note'>Vul een as-Ø in hele millimeters in.</p>";
      return;
    }
    var i = bandIndex(d);
    if (i < 0) {
      lastCopy = "";
      out.innerHTML = "<p class='dash-note'>Geen SKF-rij voor Ø " + d + " mm. Rekenhulp: 4 t/m 50 mm.</p>";
      return;
    }

    var rec = pick(d, rot, load);
    var sh = SHAFT[rec.shaft];
    var ho = HOLE[rec.hole];
    var band = BANDS[i];
    var alt = "";
    if (rec.holeAlt) {
      var ha = HOLE[rec.holeAlt];
      alt =
        "<div><dt>Huis " + rec.holeAlt + " (alternatief)</dt><dd>" +
        mmFromUm(ha.ES[i]) + " / " + mmFromUm(ha.EI[i]) + " mm</dd></div>";
    }
    var h6line = "";
    if (rot === "stil") {
      var h6 = SHAFT.h6;
      h6line =
        "<div><dt>As h6 (geen verschuiving nodig)</dt><dd>" +
        mmFromUm(h6.es[i]) + " / " + mmFromUm(h6.ei[i]) + " mm</dd></div>";
    }

    lastCopy =
      "Groefkogellager · as Ø " + d + " mm · band " + band.label + " mm\n" +
      "As " + rec.shaft + "  " + mmFromUm(sh.es[i]) + " / " + mmFromUm(sh.ei[i]) + " mm\n" +
      "Huis " + rec.hole + "  " + mmFromUm(ho.ES[i]) + " / " + mmFromUm(ho.EI[i]) + " mm" +
      (rec.holeAlt ? "\nHuis " + rec.holeAlt + " (alternatief)" : "");

    out.innerHTML =
      "<div class='calc-result'>" +
        "<p class='calc-kicker'>As Ø " + d + " mm · band " + band.label + " mm · groefkogellager</p>" +
        "<dl class='calc-dl'>" +
          "<div><dt>As " + rec.shaft + "</dt><dd>" + mmFromUm(sh.es[i]) + " / " + mmFromUm(sh.ei[i]) + " mm</dd></div>" +
          "<div><dt>Huis " + rec.hole + "</dt><dd>" + mmFromUm(ho.ES[i]) + " / " + mmFromUm(ho.EI[i]) + " mm</dd></div>" +
          alt + h6line +
        "</dl>" +
        "<p class='calc-use'>" + rec.note + "</p>" +
        "<button type='button' class='copy-result'>Kopieer resultaat</button>" +
      "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("lager-calc");
    var out = document.getElementById("lager-calc-out");
    if (!form || !out) return;
    var dia = form.diameter;
    dia.addEventListener("focus", function () { dia.select(); });
    dia.addEventListener("input", function () {
      var v = dia.value.replace(",", ".").replace(/[^\d]/g, "");
      if (dia.value !== v) dia.value = v;
      render();
    });
    form.addEventListener("change", render);
    out.addEventListener("click", function (e) {
      var btn = e.target.closest(".copy-result");
      if (!btn || !lastCopy) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastCopy).then(function () {
          btn.textContent = "Gekopieerd";
          setTimeout(function () { btn.textContent = "Kopieer resultaat"; }, 1600);
        }).catch(function () {});
      }
    });
    render();
  });
})();
