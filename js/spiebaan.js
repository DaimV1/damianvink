(function () {
  /* DIN 6885-1 hoge vorm. Asdiameter: boven de ondergrens tot en met de bovengrens.
     Eerste rij is boven 6 t/m 8 (Ø 6 mm valt erbuiten). */
  var KEYWAYS = [
    { over: 6, to: 8, b: 2, h: 2, t1: 1.2, t2: 1.0, depthTol: 0.1 },
    { over: 8, to: 10, b: 3, h: 3, t1: 1.8, t2: 1.4, depthTol: 0.1 },
    { over: 10, to: 12, b: 4, h: 4, t1: 2.5, t2: 1.8, depthTol: 0.1 },
    { over: 12, to: 17, b: 5, h: 5, t1: 3.0, t2: 2.3, depthTol: 0.1 },
    { over: 17, to: 22, b: 6, h: 6, t1: 3.5, t2: 2.8, depthTol: 0.1 },
    { over: 22, to: 30, b: 8, h: 7, t1: 4.0, t2: 3.3, depthTol: 0.2 },
    { over: 30, to: 38, b: 10, h: 8, t1: 5.0, t2: 3.3, depthTol: 0.2 },
    { over: 38, to: 44, b: 12, h: 8, t1: 5.0, t2: 3.3, depthTol: 0.2 },
    { over: 44, to: 50, b: 14, h: 9, t1: 5.5, t2: 3.8, depthTol: 0.2 },
    { over: 50, to: 58, b: 16, h: 10, t1: 6.0, t2: 4.3, depthTol: 0.2 },
    { over: 58, to: 65, b: 18, h: 11, t1: 7.0, t2: 4.4, depthTol: 0.2 },
    { over: 65, to: 75, b: 20, h: 12, t1: 7.5, t2: 4.9, depthTol: 0.2 },
    { over: 75, to: 85, b: 22, h: 14, t1: 9.0, t2: 5.4, depthTol: 0.2 },
    { over: 85, to: 95, b: 25, h: 14, t1: 9.0, t2: 5.4, depthTol: 0.2 },
    { over: 95, to: 110, b: 28, h: 16, t1: 10.0, t2: 6.4, depthTol: 0.2 }
  ];

  function fmt(n) {
    return n.toFixed(1).replace(".", ",");
  }

  function lookup(d) {
    for (var i = 0; i < KEYWAYS.length; i++) {
      if (d > KEYWAYS[i].over && d <= KEYWAYS[i].to) return KEYWAYS[i];
    }
    return null;
  }

  var lastCopy = "";

  function render() {
    var form = document.getElementById("spie-calc");
    var out = document.getElementById("spie-calc-out");
    if (!form || !out) return;
    var raw = String(form.diameter.value).replace(",", ".").trim();
    if (raw === "") {
      lastCopy = "";
      out.innerHTML = "<p class='dash-note'>Vul een as-Ø in.</p>";
      return;
    }
    if (!/^\d{1,4}$/.test(raw)) {
      lastCopy = "";
      out.innerHTML = "<p class='dash-note'>Vul een as-Ø in hele millimeters in.</p>";
      return;
    }
    var d = parseInt(raw, 10);
    var row = lookup(d);
    if (!row) {
      lastCopy = "";
      out.innerHTML = "<p class='dash-note'>Geen rij in DIN 6885-1 voor Ø " + d + " mm. De tabel begint boven 6 mm tot en met 110 mm.</p>";
      return;
    }
    var label = "boven " + row.over + " t/m " + row.to;
    lastCopy =
      "As Ø " + d + " mm · " + label + "\n" +
      "Spie " + row.b + " × " + row.h + " mm\n" +
      "t₁ as  " + fmt(row.t1) + " mm\n" +
      "t₂ naaf  " + fmt(row.t2) + " mm\n" +
      "Dieptetol.  0 / +" + fmt(row.depthTol) + " mm";
    out.innerHTML =
      "<div class='calc-result'>" +
        "<p class='calc-kicker'>As Ø " + d + " mm · " + label + "</p>" +
        "<dl class='calc-dl'>" +
          "<div><dt>Spie b × h</dt><dd>" + row.b + " × " + row.h + " mm</dd></div>" +
          "<div><dt>t₁ as</dt><dd>" + fmt(row.t1) + " mm</dd></div>" +
          "<div><dt>t₂ naaf</dt><dd>" + fmt(row.t2) + " mm</dd></div>" +
          "<div><dt>Dieptetolerantie</dt><dd>0 / +" + fmt(row.depthTol) + " mm</dd></div>" +
        "</dl>" +
        "<button type='button' class='copy-result'>Kopieer resultaat</button>" +
      "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("spie-calc");
    var out = document.getElementById("spie-calc-out");
    if (!form || !out) return;
    var dia = form.diameter;
    dia.addEventListener("focus", function () { dia.select(); });
    dia.addEventListener("input", function () {
      var v = dia.value.replace(",", ".").replace(/[^\d]/g, "");
      if (dia.value !== v) dia.value = v;
      render();
    });
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
