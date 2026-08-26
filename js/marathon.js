(function () {
  function fmtNl(n, digits) {
    return Number(n).toLocaleString("nl-NL", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function longestFromCumulative(points) {
    var max = 0;
    var prev = 0;
    points.forEach(function (p) {
      var d = p.km - prev;
      if (d > max) max = d;
      prev = p.km;
    });
    return max;
  }

  function weekSum(weeks) {
    return weeks.reduce(function (s, w) { return s + w.km; }, 0);
  }

  function renderKpis(el, items) {
    el.innerHTML = items.map(function (item) {
      return (
        "<article class='kpi'>" +
          "<span class='kpi-label'>" + item.label + "</span>" +
          "<span class='kpi-value'>" + item.value + "</span>" +
          "<span class='kpi-unit'>" + item.unit + "</span>" +
        "</article>"
      );
    }).join("");
  }

  function renderWeeks(el, weeks) {
    var max = Math.max.apply(null, weeks.map(function (w) { return w.km; })) || 1;
    el.innerHTML = weeks.map(function (w, i) {
      var pct = Math.max(8, Math.round((w.km / max) * 100));
      var now = i === weeks.length - 1 ? " is-now" : "";
      var label = w.label.replace(/</g, "");
      return (
        "<div class='week-bar" + now + "' style='--h:" + pct + "%' title='" + label + ": " + fmtNl(w.km, 1) + " km'>" +
          "<span class='wb-val'>" + fmtNl(w.km, 1) + "</span>" +
          "<span class='wb-lab'>" + label + "</span>" +
        "</div>"
      );
    }).join("");
  }

  function renderChart(svg, points) {
    var w = 640;
    var h = 220;
    var padL = 40;
    var padR = 12;
    var padT = 16;
    var padB = 28;
    var last = points[points.length - 1];
    var maxKm = last.km;
    var innerW = w - padL - padR;
    var innerH = h - padT - padB;
    var coords = points.map(function (p, i) {
      var x = padL + (points.length === 1 ? 0 : (i / (points.length - 1)) * innerW);
      var y = padT + (1 - p.km / maxKm) * innerH;
      return { x: x, y: y, p: p };
    });
    var line = coords.map(function (c, i) {
      return (i === 0 ? "M" : "L") + " " + c.x.toFixed(1) + " " + c.y.toFixed(1);
    }).join(" ");
    var area = line + " L " + coords[coords.length - 1].x.toFixed(1) + " " + (h - padB).toFixed(1) +
      " L " + coords[0].x.toFixed(1) + " " + (h - padB).toFixed(1) + " Z";
    var grid = [0.25, 0.5, 0.75, 1].map(function (f) {
      var y = padT + (1 - f) * innerH;
      var label = Math.round(maxKm * f);
      return "<line x1='" + padL + "' y1='" + y.toFixed(1) + "' x2='" + (w - padR) + "' y2='" + y.toFixed(1) + "' class='chart-grid'/>" +
        "<text x='" + (padL - 6) + "' y='" + (y + 3).toFixed(1) + "' text-anchor='end' class='chart-label'>" + label + "</text>";
    }).join("");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.innerHTML =
      grid +
      "<path d='" + area + "' class='chart-area'></path>" +
      "<path d='" + line + "' class='chart-line' fill='none'></path>" +
      "<text x='" + padL + "' y='" + (h - 6) + "' class='chart-label'>" + points[0].date + "</text>" +
      "<text x='" + (w - padR) + "' y='" + (h - 6) + "' text-anchor='end' class='chart-label'>" + last.date + "</text>";
  }

  function renderRecent(tbody, rows) {
    tbody.innerHTML = rows.map(function (r) {
      return "<tr><td>" + r.date + "</td><td>" + r.type + "</td><td>" + fmtNl(r.km, 1) + " km</td><td>" + r.time + "</td></tr>";
    }).join("");
  }

  function fill(data) {
    var all = data.totals_all;
    var plan = data.totals;
    var kpisAll = document.getElementById("kpis-all");
    var kpisPlan = document.getElementById("kpis-plan");
    if (kpisAll && all) {
      renderKpis(kpisAll, [
        { label: "Afstand", value: fmtNl(all.distance_km, 1), unit: "km" },
        { label: "Activiteiten", value: String(all.activities), unit: "stuks" },
        { label: "Tijd in beweging", value: fmtNl(all.moving_time_h, 1), unit: "uur" },
        { label: "Hoogtemeters", value: fmtNl(all.elevation_m, 0), unit: "m" }
      ]);
    }
    if (kpisPlan && plan) {
      var longest = longestFromCumulative(data.cumulative || []);
      renderKpis(kpisPlan, [
        { label: "Afstand plan", value: fmtNl(plan.distance_km, 1), unit: "km" },
        { label: "Runs", value: String(plan.activities), unit: "stuks" },
        { label: "Tijd in beweging", value: fmtNl(plan.moving_time_h, 1), unit: "uur" },
        { label: "Gem. tempo", value: data.avg_pace || "—", unit: "min/km" },
        { label: "Hoogtemeters plan", value: fmtNl(plan.elevation_m, 0), unit: "m" },
        { label: "Langste run", value: fmtNl(longest, 1), unit: "km" }
      ]);
    }

    var weekEl = document.getElementById("week-bars");
    if (weekEl && data.weekly) renderWeeks(weekEl, data.weekly);

    var weekNote = document.getElementById("week-note");
    if (weekNote && data.weekly) {
      var sum = weekSum(data.weekly);
      weekNote.textContent =
        data.weekly.length + " weken · plantsom " + fmtNl(plan.distance_km, 1) +
        " km (som van de weekstaven " + fmtNl(sum, 1) + " km door afronding op 1 decimaal).";
    }

    var svg = document.getElementById("cum-chart");
    if (svg && data.cumulative && data.cumulative.length) renderChart(svg, data.cumulative);

    var cumNote = document.getElementById("cum-note");
    if (cumNote && data.cumulative && data.plan) {
      var last = data.cumulative[data.cumulative.length - 1];
      cumNote.textContent = "Opbouw tot " + fmtNl(last.km, 1) + " km sinds " + data.plan.start + ".";
    }

    var tbody = document.querySelector("#recent-table tbody");
    if (tbody && data.recent) renderRecent(tbody, data.recent);

    var planNote = document.getElementById("plan-note");
    if (planNote && data.plan) {
      planNote.textContent =
        (data.plan.note || "Hardloopsessies vanaf 3 juni 2026") +
        " · bron: " + (data.source || "Strava-export") +
        " · bijgewerkt " + data.updated;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetch("/data/strava.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("strava.json " + res.status);
        return res.json();
      })
      .then(fill)
      .catch(function () {
        /* hardcoded HTML blijft staan als fallback */
      });
  });
})();
