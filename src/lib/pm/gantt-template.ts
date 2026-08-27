function colLetter(n: number) {
  let s = "";
  let x = n;
  while (x > 0) {
    const r = (x - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

function esc(value: string) {
  return value
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """);
}

const WEEKS = 20;
const EMPTY_ROWS = 10;

const SAMPLES: [string, string, string, string, string, number, number][] = [
  ["M1", "1", "Kick-off", "Mijlpaal", "PM", 0, 0],
  ["A1", "1.1", "Opdracht en scope", "Activiteit", "PM", 1, 9],
  ["A2", "1.2", "Stakeholderanalyse", "Activiteit", "PM", 5, 11],
  ["A3", "2.1", "WBS uitwerken", "Activiteit", "PM", 10, 16],
  ["A4", "2.2", "Raming PERT", "Activiteit", "PM", 14, 20],
  ["A5", "2.3", "Planning en baseline", "Activiteit", "PM", 18, 24],
  ["M2", "2", "Baseline goedgekeurd", "Mijlpaal", "OG", 24, 24],
  ["A6", "3.1", "Werkpakket A", "Activiteit", "", 25, 52],
  ["A7", "3.2", "Werkpakket B", "Activiteit", "", 32, 66],
  ["A8", "3.3", "Integratie en test", "Activiteit", "", 60, 80],
  ["M3", "4", "Oplevering intern", "Mijlpaal", "PM", 80, 80],
  ["A9", "4.1", "Nazorg en dossier", "Activiteit", "PM", 81, 94],
  ["M4", "5", "Decharge", "Mijlpaal", "OG", 94, 94],
];

function mondayIso(d = new Date()) {
  const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() - day + 1);
  return x.toISOString().slice(0, 10);
}

export function buildGanttWorkbook(projectName = "") {
  const start = mondayIso();
  const heads = [
    "ID",
    "WBS",
    "Activiteit / mijlpaal",
    "Type",
    "Eigenaar",
    "Start",
    "Einde",
    "Duur (d)",
    "% klaar",
    "Status",
  ];

  const rows: string[] = [];
  rows.push(
    `<Row ss:Height="24"><Cell ss:MergeAcross="12" ss:StyleID="Title"><Data ss:Type="String">Gantt-planning</Data></Cell></Row>`,
  );
  rows.push(
    `<Row ss:Height="20"><Cell ss:StyleID="Label"><Data ss:Type="String">Projectstartdatum (maandag)</Data></Cell><Cell ss:StyleID="InputDate"><Data ss:Type="DateTime">${start}T00:00:00.000</Data></Cell><Cell ss:StyleID="Label"><Data ss:Type="String">Project</Data></Cell><Cell ss:StyleID="Input"><Data ss:Type="String">${esc(projectName)}</Data></Cell><Cell ss:MergeAcross="8" ss:StyleID="Hint"><Data ss:Type="String">Wijzig B2: de weken schuiven mee. Balken volgen start en einde.</Data></Cell></Row>`,
  );

  rows.push(
    `<Row ss:Height="20">${heads.map((h) => `<Cell ss:StyleID="Head"><Data ss:Type="String">${esc(h)}</Data></Cell>`).join("")}${Array.from({ length: WEEKS }, (_, w) => `<Cell ss:StyleID="WeekHead"><Data ss:Type="String">W${w + 1}</Data></Cell>`).join("")}</Row>`,
  );

  const dateCells = Array.from({ length: 10 }, () => `<Cell ss:StyleID="Head"/>`);
  for (let w = 0; w < WEEKS; w++) {
    const formula = w === 0 ? "=$B$2" : `=$B$2+${w * 7}`;
    dateCells.push(
      `<Cell ss:StyleID="WeekDate" ss:Formula="${formula}"><Data ss:Type="DateTime">${start}T00:00:00.000</Data></Cell>`,
    );
  }
  rows.push(`<Row ss:Height="18">${dateCells.join("")}</Row>`);

  const total = SAMPLES.length + EMPTY_ROWS;
  for (let i = 0; i < total; i++) {
    const r = 5 + i;
    const cells: string[] = [];
    const sample = SAMPLES[i];
    if (sample) {
      const [id, wbs, name, type, owner, d0, d1] = sample;
      cells.push(`<Cell ss:StyleID="Input"><Data ss:Type="String">${esc(id)}</Data></Cell>`);
      cells.push(`<Cell ss:StyleID="Input"><Data ss:Type="String">${esc(wbs)}</Data></Cell>`);
      cells.push(`<Cell ss:StyleID="Input"><Data ss:Type="String">${esc(name)}</Data></Cell>`);
      cells.push(`<Cell ss:StyleID="Input"><Data ss:Type="String">${esc(type)}</Data></Cell>`);
      cells.push(`<Cell ss:StyleID="Input"><Data ss:Type="String">${esc(owner)}</Data></Cell>`);
      cells.push(
        `<Cell ss:StyleID="InputDate" ss:Formula="=$B$2+${d0}"><Data ss:Type="DateTime">${start}T00:00:00.000</Data></Cell>`,
      );
      cells.push(
        `<Cell ss:StyleID="InputDate" ss:Formula="=$B$2+${d1}"><Data ss:Type="DateTime">${start}T00:00:00.000</Data></Cell>`,
      );
      cells.push(
        `<Cell ss:StyleID="Calc" ss:Formula="=IF(OR(F${r}="",G${r}=""),"",G${r}-F${r}+1)"><Data ss:Type="Number">${d1 - d0 + 1}</Data></Cell>`,
      );
      cells.push(`<Cell ss:StyleID="Input"><Data ss:Type="Number">0</Data></Cell>`);
      cells.push(`<Cell ss:StyleID="Input"><Data ss:Type="String">Gepland</Data></Cell>`);
    } else {
      for (let n = 0; n < 5; n++) cells.push(`<Cell ss:StyleID="Input"/>`);
      cells.push(`<Cell ss:StyleID="InputDate"/>`);
      cells.push(`<Cell ss:StyleID="InputDate"/>`);
      cells.push(
        `<Cell ss:StyleID="Calc" ss:Formula="=IF(OR(F${r}="",G${r}=""),"",G${r}-F${r}+1)"/>`,
      );
      cells.push(`<Cell ss:StyleID="Input"/>`);
      cells.push(`<Cell ss:StyleID="Input"/>`);
    }
    for (let w = 0; w < WEEKS; w++) {
      const col = colLetter(11 + w);
      const formula = `=IF(OR($F${r}="",$G${r}=""),"",IF(AND(${col}$4<=$G${r},${col}$4+6>=$F${r}),IF($D${r}="Mijlpaal","◆","█"),""))`;
      cells.push(`<Cell ss:StyleID="Bar" ss:Formula="${formula}"/>`);
    }
    rows.push(`<Row ss:Height="18">${cells.join("")}</Row>`);
  }

  rows.push(
    `<Row><Cell ss:MergeAcross="14" ss:StyleID="Hint"><Data ss:Type="String">W1–W${WEEKS} zijn weken vanaf B2. Een balk verschijnt als die week overlapt met start–einde. Mijlpaal = ◆.</Data></Cell></Row>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>Gantt-planning</Title></DocumentProperties>
<Styles>
  <Style ss:ID="Default"><Alignment ss:Vertical="Center"/><Font ss:FontName="Calibri" ss:Size="11" ss:Color="#111827"/></Style>
  <Style ss:ID="Title"><Font ss:FontName="Calibri" ss:Size="18" ss:Bold="1" ss:Color="#1D4ED8"/></Style>
  <Style ss:ID="Hint"><Font ss:FontName="Calibri" ss:Size="10" ss:Italic="1" ss:Color="#6B7280"/></Style>
  <Style ss:ID="Label"><Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
  <Style ss:ID="Input"><Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/></Style>
  <Style ss:ID="InputDate" ss:Parent="Input"><NumberFormat ss:Format="yyyy-mm-dd"/></Style>
  <Style ss:ID="Head"><Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1D4ED8" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:WrapText="1"/></Style>
  <Style ss:ID="WeekHead"><Font ss:FontName="Calibri" ss:Size="8" ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1E40AF" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
  <Style ss:ID="WeekDate"><Font ss:FontName="Calibri" ss:Size="8" ss:Color="#1E3A8A"/><Interior ss:Color="#DBEAFE" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/><NumberFormat ss:Format="d-mmm"/></Style>
  <Style ss:ID="Calc"><Alignment ss:Horizontal="Center"/></Style>
  <Style ss:ID="Bar"><Font ss:FontName="Calibri" ss:Size="8" ss:Color="#1D4ED8"/><Alignment ss:Horizontal="Center"/></Style>
</Styles>
<Worksheet ss:Name="Gantt">
<Table ss:ExpandedColumnCount="${10 + WEEKS}" x:FullColumns="1" x:FullRows="1">
<Column ss:Width="36"/><Column ss:Width="40"/><Column ss:Width="150"/><Column ss:Width="76"/><Column ss:Width="72"/><Column ss:Width="72"/><Column ss:Width="72"/><Column ss:Width="52"/><Column ss:Width="48"/><Column ss:Width="64"/>
${Array.from({ length: WEEKS }, () => `<Column ss:Width="22"/>`).join("")}
${rows.join("")}
</Table>
<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
  <FreezePanes/><FrozenNoSplit/>
  <SplitHorizontal>4</SplitHorizontal><TopRowBottomPane>4</TopRowBottomPane>
  <SplitVertical>7</SplitVertical><LeftColumnRightPane>7</LeftColumnRightPane>
  <PageSetup><Layout x:Orientation="Landscape"/></PageSetup>
</WorksheetOptions>
</Worksheet>
<Worksheet ss:Name="Gebruik">
<Table ss:ExpandedColumnCount="1">
<Column ss:Width="640"/>
<Row ss:Height="24"><Cell ss:StyleID="Title"><Data ss:Type="String">Hoe je deze Gantt gebruikt</Data></Cell></Row>
<Row><Cell ss:StyleID="Hint"><Data ss:Type="String">1. Zet in Gantt!B2 de maandag waarop het project begint.</Data></Cell></Row>
<Row><Cell ss:StyleID="Hint"><Data ss:Type="String">2. Vul per regel activiteit, type (Activiteit of Mijlpaal), eigenaar, start en einde.</Data></Cell></Row>
<Row><Cell ss:StyleID="Hint"><Data ss:Type="String">3. Duur wordt berekend. De balk verschijnt als de week overlapt met start–einde.</Data></Cell></Row>
<Row><Cell ss:StyleID="Hint"><Data ss:Type="String">4. Overschrijf de voorbeelden of gebruik de lege rijen.</Data></Cell></Row>
<Row><Cell ss:StyleID="Hint"><Data ss:Type="String">Week-Gantt voor sturing, geen vervanging van MS Project.</Data></Cell></Row>
</Table>
</Worksheet>
</Workbook>`;
}

export function downloadGantt(projectName = "") {
  const xml = buildGanttWorkbook(projectName);
  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gantt.xls";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
