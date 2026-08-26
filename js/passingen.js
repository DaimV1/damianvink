(function () {
  /* ISO 286-2 limit deviations in µm. Bands: over … up to and including.
     H, h, c, d, f, g, k, n, p, s: RoyMech / ISO 286-2.
     30–40 and 40–50 split because shaft c changes at 40 mm; IT grades stay 30–50. */
  var BANDS = [
    { over: 3, to: 6, label: "3–6" },
    { over: 6, to: 10, label: "6–10" },
    { over: 10, to: 18, label: "10–18" },
    { over: 18, to: 30, label: "18–30" },
    { over: 30, to: 40, label: "30–40" },
    { over: 40, to: 50, label: "40–50" }
  ];

  var HOLE = {
    H7:  { ES: [12, 15, 18, 21, 25, 25], EI: [0, 0, 0, 0, 0, 0] },
    H8:  { ES: [18, 22, 27, 33, 39, 39], EI: [0, 0, 0, 0, 0, 0] },
    H9:  { ES: [30, 36, 43, 52, 62, 62], EI: [0, 0, 0, 0, 0, 0] },
    H11: { ES: [75, 90, 110, 130, 160, 160], EI: [0, 0, 0, 0, 0, 0] }
  };

  var SHAFT = {
    c11: { es: [-70, -80, -95, -110, -120, -130], ei: [-145, -170, -205, -240, -280, -290] },
    d9:  { es: [-30, -40, -50, -65, -80, -80], ei: [-60, -76, -93, -117, -142, -142] },
    f7:  { es: [-10, -13, -16, -20, -25, -25], ei: [-22, -28, -34, -41, -50, -50] },
    g6:  { es: [-4, -5, -6, -7, -9, -9], ei: [-12, -14, -17, -20, -25, -25] },
    h6:  { es: [0, 0, 0, 0, 0, 0], ei: [-8, -9, -11, -13, -16, -16] },
    k6:  { es: [9, 10, 12, 15, 18, 18], ei: [1, 1, 1, 2, 2, 2] },
    n6:  { es: [16, 19, 23, 28, 33, 33], ei: [8, 10, 12, 15, 17, 17] },
    p6:  { es: [20, 24, 29, 35, 42, 42], ei: [12, 15, 18, 22, 26, 26] },
    s6:  { es: [27, 32, 39, 48, 59, 59], ei: [19, 23, 28, 35, 43, 43] }
  };

  var FITS = [
    { id: "H11/c11", hole: "H11", shaft: "c11", kind: "los", use: "Ruime speling. Plaatwerk, ruwe montage, geverfde of vuile vlakken." },
    { id: "H9/d9", hole: "H9", shaft: "d9", kind: "los", use: "Ruime looppassing. Poelies, ringen, onderdelen die makkelijk moeten lopen." },
    { id: "H8/f7", hole: "H8", shaft: "f7", kind: "los", use: "Looppassing. Glijassen en lagers die met speling moeten draaien." },
    { id: "H7/g6", hole: "H7", shaft: "g6", kind: "los", use: "Nauwkeurig glijden. Weinig speling, nog met de hand te verschuiven." },
    { id: "H7/h6", hole: "H7", shaft: "h6", kind: "los", use: "Centrumpassing. Schuiven met minimale speling; locatie van stilstaande delen." },
    { id: "H7/k6", hole: "H7", shaft: "k6", kind: "overgang", use: "Overgang. Tikken met hamer; centreren waar speling of lichte klemming mag." },
    { id: "H7/n6", hole: "H7", shaft: "n6", kind: "overgang", use: "Stevige overgang. Meestal klemming; persen of tikken." },
    { id: "H7/p6", hole: "H7", shaft: "p6", kind: "vast", use: "Lichte perspassing. Naven op assen; uitlijning zonder speling." },
    { id: "H7/s6", hole: "H7", shaft: "s6", kind: "vast", use: "Perspassing. Pers of krimp; niet bedoeld om los te nemen." }
  ];

  function bandIndex(d) {
    for (var i = 0; i < BANDS.length; i++) {
      if (d > BANDS[i].over && d <= BANDS[i].to) return i;
    }
    return -1;
  }

  function mmFromUm(um) {
    var n = um / 1000;
    var sign = n > 0 ? "+" : n < 0 ? "" : "+";
    return sign + n.toFixed(3).replace(".", ",");
  }

  function kindLabel(kind, minC, maxC) {
    if (minC >= 0 && maxC >= 0) return { cls: "fit-los", text: "Los — altijd speling" };
    if (minC < 0 && maxC <= 0) return { cls: "fit-vast", text: "Vast — altijd overmaat" };
    return { cls: "fit-overgang", text: "Overgang — speling of klemming" };
  }

  function render() {
    var form = document.getElementById("fit-calc");
    var out = document.getElementById("fit-calc-out");
    if (!form || !out) return;

    var d = parseFloat(form.diameter.value);
    var fitId = form.fit.value;
    var fit = FITS.filter(function (f) { return f.id === fitId; })[0];
    if (!fit || isNaN(d)) {
      out.innerHTML = "<p class='dash-note'>Kies een nominale Ø en een passing.</p>";
      return;
    }
    if (d <= 3 || d > 50) {
      out.innerHTML = "<p class='dash-note'>Deze tabellen gelden voor nominale Ø <strong>boven 3 mm tot en met 50 mm</strong>.</p>";
      return;
    }
    var i = bandIndex(d);
    if (i < 0) {
      out.innerHTML = "<p class='dash-note'>Geen ISO-band voor deze diameter.</p>";
      return;
    }

    var hole = HOLE[fit.hole];
    var shaft = SHAFT[fit.shaft];
    var ES = hole.ES[i];
    var EI = hole.EI[i];
    var es = shaft.es[i];
    var ei = shaft.ei[i];
    var minC = EI - es;
    var maxC = ES - ei;
    var kind = kindLabel(fit.kind, minC, maxC);
    var band = BANDS[i];

    out.innerHTML =
      "<div class='calc-result'>" +
        "<p class='calc-kicker'>Ø " + String(d).replace(".", ",") + " mm · band " + band.label + " mm · <span class='swatch " + kind.cls + "'></span>" + kind.text + "</p>" +
        "<dl class='calc-dl'>" +
          "<div><dt>Gat " + fit.hole + "</dt><dd>" + mmFromUm(ES) + " / " + mmFromUm(EI) + " mm</dd></div>" +
          "<div><dt>As " + fit.shaft + "</dt><dd>" + mmFromUm(es) + " / " + mmFromUm(ei) + " mm</dd></div>" +
          "<div><dt>Speling min … max</dt><dd>" + mmFromUm(minC) + " … " + mmFromUm(maxC) + " mm</dd></div>" +
        "</dl>" +
        "<p class='calc-use'>" + fit.use + "</p>" +
      "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("fit-calc");
    if (!form) return;
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    render();
  });
})();
