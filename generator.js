import models from "./docs/models.json" with { type: "json" };
import { fileURLToPath } from "node:url";
import { writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = join(ROOT, "docs", "index.html");
const TEMPLATE_PATH = join(ROOT, "docs", "template.html");

const generator = async () => {
  const html = [];
  models.forEach((group) => {
    html.push(`<div class="group">`);
    html.push(`<h2 class="group__name">${group.name}</h2>`);

    html.push(`<div class="group__models">`);
    group.models.forEach((model) => {
      html.push(`<div class="model">`);
      html.push(`<h3 class="model__name">${model.name}</h3>`);
      html.push(
        `<img class="model__img" src="${model.svg}" alt="${model.name}" />`,
      );
      if (model.description) {
        html.push(`<div class="model__description">${model.description}</div>`);
      }
      html.push(`<div class="model__links">`);
      html.push(`<a href="${model.url}" class="model__name">Source</a>`);
      if (!model.notEditable) {
        html.push(
          `&bull; <a href="https://studio.replicad.xyz/workbench?from-url=${model.url}" class="model__name">Edit</a>`,
        );
      }
      html.push(`</div>`);
      html.push(`</div>`);
    });
    html.push("</div>");
  });
  html.push("</div>");

  const template = await readFile(TEMPLATE_PATH, { encoding: "utf-8" });
  const content = template.replace("[GENERATED CONTENT]", html.join("\n"));
  await writeFile(INDEX_PATH, content, { encoding: "utf-8" });

  console.log("Generated index.html");
};

generator();
