// To update the index.html file when running the project locally, run the following code in the terminal (OUTPUT) while opened in VS Code terminal:
// node build-links.js


import fs from "fs";
import path from "path";

const basePath = path.resolve(process.cwd(), "tools");
const outputPath = path.resolve(process.cwd(), "index.html");

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildCard = (dir, subDir) => {
  const label = escapeHtml((subDir ? subDir : dir).replaceAll("-", " "));
  const previewUrl = `./tools/${dir}${subDir ? `/${subDir}` : ""}/index.html`;
  const toolUrl = `./template.html?tool=${encodeURIComponent(subDir ? `${dir}/${subDir}` : dir)}`;
  return `
      <a class="tool-card" href="${toolUrl}">
        <span class="tool-card__preview" aria-hidden="true">
          <iframe
            src="${previewUrl}"
            title="${label} preview"
            loading="lazy"
            tabindex="-1"
          ></iframe>
        </span>
        <span class="tool-card__meta">
          <span class="tool-card__title">${label}</span>
          <span class="tool-card__action">Open tool</span>
        </span>
      </a>`;
};

const allToolPaths = [];
const groupLinks = [];
const flatLinks = [];

dirs.forEach((dir) => {
  const dirPath = path.join(basePath, dir);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const hasIndexHtml = entries.some(e => e.isFile() && e.name === "index.html");
  const subDirs = entries.filter(d => d.isDirectory()).map(d => d.name);

  if (!hasIndexHtml && subDirs.length > 0) {
    const groupLabel = escapeHtml(dir.replaceAll("-", " "));
    const subCards = subDirs.map(subDir => {
      allToolPaths.push(`${dir}/${subDir}`);
      return buildCard(dir, subDir);
    }).join("\n");
    groupLinks.push(`
      <div class="tools-group">
        <span class="tools-group__label">${groupLabel}</span>
        ${subCards}
      </div>`);
  } else {
    allToolPaths.push(dir);
    flatLinks.push(buildCard(dir));
  }
});

const links = [...groupLinks, ...flatLinks].join("\n");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tools</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<div class="container main-container">
<h1 class="title">Tools</h1>
<div class="buttons">
${links}
</div>
</div>
</body>
</html>`;

fs.writeFileSync(outputPath, html);

const toolsJsonPath = path.resolve(process.cwd(), "tools.json");
fs.writeFileSync(toolsJsonPath, JSON.stringify(allToolPaths, null, 2));
console.log("Generated index.html and tools.json with:", allToolPaths);

/*
import fs from "fs";
import path from "path";

const basePath = path.resolve(process.cwd(), "tools");
const outputPath = path.resolve(process.cwd(), "index.html");

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildCard = (dir, subDir) => {
  const label = escapeHtml((subDir ? subDir : dir).replaceAll("-", " "));
  const previewUrl = `./tools/${dir}${subDir ? `/${subDir}` : ""}/index.html`;
  const toolUrl = `./template.html?tool=${encodeURIComponent(subDir ? `${dir}/${subDir}` : dir)}`;
  return `
      <a class="tool-card" href="${toolUrl}">
        <span class="tool-card__preview" aria-hidden="true">
          <iframe
            src="${previewUrl}"
            title="${label} preview"
            loading="lazy"
            tabindex="-1"
          ></iframe>
        </span>
        <span class="tool-card__meta">
          <span class="tool-card__title">${label}</span>
          <span class="tool-card__action">Open tool</span>
        </span>
      </a>`;
};

const allToolPaths = [];

const links = dirs
  .map((dir) => {
    const dirPath = path.join(basePath, dir);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const hasIndexHtml = entries.some(e => e.isFile() && e.name === "index.html");
    const subDirs = entries.filter(d => d.isDirectory()).map(d => d.name);

    if (!hasIndexHtml && subDirs.length > 0) {
      const groupLabel = escapeHtml(dir.replaceAll("-", " "));
      const subCards = subDirs.map(subDir => {
        allToolPaths.push(`${dir}/${subDir}`);
        return buildCard(dir, subDir);
      }).join("\n");
      return `
      <div class="tools-group">
        <span class="tools-group__label">${groupLabel}</span>
        ${subCards}
      </div>`;
    }

    allToolPaths.push(dir);
    return buildCard(dir);
  })
  .join("\n");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tools</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<div class="container main-container">
<h1 class="title">Tools</h1>
<div class="buttons">
${links}
</div>
</div>
</body>
</html>`;

fs.writeFileSync(outputPath, html);

const toolsJsonPath = path.resolve(process.cwd(), "tools.json");
fs.writeFileSync(toolsJsonPath, JSON.stringify(allToolPaths, null, 2));
console.log("Generated index.html and tools.json with:", allToolPaths);
*/

/*
import fs from "fs";
import path from "path";

const basePath = path.resolve(process.cwd(), "tools");
const outputPath = path.resolve(process.cwd(), "index.html");

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildCard = (dir, subDir) => {
  const label = escapeHtml((subDir ? subDir : dir).replaceAll("-", " "));
  const previewUrl = `./tools/${dir}${subDir ? `/${subDir}` : ""}/index.html`;
  const toolUrl = `./template.html?tool=${encodeURIComponent(subDir ? `${dir}/${subDir}` : dir)}`;
  return `
      <a class="tool-card" href="${toolUrl}">
        <span class="tool-card__preview" aria-hidden="true">
          <iframe
            src="${previewUrl}"
            title="${label} preview"
            loading="lazy"
            tabindex="-1"
          ></iframe>
        </span>
        <span class="tool-card__meta">
          <span class="tool-card__title">${label}</span>
          <span class="tool-card__action">Open tool</span>
        </span>
      </a>`;
};

const links = dirs
  .map((dir) => {
    const dirPath = path.join(basePath, dir);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const hasIndexHtml = entries.some(e => e.isFile() && e.name === "index.html");
    const subDirs = entries.filter(d => d.isDirectory()).map(d => d.name);

    if (!hasIndexHtml && subDirs.length > 0) {
      const groupLabel = escapeHtml(dir.replaceAll("-", " "));
      const subCards = subDirs.map(subDir => buildCard(dir, subDir)).join("\n");
      return `
      <div class="tools-group">
        <span class="tools-group__label">${groupLabel}</span>
        ${subCards}
      </div>`;
    }

    return buildCard(dir);
  })
  .join("\n");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tools</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<div class="container main-container">
<h1 class="title">Tools</h1>
<div class="buttons">
${links}
</div>
</div>
</body>
</html>`;

fs.writeFileSync(outputPath, html);

const toolsJsonPath = path.resolve(process.cwd(), "tools.json");
fs.writeFileSync(toolsJsonPath, JSON.stringify(dirs, null, 2));
console.log("Generated index.html and tools.json with:", dirs);
*/







/*
import fs from "fs";
import path from "path";

const basePath = path.resolve(process.cwd(), "tools");
const outputPath = path.resolve(process.cwd(), "index.html");

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const links = dirs
  .map((dir) => {
    const label = escapeHtml(dir.replaceAll("-", " "));
    const previewUrl = `./tools/${dir}/index.html`;
    const toolUrl = `./template.html?tool=${encodeURIComponent(dir)}`;

    return `
      <a class="tool-card" href="${toolUrl}">
        <span class="tool-card__preview" aria-hidden="true">
          <iframe
            src="${previewUrl}"
            title="${label} preview"
            loading="lazy"
            tabindex="-1"
          ></iframe>
        </span>
        <span class="tool-card__meta">
          <span class="tool-card__title">${label}</span>
          <span class="tool-card__action">Open tool</span>
        </span>
      </a>`;
  })
  .join("\n");


const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tools</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<div class="container main-container">
<h1 class="title">Tools</h1>

<div class="buttons">
${links}
</div>
</div>

</body>
</html>`;

fs.writeFileSync(outputPath, html);

const toolsJsonPath = path.resolve(process.cwd(), "tools.json");
fs.writeFileSync(toolsJsonPath, JSON.stringify(dirs, null, 2));

console.log("Generated index.html and tools.json with:", dirs);
*/
