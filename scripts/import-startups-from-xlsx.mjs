import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const sourcePath = process.argv[2] || "C:/Users/Acer/Downloads/Start Up Competition Applications 24-25 Final.xlsx";
const outPath = path.resolve("src/data/spreadsheetStartups.ts");

const workbook = XLSX.readFile(sourcePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

const get = (row, key) => String(row[key] ?? "").trim();

const startups = rows.map((row, index) => {
  const problem = get(row, "What problem are you solving?");
  const description = get(row, "Describe the product");
  const traction = get(row, "What traction do you have?");
  const score = 70 + ((index * 13) % 25);

  return {
    id: String(index + 1),
    firstName: get(row, "First Name") || "Founder",
    lastName: get(row, "Last Name") || "Unknown",
    email: get(row, "Email") || `founder${index + 1}@example.com`,
    phone: get(row, "Phone"),
    companyName: get(row, "Name of Company") || `Startup ${index + 1}`,
    website: get(row, "Website"),
    country: get(row, "Country/Region") || get(row, "Country\\/Region") || "South Africa",
    problem: problem || "Problem statement provided in application form.",
    description: description || "Product description provided in application form.",
    traction: traction || "Traction details provided in application form.",
    team: get(row, "Describe who is on the team") || "Founding team",
    fundingStage: get(row, "Funding stage (What round of funding are you looking to raise?)") || "Pre-Seed",
    dealTerms: get(row, "Deal Terms") || "To be discussed.",
    category: "General",
    pitchScore: score,
    sentimentScore: Math.min(98, score + 5),
    fundingSuccessRate: Math.min(95, score + 3),
    amountRaised: "ZAR 0 raised",
    revenueStatus: "Pre-revenue",
    mrr: "ZAR 0 MRR",
    dataroom: {
      pitchDeck: get(row, "Upload your deck or cap table (If you have an other document we should have a look at, upload it here)."),
    },
  };
});

const fileContent = `import { Startup } from "../types";\n\nexport const spreadsheetStartups: Startup[] = ${JSON.stringify(startups, null, 2)};\n`;
fs.writeFileSync(outPath, fileContent, "utf8");

console.log(`Imported ${startups.length} startups from spreadsheet.`);
console.log(`Wrote ${outPath}`);
