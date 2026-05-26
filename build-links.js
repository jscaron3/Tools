import fs from "fs";
import path from "path";

const basePath = path.resolve(process.cwd(), "tools");
const outputPath = path.resolve(process.cwd(), "index.html");

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const links = dirs
  .map(dir => `<a href="./template.html?tool=${dir}/">${dir.replaceAll("-", " ")}</a>`)
  .join("\n");


  // const links = dirs
  // .map(dir => `<a href="./tools/${dir}/">${dir}</a>`)
  // .join("\n");

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tools</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<div class="buttons">
${links}
</div>
</body>
</html>`;

fs.writeFileSync(outputPath, html);

console.log("Generated index.html with:", dirs);