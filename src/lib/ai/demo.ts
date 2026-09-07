export const modes = ["rewrite", "actions", "ideas"] as const;
export type Mode = (typeof modes)[number];
export type DemoInput = { mode: Mode; text: string; locale: "nl" | "en" };
export function validateDemoInput(input: unknown): DemoInput {
  if (!input || typeof input !== "object") throw new Error("Invalid input");
  const { mode, text, locale } = input as Record<string, unknown>;
  if (
    !modes.includes(mode as Mode) ||
    typeof text !== "string" ||
    text.trim().length < 10 ||
    text.length > 3000 ||
    !["nl", "en"].includes(locale as string)
  )
    throw new Error("Invalid input");
  return { mode: mode as Mode, text: text.trim(), locale: locale as DemoInput["locale"] };
}
export const examples = {
  nl: {
    rewrite: {
      input:
        "Hoi, de tekeningen zijn nog niet klaar want de leverancier heeft de maten niet gestuurd. We kunnen vrijdag dus niet beginnen. Kun je even bellen om af te stemmen?",
      output:
        "Beste collega,\n\nDe tekeningen zijn nog niet gereed, omdat we de benodigde maatvoering van de leverancier nog missen. Daardoor kunnen we vrijdag niet starten.\n\nKunnen we telefonisch afstemmen over de gevolgen voor de planning en de vervolgstappen?\n\nMet vriendelijke groet",
    },
    actions: {
      input:
        "Projectoverleg: de testopstelling moet vrijdag klaar zijn. Sam bestelt vandaag de sensoren. Noor controleert donderdag de bekabeling. De levertijd van de sensoren is nog onzeker. Volgend overleg: vrijdag om 09:00.",
      output:
        "DOEL\nTestopstelling gereed op vrijdag.\n\nACTIES\n• Sam — sensoren bestellen — vandaag.\n• Noor — bekabeling controleren — donderdag.\n\nRISICO\nOnzekere levertijd van de sensoren kan de oplevering vertragen.\n\nOPEN PUNT\nWie bevestigt de leverdatum? Eigenaar en deadline zijn nog niet afgesproken.\n\nVOLGEND OVERLEG\nVrijdag, 09:00. Kalenderdatum niet vermeld.",
    },
    ideas: {
      input:
        "Bedenk drie manieren om monteurs sneller de juiste werkinstructie te laten vinden. Het moet op een telefoon werken en eenvoudig te onderhouden zijn.",
      output:
        "01 / QR-CODE OP DE MACHINE\nScan een code en open direct de actuele werkinstructie.\nEerste proef: één machine, vijf instructies.\nLet op: wijs iemand aan die de links actueel houdt.\n\n02 / ZOEKEN IN GEWONE TAAL\nStel een vraag, zoals ‘Hoe vervang ik deze sensor?’ en krijg de relevante instructie met bronverwijzing.\nEerste proef: twintig goedgekeurde documenten.\nLet op: laat het systeem aangeven wanneer het antwoord ontbreekt.\n\n03 / VISUELE ONDERDELENLIJST\nTik op een onderdeel in een foto en open de instructie.\nEerste proef: één overzichtsfoto met vijf aanklikbare onderdelen.\nLet op: vernieuw de foto bij wijzigingen aan de machine.",
    },
  },
  en: {
    rewrite: {
      input:
        "Hi, the drawings aren't ready because the supplier hasn't sent the dimensions. So we can't start Friday. Can you call to discuss?",
      output:
        "Hi,\n\nThe drawings are not yet ready because we are still waiting for the supplier’s dimensions. As a result, we cannot start on Friday.\n\nCould we arrange a call to discuss the impact on the schedule and agree on next steps?\n\nKind regards",
    },
    actions: {
      input:
        "Project meeting: the test rig must be ready Friday. Sam orders the sensors today. Noor checks the wiring Thursday. Sensor delivery time is uncertain. Next meeting Friday at 09:00.",
      output:
        "GOAL\nTest rig ready by Friday.\n\nACTIONS\n• Sam — order sensors — today.\n• Noor — check wiring — Thursday.\n\nRISK\nUncertain sensor delivery could delay completion.\n\nOPEN QUESTION\nWho will confirm delivery? Owner and deadline are not agreed.\n\nNEXT MEETING\nFriday, 09:00. Calendar date not specified.",
    },
    ideas: {
      input:
        "Suggest three ways to help technicians find the right work instruction faster. It must work on a phone and be easy to maintain.",
      output:
        "01 / QR CODE ON THE MACHINE\nScan a code to open the current instruction.\nFirst trial: one machine, five instructions.\nConsider: assign an owner to maintain the links.\n\n02 / NATURAL LANGUAGE SEARCH\nAsk ‘How do I replace this sensor?’ and retrieve the relevant instruction with a source.\nFirst trial: twenty approved documents.\nConsider: make missing answers explicit.\n\n03 / VISUAL PARTS INDEX\nTap a part in a photo to open its instruction.\nFirst trial: one photo with five interactive parts.\nConsider: update the photo when the machine changes.",
    },
  },
};
