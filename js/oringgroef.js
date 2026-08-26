(function () {
  /* Groefmaten: Dichtomatik O-ring brochure (DIN ISO 3601).
     Koorden d2: ISO 3601-1 groepen A–E. t/b nominale aanbeveling, t +0,05 / b +0,25.
     Samendrukking = (d2 − t)/d2: nominale compressie, geen plus-mintolerantie. */
  var GROOVE = {
    radial: {
      1.8: { t: 1.3, b: 2.4, C: 1.5 },
      2.65: { t: 2.0, b: 3.6, C: 2.0 },
      3.55: { t: 2.8, b: 4.7, C: 2.5 },
      5.3: { t: 4.3, b: 7.0, C: 3.0 },
      7: { t: 5.8, b: 9.3, C: 4.0 }
    },
    axial: {
      1.8: { t: 1.3, b: 2.6, C: null },
      2.65: { t: 2.0, b: 3.8, C: null },
      3.55: { t: 2.7, b: 5.0, C: null },
      5.3: { t: 4.2, b: 7.2, C: null },
      7: { t: 5.7, b: 9.7, C: null }
    },
    hydro: {
      1.8: { t: 1.5, b: 2.4, C: 1.3 },
      2.65: { t: 2.3, b: 3.4, C: 1.5 },
      3.55: { t: 3.1, b: 4.5, C: 2.0 },
      5.3: { t: 4.7, b: 6.8, C: 2.9 },
      7: { t: 6.2, b: 8.9, C: 3.6 }
    }
  };

  var LABELS = {
    radial: "Radiaal, statisch",
    axial: "Axiaal, statisch (flens)",
    hydro: "Radiaal, hydrauliek (dynamisch)"
  };

  function fmt(n, d) {
    return n.toFixed(d == null ? 1 : d).replace(".", ",");
  }

  function squeeze(d2, t) {
    return Math.round(((d2 - t) / d2) * 100);
  }

  var lastCopy = "";

  function render() {
    var form = document.getElementById("oring-calc");
    var out = document.getElementById("oring-calc-out");
    if (!form || !out) return;
    var d2 = parseFloat(form.d2.value);
    var kind = form.soort.value;
    var g = GROOVE[kind][d2];
    if (!g) {
      out.innerHTML = "<p class='dash-note'>Kies een ISO-koord.</p>";
      return;
    }
    var sq = squeeze(d2, g.t);
    var cLine = g.C != null
      ? "<div><dt>Inloop C</dt><dd>" + fmt(g.C) + " mm</dd></div>"
      : "";
    lastCopy =
      "O-ring d2 " + fmt(d2, 2) + " mm · " + LABELS[kind] + "\n" +
      "Groefdiepte t  " + fmt(g.t) + " mm (+0,05)\n" +
      "Groefbreedte b  " + fmt(g.b) + " mm (+0,25)\n" +
      "Samendrukking  ca. " + sq + " %";

    out.innerHTML =
      "<div class='calc-result'>" +
        "<p class='calc-kicker'>d₂ " + fmt(d2, 2) + " mm · " + LABELS[kind] + "</p>" +
        "<dl class='calc-dl'>" +
          "<div><dt>Groefdiepte t</dt><dd>" + fmt(g.t) + " mm <span class='calc-tol'>+0,05</span></dd></div>" +
          "<div><dt>Groefbreedte b</dt><dd>" + fmt(g.b) + " mm <span class='calc-tol'>+0,25</span></dd></div>" +
          "<div><dt>Nominale samendrukking</dt><dd>ca. " + sq + " %</dd></div>" +
          cLine +
        "</dl>" +
        "<p class='calc-use'>Samendrukking = (d₂ − t) / d₂. Nominale compressie, geen plus-mintolerantie. Dichtomatik; geen vervanging van ISO 3601-2.</p>" +
        "<button type='button' class='copy-result'>Kopieer resultaat</button>" +
      "</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("oring-calc");
    var out = document.getElementById("oring-calc-out");
    if (!form || !out) return;
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
