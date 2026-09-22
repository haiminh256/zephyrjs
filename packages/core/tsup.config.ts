import { defineConfig } from "tsup";
import { copyFileSync } from "fs";
import { execSync } from "child_process";

export default defineConfig({
  entry: ["src/index.ts", "src/jsx-runtime.ts", "src/jsx-dev-runtime.ts"],
  format: ["esm"],
  dts: false,
  clean: true,
  sourcemap: true,
  minify: false,
  onSuccess: async () => {
    try {
      execSync("tsc -p tsconfig.json --emitDeclarationOnly", { stdio: "inherit" });
      
      copyFileSync("src/jsx-runtime.d.ts", "dist/jsx-runtime.d.ts");
    } catch (error) {
      process.exit(1);
    }
  },
});