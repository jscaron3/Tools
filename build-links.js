import fs from "fs";

const basePath = "./tools";

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const links = dirs
  .map(dir => `<a href="/Tools/tools/${dir}/">${dir}</a>`)
  .join("\n");

fs.writeFileSync(
  "index.html",
  `<!doctype html>
<html>
<body>
${links}
</body>
</html>`
);

console.log("Generated links:", dirs);