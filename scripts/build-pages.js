#!/usr/bin/env node
/**
 * Inject shared chrome (header, footer, skip link, theme-color) into every
 * public HTML page. Output is the same directory tree GitHub Pages serves.
 *
 *   node scripts/build-pages.js
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PARTIALS = path.join(ROOT, "partials");

const headerTpl = fs.readFileSync(path.join(PARTIALS, "header.html"), "utf8").trimEnd();
const footerTpl = fs.readFileSync(path.join(PARTIALS, "footer.html"), "utf8").trimEnd();
const skipTpl = fs.readFileSync(path.join(PARTIALS, "skip.html"), "utf8").trimEnd();
const redirectTpl = fs.readFileSync(path.join(PARTIALS, "redirect.html"), "utf8");

const ARIA = ' aria-current="page"';

function navCurrent(relPosix) {
  if (relPosix === "404.html") return null;
  if (relPosix.startsWith("over-mij/")) return "over-mij";
  if (relPosix.startsWith("doe/")) return "doe";
  if (relPosix.startsWith("denk/toolkit/")) return "toolkit";
  if (relPosix.startsWith("denk/")) return "denk";
  return null;
}

function renderHeader(current) {
  return headerTpl
    .replace("{{ARIA_OVER}}", current === "over-mij" ? ARIA : "")
    .replace("{{ARIA_DOE}}", current === "doe" ? ARIA : "")
    .replace("{{ARIA_TOOLKIT}}", current === "toolkit" ? ARIA : "")
    .replace("{{ARIA_DENK}}", current === "denk" ? ARIA : "");
}

function isRedirectDir(relPosix) {
  return relPosix.startsWith("weet/") || relPosix.startsWith("kennis/");
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "partials" || entry.name === "scripts" || entry.name === ".github") continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, acc);
    else acc.push(abs);
  }
  return acc;
}

function rewriteWeetUrls(html) {
  return html
    .replaceAll("https://damianvink.nl/weet/", "https://damianvink.nl/denk/")
    .replaceAll('href="/weet/', 'href="/denk/')
    .replaceAll("href=\"/weet/", "href=\"/denk/")
    .replaceAll("/weet/toolkit/", "/denk/toolkit/")
    .replaceAll("/weet/blog/", "/denk/blog/")
    .replaceAll('href="/weet/"', 'href="/denk/"')
    .replaceAll("https://damianvink.nl/weet\"", "https://damianvink.nl/denk\"")
    .replaceAll("https://damianvink.nl/weet<", "https://damianvink.nl/denk<");
}

function ensureThemeColor(html) {
  html = html.replace(/\s*<meta name="theme-color"[^>]*>/g, "");
  const tags =
    '<meta name="theme-color" content="#0e1014" media="(prefers-color-scheme: dark)">\n' +
    '<meta name="theme-color" content="#f6f4ee" media="(prefers-color-scheme: light)">';
  if (/<meta name="viewport"[^>]*>/.test(html)) {
    return html.replace(/<meta name="viewport"[^>]*>/, (m) => `${m}\n${tags}`);
  }
  return html.replace(/<head>/, `<head>\n${tags}`);
}

function ensureSkip(html) {
  if (html.includes('class="skip-link"')) return html;
  return html.replace(/<body[^>]*>/, (m) => `${m}\n${skipTpl}`);
}

function ensureMainId(html) {
  return html.replace(/<main\b([^>]*)>/, (full, attrs) => {
    if (/\sid\s*=/.test(attrs)) return full;
    return `<main id="inhoud"${attrs}>`;
  });
}

function replaceChrome(html, current) {
  const header = renderHeader(current);
  const footer = footerTpl;
  if (/<!-- CHROME:header -->[\s\S]*?<!-- \/CHROME:header -->/.test(html)) {
    html = html.replace(/<!-- CHROME:header -->[\s\S]*?<!-- \/CHROME:header -->/, header);
  } else if (/<header[\s\S]*?<\/header>/.test(html)) {
    html = html.replace(/<header[\s\S]*?<\/header>/, header);
  } else {
    html = html.replace(/<body[^>]*>/, (m) => `${m}\n${header}`);
  }
  if (/<!-- CHROME:footer -->[\s\S]*?<!-- \/CHROME:footer -->/.test(html)) {
    html = html.replace(/<!-- CHROME:footer -->[\s\S]*?<!-- \/CHROME:footer -->/, footer);
  } else if (/<footer[\s\S]*?<\/footer>/.test(html)) {
    html = html.replace(/<footer[\s\S]*?<\/footer>/, footer);
  } else {
    html = html.replace(/<\/body>/, `${footer}\n</body>`);
  }
  return html;
}

function writeRedirect(relDir, destPath, label) {
  const destUrl = `https://damianvink.nl${destPath}`;
  const html = redirectTpl
    .replaceAll("{{CANONICAL}}", destUrl)
    .replaceAll("{{HREF}}", destPath)
    .replaceAll("{{LABEL}}", label);
  const dir = path.join(ROOT, relDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

const REDIRECTS = [
  ["weet", "/denk/", "Wat ik denk"],
  ["weet/toolkit", "/denk/toolkit/", "Engineering toolkit"],
  ["weet/toolkit/passingen", "/denk/toolkit/passingen/", "Passingen (ISO 286)"],
  ["weet/toolkit/spiebaan-toleranties", "/denk/toolkit/spiebaan-toleranties/", "Spiebaan-toleranties (DIN 6885)"],
  ["weet/toolkit/lagerpassingen", "/denk/toolkit/lagerpassingen/", "Lagerpassingen"],
  ["weet/toolkit/o-ringgroef", "/denk/toolkit/o-ringgroef/", "O-ringgroef"],
  ["weet/toolkit/bronnen", "/denk/toolkit/bronnen/", "CAD-bibliotheken"],
  ["weet/blog", "/denk/blog/", "Blog"],
  ["kennis", "/denk/", "Wat ik denk"],
  ["kennis/toolkit", "/denk/toolkit/", "Engineering toolkit"],
  ["kennis/toolkit/passingen", "/denk/toolkit/passingen/", "Passingen (ISO 286)"],
  ["kennis/toolkit/spiebaan-toleranties", "/denk/toolkit/spiebaan-toleranties/", "Spiebaan-toleranties (DIN 6885)"],
  ["kennis/toolkit/lagerpassingen", "/denk/toolkit/lagerpassingen/", "Lagerpassingen"],
  ["kennis/toolkit/o-ringgroef", "/denk/toolkit/o-ringgroef/", "O-ringgroef"],
  ["kennis/toolkit/bronnen", "/denk/toolkit/bronnen/", "CAD-bibliotheken"],
  ["kennis/blog", "/denk/blog/", "Blog"],
];

function processPage(abs) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (!rel.endsWith(".html")) return;
  if (isRedirectDir(rel)) return;
  if (rel.startsWith("partials/")) return;

  let html = fs.readFileSync(abs, "utf8");
  html = rewriteWeetUrls(html);
  html = ensureThemeColor(html);
  html = ensureSkip(html);
  html = ensureMainId(html);
  html = replaceChrome(html, navCurrent(rel));
  fs.writeFileSync(abs, html);
  return rel;
}

const processed = [];
for (const file of walk(ROOT)) {
  const rel = processPage(file);
  if (rel) processed.push(rel);
}

for (const [dir, dest, label] of REDIRECTS) {
  writeRedirect(dir, dest, label);
}

console.log(`Chrome injected in ${processed.length} pages`);
console.log(`Redirects written: ${REDIRECTS.length}`);
