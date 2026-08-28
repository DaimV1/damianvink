import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  categoryById,
  convert,
  factorLine,
  formatQty,
  parseQty,
  sanitizeQtyInput,
  unitById,
  type CategoryId,
} from "@/lib/toolkit/units";
import {
  CalcPanel,
  CopyResult,
  Field,
  Note,
  ResultGrid,
  SelectInput,
} from "./calc-ui";

const controlClass =
  "h-12 w-full rounded-md border border-line-strong bg-paper px-3 font-mono text-base text-ink tabular-nums outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30";

export function EenhedenCalc() {
  const [catId, setCatId] = useState<CategoryId>("lengte");
  const [fromId, setFromId] = useState("in");
  const [toId, setToId] = useState("mm");
  const [raw, setRaw] = useState("1");

  const category = categoryById(catId);
  const from = unitById(category, fromId);
  const to = unitById(category, toId);
  const value = parseQty(raw);

  function pickCategory(next: CategoryId) {
    const cat = categoryById(next);
    setCatId(next);
    setFromId(cat.defaultFrom);
    setToId(cat.defaultTo);
  }

  const result = value != null ? convert(value, from, to) : null;

  const table = useMemo(() => {
    if (value == null) return [];
    return category.units.map((unit) => ({
      unit,
      value: convert(value, from, unit),
    }));
  }, [category, from, value]);

  const copy = useMemo(() => {
    if (result == null || value == null) return "";
    const lines = [
      `${formatQty(value)} ${from.symbol} = ${formatQty(result)} ${to.symbol}`,
      factorLine(from, to) ?? category.note,
    ];
    for (const row of table) {
      if (row.unit.id === from.id) continue;
      lines.push(`${formatQty(row.value)} ${row.unit.symbol}`);
    }
    return lines.join("\n");
  }, [category.note, from, result, table, to, value]);

  return (
    <>
      <CalcPanel>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Rekenhulp
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          Omrekenen
        </h2>
        <Note>
          SI, metrisch en imperial in één richting. Temperatuur via kelvin;
          de rest lineair. Komma en punt mogen allebei.
        </Note>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Grootheid">
            <SelectInput value={catId} onChange={(v) => pickCategory(v as CategoryId)}>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Waarde">
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              value={raw}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setRaw(sanitizeQtyInput(e.target.value))}
              className={controlClass}
            />
          </Field>
          <Field label="Van">
            <SelectInput value={from.id} onChange={setFromId}>
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.symbol} — {unit.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Naar">
            <SelectInput value={to.id} onChange={setToId}>
              {category.units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.symbol} — {unit.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFromId(to.id);
              setToId(from.id);
            }}
          >
            <ArrowLeftRight className="size-4" />
            Wissel van/naar
          </Button>
        </div>

        {result != null && value != null ? (
          <>
            <ResultGrid
              items={[
                {
                  label: `${from.symbol} → ${to.symbol}`,
                  value: `${formatQty(result)} ${to.symbol}`,
                },
                {
                  label: "Invoer",
                  value: `${formatQty(value)} ${from.symbol}`,
                },
              ]}
            />
            {factorLine(from, to) ? (
              <p className="mt-4 font-mono text-sm text-muted">{factorLine(from, to)}</p>
            ) : (
              <p className="mt-4 text-sm text-muted">{category.note}</p>
            )}
            <CopyResult text={copy} />
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">Voer een getal in.</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Alle eenheden in {category.label.toLowerCase()}
        </h2>
        <p className="mt-2 text-sm text-muted">{category.note}</p>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>Eenheid</th>
                <th>Systeem</th>
                <th>Waarde</th>
              </tr>
            </thead>
            <tbody>
              {category.units.map((unit) => {
                const shown = value != null ? convert(value, from, unit) : null;
                const active = unit.id === to.id;
                return (
                  <tr key={unit.id} className={active ? "is-active" : ""}>
                    <th scope="row">
                      {unit.symbol}
                      <span className="ml-2 font-sans font-normal text-muted">{unit.name}</span>
                    </th>
                    <td>{systemLabel(unit.system)}</td>
                    <td>{shown == null ? "—" : formatQty(shown)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Factoren: BIPM SI-brochure, NIST SP 811. Inch = 25,4 mm exact. Geen
          vervanging van een meetrapport of ijkcertificaat.
        </p>
      </section>
    </>
  );
}

function systemLabel(system: "si" | "imp" | "other") {
  if (system === "si") return "SI / metrisch";
  if (system === "imp") return "Imperial / US";
  return "Overig";
}
