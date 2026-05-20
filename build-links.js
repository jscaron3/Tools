import fs from "fs";

const basePath = "./tools";

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const links = dirs
  .map(dir => `<a href="/Tools/tools/${dir}/">${dir}</a>`)
  .join("\n");

const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tools</title>
</head>
<body>
  ${links}
</body>
</html>
`;

fs.writeFileSync("./index.html", html);