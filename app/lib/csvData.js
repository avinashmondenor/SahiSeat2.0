import fs from "fs";
import path from "path";

// Robust CSV Line parser that handles commas inside quotes and escaped quotes
export function parseCsvLine(line) {
  const result = [];
  let inQuotes = false;
  let field = "";
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (i + 1 < line.length && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(field.trim());
      field = "";
    } else {
      field += char;
    }
  }
  result.push(field.trim());
  return result;
}

// Classify institute based on name
export function getInstituteType(instName) {
  const name = (instName || "").toLowerCase();
  if (name.includes("national institute of technology") || name.includes("nit") || name.includes("shibpur") || name.includes("iiest")) {
    return "NIT";
  }
  if (name.includes("indian institute of information technology") || name.includes("iiit")) {
    return "IIIT";
  }
  if (
    name.includes("school of planning and architecture") || 
    name.includes("spa") || 
    name.includes("government") || 
    name.includes("state") ||
    name.includes("foundry") ||
    name.includes("manufacturing") ||
    name.includes("carpet") ||
    name.includes("infrastructure") ||
    name.includes("niftem") ||
    name.includes("ghani khan") ||
    name.includes("university") ||
    name.includes("college") ||
    name.includes("vishwavidyalaya") ||
    name.includes("gurukula") ||
    name.includes("institute")
  ) {
    return "GFTI";
  }
  return "Other";
}

// Get the NIT state from the institute name
export function getNitState(nitName) {
  const name = (nitName || "").toLowerCase();
  
  if (name.includes("jalandhar")) return "Punjab";
  if (name.includes("shibpur") || name.includes("durgapur")) return "West Bengal";
  if (name.includes("jaipur")) return "Rajasthan";
  if (name.includes("bhopal")) return "Madhya Pradesh";
  if (name.includes("allahabad")) return "Uttar Pradesh";
  if (name.includes("agartala")) return "Tripura";
  if (name.includes("arunachal")) return "Arunachal Pradesh";
  if (name.includes("calicut")) return "Kerala";
  if (name.includes("delhi")) return "Delhi";
  if (name.includes("goa")) return "Goa";
  if (name.includes("hamirpur")) return "Himachal Pradesh";
  if (name.includes("surathkal") || name.includes("karnataka")) return "Karnataka";
  if (name.includes("meghalaya")) return "Meghalaya";
  if (name.includes("nagaland")) return "Nagaland";
  if (name.includes("patna")) return "Bihar";
  if (name.includes("puducherry")) return "Puducherry";
  if (name.includes("raipur")) return "Chhattisgarh";
  if (name.includes("sikkim")) return "Sikkim";
  if (name.includes("andhra pradesh")) return "Andhra Pradesh";
  if (name.includes("jamshedpur")) return "Jharkhand";
  if (name.includes("kurukshetra")) return "Haryana";
  if (name.includes("manipur")) return "Manipur";
  if (name.includes("mizoram")) return "Mizoram";
  if (name.includes("rourkela")) return "Odisha";
  if (name.includes("silchar")) return "Assam";
  if (name.includes("srinagar")) return "Jammu & Kashmir";
  if (name.includes("tiruchirappalli")) return "Tamil Nadu";
  if (name.includes("uttarakhand")) return "Uttarakhand";
  if (name.includes("warangal")) return "Telangana";
  if (name.includes("surat")) return "Gujarat";
  if (name.includes("nagpur")) return "Maharashtra";
  
  return null;
}

// Dynamically loads all CSV records, bypasses caching to ensure freshness
export function loadAllCsvRecords() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    return [];
  }

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".csv"));

  const allRecords = [];

  for (const file of files) {
    // Extract round number from filename (e.g. round1_2026.csv -> 1)
    const roundMatch = file.match(/round(\d+)/i);
    const round = roundMatch ? parseInt(roundMatch[1], 10) : null;

    try {
      let content = fs.readFileSync(path.join(dataDir, file), "utf-8");
      
      // Strip UTF-8 BOM if present
      if (content.startsWith("\uFEFF")) {
        content = content.slice(1);
      }

      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      // Lowercase and trim headers to prevent casing issues
      const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        const record = { round, sourceFile: file };
        
        headers.forEach((header, idx) => {
          if (header) {
            record[header] = values[idx] || "";
          }
        });

        // Normalize fields using normalized lowercase keys
        record.institute = record["institute"] || "";
        record.program = record["academic program name"] || record["program"] || "";
        record.quota = record["quota"] || "";
        record.seatType = record["seat type"] || "";
        record.gender = record["gender"] || "";

        const op = Number(record["opening rank"]);
        record.openingRank = !isNaN(op) ? op : null;

        const cl = Number(record["closing rank"]);
        record.closingRank = !isNaN(cl) ? cl : null;

        allRecords.push(record);
      }
    } catch (err) {
      console.error(`Error reading/parsing CSV file ${file}:`, err);
    }
  }

  return allRecords;
}

export function getCsvStats() {
  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    return { fileCount: 0, totalRows: 0, files: [] };
  }

  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith(".csv"));

  let totalRows = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(
        path.join(dataDir, file),
        "utf-8"
      );

      const rows = content
        .split("\n")
        .filter((line) => line.trim() !== "");

      totalRows += Math.max(rows.length - 1, 0);
    } catch (err) {
      console.error(`Error calculating stats for file ${file}:`, err);
    }
  }

  return {
    fileCount: files.length,
    totalRows,
    files,
  };
}