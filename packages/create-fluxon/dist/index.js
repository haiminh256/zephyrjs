#!/usr/bin/env node

// src/index.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";
import { green, cyan, bold, red } from "kolorist";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function init() {
  console.log(`
\u{1F680} ${bold(cyan("Welcome to FluxonJS!"))}
`);
  let result;
  try {
    result = await prompts(
      [
        {
          type: "text",
          name: "projectName",
          message: "Project name:",
          initial: "fluxon-app"
        }
      ],
      {
        onCancel: () => {
          throw new Error(red("\u2716") + " Operation cancelled");
        }
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    return;
  }
  const { projectName } = result;
  const targetDir = path.join(process.cwd(), projectName);
  if (fs.existsSync(targetDir)) {
    console.log(red(`
\u2716 Directory "${projectName}" already exists.`));
    return;
  }
  const templateDir = path.resolve(__dirname, "../template-vanilla-ts");
  copyDir(templateDir, targetDir);
  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.name = projectName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log(`
${green("\u2714")} Project created in ${bold(targetDir)}`);
  console.log(`
Next steps:
`);
  console.log(`  cd ${projectName}`);
  console.log(`  pnpm install  ${cyan("(or npm install)")}`);
  console.log(`  pnpm dev      ${cyan("(or npm run dev)")}
`);
}
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    const stat = fs.statSync(srcFile);
    if (stat.isDirectory()) {
      copyDir(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}
init();
