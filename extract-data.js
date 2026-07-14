import { execFile } from "node:child_process";
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, sep } from "node:path";
import { describe } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const ROOT = dirname(fileURLToPath(import.meta.url));
const IGNORE_DIRS = ["node_modules", "docs", "generator"];
const SVG_DIR = join(ROOT, "docs", "svg");
const JSON_PATH = join(ROOT, "docs", "models.json");
const replicad = join(ROOT, "node_modules", ".bin", "replicad");
const run = promisify(execFile);

const sentenceCase = (value) => {
  const sentence = value.replace(/[-_]+/g, " ").trim().toLowerCase();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

const jsdocDescription = (source) => {
  const match = source.match(/^\uFEFF?\/\*\*([\s\S]*?)\*\//);
  if (!match) {
    return "";
  }

  return match[1]
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, ""))
    .filter((line) => line.trim() !== "")
    .map((line) => `<p>${line.trim()}</p>`)
    .join("\n");
};

const directories = (await readdir(ROOT, { withFileTypes: true }))
  .filter(
    (entry) =>
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      !IGNORE_DIRS.includes(entry.name),
  )
  .sort((a, b) => a.name.localeCompare(b.name));

await rm(SVG_DIR, { recursive: true, force: true });
await mkdir(SVG_DIR, { recursive: true });

const temporaryDirectory = await mkdtemp(join(tmpdir(), "replicad-generator-"));
const groups = [];

try {
  const start = Date.now();
  const renderJobs = [];

  for (const directory of directories) {
    const groupName = sentenceCase(directory.name);
    const directoryPath = join(ROOT, directory.name);
    const files = (await readdir(directoryPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (files.length === 0) continue;

    const models = [];

    for (const file of files) {
      const filePath = join(directoryPath, file.name);
      const source = await readFile(filePath, "utf8");
      const fileStem = basename(file.name, ".js");
      const svgName = `${directory.name}-${fileStem}.svg`;
      const wrapperPath = join(
        temporaryDirectory,
        `${directory.name}-${fileStem}.js`,
      );
      const modelUrl = pathToFileURL(filePath).href;

      await writeFile(
        wrapperPath,
        `import { main as modelMain, defaultParams } from ${JSON.stringify(modelUrl)};

export { defaultParams };

export const main = async (replicad, params) => {
  const result = await modelMain(replicad, params);
  const parts = Array.isArray(result) ? result : [result];
  const shapes = parts.map((part) => part.shape || part);
  return shapes.slice(1).reduce((fused, shape) => fused.fuse(shape), shapes[0]);
};
`,
      );

      renderJobs.push(async () => {
        await run(
          replicad,
          ["--projection", wrapperPath, join(SVG_DIR, svgName)],
          { cwd: ROOT, maxBuffer: 10 * 1024 * 1024 },
        );
        const svgPath = join(SVG_DIR, svgName);
        await access(svgPath);
        const svgContent = await readFile(svgPath, "utf8");
        await writeFile(
          svgPath,
          svgContent
            .replace('stroke="black"', 'stroke="white"')
            .replace('stroke-width="0.2%"', 'stroke-width="0.4%"'),
        );

        console.log(`Rendered ${svgName}`);
      });

      const model = {
        name: sentenceCase(fileStem),
        svg: `./svg/${svgName}`,
        url: `https://raw.githubusercontent.com/Stanko/3d-models/dev/${relative(ROOT, filePath).split(sep).join("/")}`,
        description: jsdocDescription(source),
      };

      models.push(model);
    }

    if (groupName === "Plotter") {
      // The only SCAD model is hardcoded
      models.push({
        name: "Axidraw Pen Holder (SCAD)",
        svg: `./img/axidraw-pen-holder.png`,
        url: `https://raw.githubusercontent.com/Stanko/3d-models/dev/plotter/axidraw-pen-holder.scad`,
        notEditable: true,
        description:
          "Pigma Micron holder for the Axidraw plotter. The only SCAD model and therefore not editable in the browser.",
      });
    }

    groups.push({
      name: groupName,
      models,
    });
  }

  await Promise.all(renderJobs.map((render) => render()));
  await writeFile(JSON_PATH, `${JSON.stringify(groups, null, 2)}\n`);
  const end = Date.now();
  console.log(`Processed ${renderJobs.length} models in ${end - start}ms`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
