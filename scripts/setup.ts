import * as cp from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

let rootDir = path.resolve(import.meta.dirname, "..");

async function setName(name: string, githubUsername: string) {
  console.log("Updating package.json", name);
  let pkg = JSON.parse(
    await fs.readFile(path.join(rootDir, "package.json"), "utf-8"),
  ) as any;
  pkg.name = `@${githubUsername}/${name}`;
  pkg.repository.url = `git+https://github.com/${githubUsername}/${name}.git`;
  pkg.exports = { ".": `./dist/${name}.js` };
  await fs.writeFile("package.json", JSON.stringify(pkg, null, 2));

  console.log("Changing src/package-name.ts");
  await fs.rename(
    path.join(rootDir, "src", "package-name.ts"),
    path.join(rootDir, "src", `${name}.ts`),
  );
}

let status = cp.execSync("git status --porcelain").toString();
if (status !== "") {
  console.error(
    "Git tree is dirty. Please commit your changes before running this script.",
  );
  process.exit(1);
}

let githubUsername = process.argv[2];
let name = process.argv[3];
if (!name || !githubUsername) {
  console.error("No github username or package name given");
  console.log("Usage: pnpm setup <github username> <package name>");
  console.log("Example:");
  console.log("\t pnpm setup ryanflorence my-cool-package");
  process.exit(1);
}

await setName(name, githubUsername);
console.log(`Done!`);
