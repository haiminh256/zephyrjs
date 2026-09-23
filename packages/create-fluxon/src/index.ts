import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prompts from "prompts";
import { green, cyan, bold, red } from "kolorist";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function init() {
  console.log(`\n🚀 ${bold(cyan("Welcome to FluxonJS!"))}\n`);

  let result: prompts.Answers<"projectName">;

  try {
    result = await prompts(
      [
        {
          type: "text",
          name: "projectName",
          message: "Project name:",
          initial: "fluxon-app",
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (cancelled: any) {
    console.log(cancelled.message);
    return;
  }

  const { projectName } = result;
  const targetDir = path.join(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.log(red(`\n✖ Directory "${projectName}" already exists.`));
    return;
  }

  const templateDir = path.resolve(__dirname, "../template-vanilla-ts");

  copyDir(templateDir, targetDir);

  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  pkg.name = projectName;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log(`\n${green("✔")} Project created in ${bold(targetDir)}`);
  console.log(`\nNext steps:\n`);
  console.log(`  cd ${projectName}`);
  console.log(`  pnpm install  ${cyan("(or npm install)")}`);
  console.log(`  pnpm dev      ${cyan("(or npm run dev)")}\n`);
}

function copyDir(srcDir: string, destDir: string) {
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