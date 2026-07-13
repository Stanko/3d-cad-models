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
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";

const root = dirname(fileURLToPath(import.meta.url));
const svgDirectory = join(root, "public", "svg");
const modelsFile = join(root, "public", "models.json");
const replicad = join(root, "node_modules", ".bin", "replicad");
const run = promisify(execFile);

const sentenceCase = (value) => {
  const sentence = value.replace(/[-_]+/g, " ").trim().toLowerCase();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

const jsdocDescription = (source) => {
  const match = source.match(/^\uFEFF?\/\*\*([\s\S]*?)\*\//);
  if (!match) return undefined;

  return match[1]
    .split("\n")
    .map((line) => line.replace(/^\s*\* ?/, ""))
    .join("\n")
    .trim();
};

const directories = (await readdir(root, { withFileTypes: true }))
  .filter(
    (entry) =>
      entry.isDirectory() &&
      !entry.name.startsWith(".") &&
      entry.name !== "node_modules" &&
      entry.name !== "public",
  )
  .sort((a, b) => a.name.localeCompare(b.name));

await rm(svgDirectory, { recursive: true, force: true });
await mkdir(svgDirectory, { recursive: true });

const temporaryDirectory = await mkdtemp(join(tmpdir(), "replicad-generator-"));
const groups = [];

try {
  const start = Date.now();

  for (const directory of directories) {
    const groupName = sentenceCase(directory.name);
    console.log(groupName);
    const directoryPath = join(root, directory.name);
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

      await run(
        replicad,
        ["--projection", wrapperPath, join(svgDirectory, svgName)],
        { cwd: root, maxBuffer: 10 * 1024 * 1024 },
      );
      console.log(`- ${svgName}`);
      await access(join(svgDirectory, svgName));

      const description = jsdocDescription(source);
      const model = {
        name: sentenceCase(fileStem),
      };

      if (description) model.description = description;
      model.svg = `/public/svg/${svgName}`;
      model.jsfile = `/${relative(root, filePath).split(sep).join("/")}`;
      models.push(model);
    }

    groups.push({
      name: groupName,
      models,
    });
  }

  await writeFile(modelsFile, `${JSON.stringify(groups, null, 2)}\n`);
  const end = Date.now();
  console.log(`Done in ${end - start}ms`);
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
