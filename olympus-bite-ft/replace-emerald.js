const fs = require("fs");
const path = require("path");

const dirs = ["app", "features", "shared"];
const extRegex = /\.(ts|tsx)$/;
const replaceRegex =
  /\b(bg|text|border|ring|from|to|via)-emerald-(\d{2,3}|\w+)\b/g;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (extRegex.test(fullPath)) {
      let content = fs.readFileSync(fullPath, "utf8");
      if (content.match(replaceRegex) || content.includes("emerald")) {
        const newContent = content
          .replace(replaceRegex, "$1-primary-$2")
          .replace(/\bemerald-500\b/g, "primary-500");
        if (newContent !== content) {
          fs.writeFileSync(fullPath, newContent, "utf8");
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

for (const dir of dirs) {
  const fullDirPath = path.join(__dirname, dir);
  if (fs.existsSync(fullDirPath)) {
    walkDir(fullDirPath);
  }
}
console.log("Done!");
