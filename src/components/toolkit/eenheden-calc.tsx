import { ArrowLeftRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { tx, useLocale } from "@/lib/i18n/locale";
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
import { CalcEyebrow,
  CalcPanel, CopyLink, CopyResult, Field, Note, SelectInput } from "./calc-ui";

const CAT_EN: Record<CategoryId, string> = {
  lengte: "Length",
  oppervlakte: "Area",
  volume: "Volume",
  massa: "Mass",
  kracht: "Force",
  druk: "Pressure",
  temperatuur: "Temperature",
  snelheid: "Speed",
  koppel: "Torque",
  vermogen: "Power",
  energie: "Energy",
  hoek: "Angle",
};

const controlClass =
  "h-12 w-full rounded-md border border-line-strong bg-paper px-3 font-mono text-base text-ink tabular-nums outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:ring-2 focus:ring-accent/30";

export function EenhedenCalc() {
  const { locale } = useLocale();
  const search = useSearch({ from: "/toolkit/eenheden" });
  const navigate = useNavigate({ from: "/toolkit/eenheden" });
  const initialSide: "from" | "to" = search.side === "to" ? "to" : "from";
  const [catId, setCatId] = useState<CategoryId>((search.cat as CategoryId) ?? "lengte");
  const [fromId, setFromId] = useState(search.from ?? "in");
  const [toId, setToId] = useState(search.to ?? "mm");
  const [rawFrom, setRawFrom] = useState(initialSide === "from" ? (search.val ?? "80") : "");
  const [edited, setEdited] = useState<"from" | "to">(initialSide);
  const [rawToEdit, setRawToEdit] = useState(initialSide === "to" ? (search.val ?? "") : "");

  useEffect(() => {
    const val = edited === "from" ? rawFrom : rawToEdit;
    navigate({
      search: (prev) => ({ ...prev, cat: catId, from: fromId, to: toId, val: val || undefined, side: edited }),
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catId, fromId, toId, edited, rawFrom, rawToEdit]);

  const category = categoryById(catId);
  const from = unitById(category, fromId);
  const to = unitById(category, toId);

  const fromValue = parseQty(rawFrom);
  const toTyped = parseQty(rawToEdit);

  const fromShown =
    edited === "to" && toTyped != null ? convert(toTyped, to, from) : fromValue;
  const toShown =
    edited === "from" && fromValue != null ? convert(fromValue, from, to) : toTyped;

  const rawFromDisplay =
    edited === "from" ? rawFrom : fromShown == null ? "" : formatQty(fromShown);
  const rawToDisplay =
    edited === "to" ? rawToEdit : toShown == null ? "" : formatQty(toShown);

  function pickCategory(next: CategoryId) {
    const cat = categoryById(next);
    setCatId(next);
    setFromId(cat.defaultFrom);
    setToId(cat.defaultTo);
    setEdited("from");
  }

  function pickFrom(id: string) {
    if (id === toId) setToId(fromId);
    setFromId(id);
  }

  function pickTo(id: string) {
    if (id === fromId) setFromId(toId);
    setToId(id);
  }

  function swap() {
    setFromId(to.id);
    setToId(from.id);
    if (edited === "from") {
      setRawFrom(rawToDisplay);
    } else {
      setRawToEdit(rawFromDisplay);
      setEdited("to");
    }
  }

  const sourceValue = edited === "from" ? fromValue : toTyped;
  const sourceUnit = edited === "from" ? from : to;

  const table = useMemo(() => {
    if (sourceValue == null) return [];
    return category.units.map((unit) => ({
      unit,
      value: convert(sourceValue, sourceUnit, unit),
    }));
  }, [category, sourceUnit, sourceValue]);

  const copy = useMemo(() => {
    if (fromShown == null || toShown == null) return "";
    const lines = [
      `${formatQty(fromShown)} ${from.symbol} = ${formatQty(toShown)} ${to.symbol}`,
      factorLine(from, to) ?? category.note,
    ];
    for (const row of table) {
      if (row.unit.id === from.id || row.unit.id === to.id) continue;
      lines.push(`${formatQty(row.value)} ${row.unit.symbol}`);
    }
    return lines.join("\n");
  }, [category.note, from, fromShown, table, to, toShown]);

  return (
    <>
      <CalcPanel>
        <CalcEyebrow />
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {tx(locale, "Omrekenen", "Convert")}
        </h2>
        <Note>
          {tx(
            locale,
            "SI, metrisch en imperial. Temperatuur via kelvin; de rest lineair. Komma en punt mogen allebei. Typ links of rechts; de andere kant volgt.",
            "SI, metric and imperial. Temperature via kelvin; the rest is linear. Comma and point both work. Type left or right; the other side follows.",
          )}
        </Note>

        <div className="mt-6">
          <Field label={tx(locale, "Grootheid", "Quantity")}>
            <SelectInput value={catId} onChange={(v) => pickCategory(v as CategoryId)}>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === "en" ? CAT_EN[cat.id] : cat.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <div className="mt-4 grid gap-6 sm:grid-cols-2 sm:gap-4">
          <div className="flex flex-col gap-4">
            <Field label={tx(locale, "Van", "From")}>
              <SelectInput value={from.id} onChange={pickFrom}>
                {category.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.symbol} — {tx(locale, unit.name, unit.nameEn)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label={tx(locale, `Waarde (${from.symbol})`, `Value (${from.symbol})`)}>
              <QtyInput
                value={rawFromDisplay}
                unit={from.symbol}
                onChange={(v) => {
                  setEdited("from");
                  setRawFrom(sanitizeQtyInput(v));
                }}
              />
            </Field>
          </div>
          <div className="flex flex-col gap-4">
            <Field label={tx(locale, "Naar", "To")}>
              <SelectInput value={to.id} onChange={pickTo}>
                {category.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.symbol} — {tx(locale, unit.name, unit.nameEn)}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label={tx(locale, `Waarde (${to.symbol})`, `Value (${to.symbol})`)}>
              <QtyInput
                value={rawToDisplay}
                unit={to.symbol}
                onChange={(v) => {
                  setEdited("to");
                  setRawToEdit(sanitizeQtyInput(v));
                }}
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 print:hidden">
          <Button type="button" variant="secondary" onClick={swap}>
            <ArrowLeftRight className="size-4" />
            {tx(locale, "Wissel van/naar", "Swap from/to")}
          </Button>
        </div>

        {fromShown != null && toShown != null ? (
          <>
            {factorLine(from, to) ? (
              <p className="mt-4 font-mono text-sm text-muted">{factorLine(from, to)}</p>
            ) : (
              <p className="mt-4 text-sm text-muted">{category.note}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <CopyResult text={copy} />
              <CopyLink />
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-muted">{tx(locale, "Voer een getal in.", "Enter a number.")}</p>
        )}
      </CalcPanel>

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          {tx(
            locale,
            `Alle eenheden in ${category.label.toLowerCase()}`,
            `All units in ${CAT_EN[category.id].toLowerCase()}`,
          )}
        </h2>
        <p className="mt-2 text-sm text-muted">{category.note}</p>
        <div className="table-scroll mt-4">
          <table className="ref-table">
            <thead>
              <tr>
                <th>{tx(locale, "Eenheid", "Unit")}</th>
                <th>{tx(locale, "Systeem", "System")}</th>
                <th>{tx(locale, "Waarde", "Value")}</th>
              </tr>
            </thead>
            <tbody>
              {category.units.map((unit) => {
                const shown =
                  sourceValue == null ? null : convert(sourceValue, sourceUnit, unit);
                const active = unit.id === to.id || unit.id === from.id;
                return (
                  <tr key={unit.id} className={active ? "is-active" : ""}>
                    <th scope="row">
                      {unit.symbol}
                      <span className="ml-2 font-sans font-normal text-muted">
                        {tx(locale, unit.name, unit.nameEn)}
                      </span>
                    </th>
                    <td>{systemLabel(unit.system, locale)}</td>
                    <td>{shown == null ? "—" : formatQty(shown)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          {tx(locale, "Factoren:", "Factors:")}{" "}
          <a
            href="https://www.nist.gov/publications/international-system-units-si-2019-edition"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {tx(locale, "BIPM SI-brochure (NIST SP 330)", "BIPM SI brochure (NIST SP 330)")}
          </a>
          ,{" "}
          <a
            href="https://physics.nist.gov/cuu/pdf/sp811.pdf"
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            NIST SP 811
          </a>
          .{" "}
          {tx(
            locale,
            "Inch = 25,4 mm exact. Geen vervanging van een meetrapport of ijkcertificaat.",
            "Inch = 25.4 mm exact. No substitute for a measurement report or calibration certificate.",
          )}
        </p>
      </section>
    </>
  );
}

function QtyInput({
  value,
  unit,
  onChange,
}: {
  value: string;
  unit: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => onChange(e.target.value)}
        className={`${controlClass} pr-16`}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-sm text-muted">
        {unit}
      </span>
    </div>
  );
}

function systemLabel(system: "si" | "imp" | "other", locale: "nl" | "en") {
  if (system === "si") return tx(locale, "SI / metrisch", "SI / metric");
  if (system === "imp") return "Imperial / US";
  return tx(locale, "Overig", "Other");
}
