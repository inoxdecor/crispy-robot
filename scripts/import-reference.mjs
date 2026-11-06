import fs from "node:fs";
const source = process.argv[2];
if (!source) throw new Error("Pass the reference HTML path.");
let html = fs.readFileSync(source, "utf8");
const styles = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .join("\n");
fs.mkdirSync("public/reference", { recursive: true });
fs.mkdirSync("site", { recursive: true });
fs.writeFileSync("public/reference/design.css", styles);
if (!fs.existsSync("public/reference/runtime.js") || process.argv.includes("--replace-runtime")) {
  fs.writeFileSync("public/reference/runtime.js", scripts.slice(0, scripts.indexOf("/* ================= form:")));
} else {
  console.log("Retained enhanced runtime, animation optimizations and prerender guards. Use --replace-runtime only after reviewing these changes.");
}
html = html
  .replace(/<link rel="preconnect"[^>]+>\s*/g, "")
  .replace(/<link href="https:\/\/fonts.googleapis.com[^>]+>/, "");
html = html.replace(
  /<style>[\s\S]*?<\/style>/,
  '<link rel="stylesheet" href="/reference/fonts.css"><link rel="stylesheet" href="/reference/design.css"><link rel="stylesheet" href="/reference/alignment.css">',
);
html = html.replace(
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "/vendor/three-r128.min.js",
);
html = html.replace(
  /<script>[\s\S]*?<\/script>/g,
  '<script src="/reference/runtime.js"></script><script src="/reference/accessibility.js"></script><script src="/reference/projects.js"></script><script src="/reference/enquiry.js"></script>',
);
// The supplied navigation names this section, but the original file omits its ID.
html = html.replace(
  '<section class="dark"><div class="wrap">\n<div class="sl rv"><b>09</b>',
  '<section class="dark" id="plans"><div class="wrap">\n<div class="sl rv"><b>09</b>',
);
// Also support Windows line endings in the supplied document.
html = html.replace(
  /<section class="dark"><div class="wrap">\r?\n(<div class="sl rv"><b>09<\/b>)/,
  '<section class="dark" id="plans"><div class="wrap">\n$1',
);
html = html.replace(
  '<button class="btn" type="submit">',
  '<label class="consent"><input type="checkbox" name="consent" required><span>I agree to the <a href="/privacy">privacy policy</a> and to being contacted about my enquiry.</span></label><span class="err" data-e="consent"></span><button class="btn" type="submit">',
);
html = html.replace(
  '<form id="f" novalidate>',
  '<form id="f" novalidate><noscript><p>Please enable JavaScript to submit this form, or <a href="mailto:thebenzzcreationsofficial@gmail.com">email the studio directly</a>.</p></noscript>',
);
html = html.replace(
  '<p class="status" id="st" role="status">',
  '<p class="status" id="st" role="status" aria-live="polite" tabindex="-1">',
);
html = html.replace(
  "</head>",
  '<link rel="icon" href="/icon.svg"><link rel="canonical" href="https://www.thebenzzcreations.com/"><meta property="og:title" content="TheBenzzCreations — Websites that make clients say yes"><meta property="og:description" content="Custom-coded websites, mobile apps, software and AI integration. New Delhi, India."><meta property="og:image" content="https://www.thebenzzcreations.com/opengraph-image"><meta name="theme-color" content="#141518"></head>',
);
html = html.replaceAll('<i>B</i>', '<i aria-hidden="true">B</i>');
html = html.replace(' aria-label="TheBenzzCreations home"', '');
fs.writeFileSync("site/index.html", html);
