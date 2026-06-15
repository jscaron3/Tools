import fs from "fs";
import path from "path";

const basePath = path.resolve(process.cwd(), "tools");
const outputPath = path.resolve(process.cwd(), "index.html");

const dirs = fs.readdirSync(basePath, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);


    // const links = dirs
  // .map(dir => `<a href="./tools/${dir}/">${dir}</a>`)
  // .join("\n");
  
// const links = dirs
//   .map(dir => `<a href="./template.html?tool=${dir}">${dir.replaceAll("-", " ")}</a>`)
//   .join("\n");

  const links = dirs
  .map(dir => `<iframe src="./template.html?tool=${dir}" id="my-iframe"></iframe><a class="" href="./template.html?tool=${dir}">${dir.replaceAll("-", " ")}</a>`)
  .join("\n");

  // const links = dirs
  // .map(dir => `<a href="./template.html?tool=${dir}">${dir.replaceAll("-", " ").toUpperCase()}</a>`)
  // .join("\n");


const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tools</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<div class="container">
<h1 class="title">Tools</h1>

<div class="buttons">
${links}
</div>
</div>
<script type="text/javascript">
// Listen for the height update and resize the iframe viewport
window.addEventListener('message', (event) => {
  if (event.data.frameHeight) {
    const iframe = document.getElementById('my-iframe');
    iframe.style.height = event.data.frameHeight + 'px';
  }
});
</script>

</body>
</html>`;

fs.writeFileSync(outputPath, html);

const toolsJsonPath = path.resolve(process.cwd(), "tools.json");
fs.writeFileSync(toolsJsonPath, JSON.stringify(dirs, null, 2));

console.log("Generated index.html and tools.json with:", dirs);