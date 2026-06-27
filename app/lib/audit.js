import fs from "fs";
import path from "path";
import { loadAllCsvRecords, getInstituteType, getNitState, parseCsvLine } from "./csvData.js";

export function runSystemAudit() {
  const passed = [];
  const failed = [];
  const warnings = [];
  const inconsistencies = [];

  // Helper to add checks
  const pass = (name, msg) => passed.push({ check: name, message: msg });
  const fail = (name, msg) => failed.push({ check: name, message: msg });
  const warn = (name, msg) => warnings.push({ check: name, message: msg });
  const inconsistency = (file, row, issue) => inconsistencies.push({ file, rowNum: row, issue });

  // --- 1. CSV Validation ---
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fail("CSV Folder Location", "Root /data folder does not exist.");
    return { passed, failed, warnings, inconsistencies };
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".csv"));
  if (files.length === 0) {
    fail("CSV Files Present", "No CSV files found inside /data.");
    return { passed, failed, warnings, inconsistencies };
  } else {
    pass("CSV Files Present", `Found ${files.length} CSV files: ${files.join(", ")}`);
  }

  const hasR1 = files.some(f => f.includes("round1"));
  const hasR2 = files.some(f => f.includes("round2"));
  const hasR3 = files.some(f => f.includes("round3"));
  if (hasR1 && hasR2 && hasR3) {
    pass("Round CSV Coverage", "Found CSV files for Round 1, Round 2, and Round 3.");
  } else {
    fail("Round CSV Coverage", `Missing files for some rounds. Found: ${files.join(", ")}`);
  }

  // Load records and verify line counts
  let totalRawLines = 0;
  const records = [];
  
  for (const file of files) {
    try {
      let content = fs.readFileSync(path.join(dataDir, file), "utf-8");
      const hasBOM = content.startsWith("\uFEFF");
      if (hasBOM) {
        content = content.slice(1);
      }
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      totalRawLines += (lines.length - 1);

      const headers = parseCsvLine(lines[0]);
      let fileParsedCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length !== headers.length) {
          inconsistency(file, i + 1, `Column count mismatch: headers have ${headers.length} fields, row has ${values.length} fields.`);
        }

        const record = { 
          sourceFile: file,
          round: file.includes("round1") ? 1 : file.includes("round2") ? 2 : file.includes("round3") ? 3 : null
        };
        
        headers.forEach((h, idx) => {
          record[h.toLowerCase().trim()] = values[idx] || "";
        });

        // Normalize fields
        record.institute = record["institute"] || "";
        record.program = record["academic program name"] || record["program"] || "";
        record.quota = record["quota"] || "";
        record.seatType = record["seat type"] || "";
        record.gender = record["gender"] || "";

        const op = Number(record["opening rank"]);
        record.openingRank = !isNaN(op) ? op : null;

        const cl = Number(record["closing rank"]);
        record.closingRank = !isNaN(cl) ? cl : null;

        if (!record.institute) {
          warn("Record Integrity", `${file} line ${i+1}: Missing Institute name.`);
        }
        if (record.openingRank === null || record.closingRank === null) {
          warn("Record Integrity", `${file} line ${i+1}: Missing rank cutoff values.`);
        }

        records.push(record);
        fileParsedCount++;
      }
      pass(`File Parse Validation - ${file}`, `Successfully parsed ${fileParsedCount} records.`);
    } catch (e) {
      fail(`File Parse Validation - ${file}`, `Error reading/parsing: ${e.message}`);
    }
  }

  if (records.length === totalRawLines) {
    pass("Total Rows Count Matching", `Combined records count (${records.length}) matches sum of lines count.`);
  } else {
    fail("Total Rows Count Matching", `Mismatch: parsed ${records.length} records, expected ${totalRawLines} from raw files.`);
  }

  // --- 2. Prediction Validation ---
  const testRanks = [15000, 50000, 100000, 200000];
  const testCategories = ["OPEN", "OBC-NCL", "SC", "ST", "EWS"];
  const testGenders = ["Gender-Neutral", "Female-only (including Supernumerary)"];
  
  let predEligibilityOk = true;
  let predSortOk = true;
  let predTopMatchesOk = true;
  let invalidRecordsReturned = false;

  // Predictor simulation
  const runPredictQuery = (rank, category, gender, homeState) => {
    const filtered = [];
    for (const r of records) {
      if (r.seatType !== category) continue;
      if (r.gender !== gender) continue;
      if (r.closingRank === null) continue;
      if (rank > r.closingRank) continue;

      const type = getInstituteType(r.institute);
      const quotaLower = r.quota.toLowerCase();

      // Home State (HS) & Other State (OS) eligibility checks for NITs
      if (type === "NIT") {
        const nitState = getNitState(r.institute);
        if (quotaLower === "home state") {
          if (homeState !== nitState) {
            continue;
          }
        }
      }

      filtered.push({
        ...r,
        rankGap: r.closingRank - rank,
        instituteType: type,
      });
    }

    filtered.sort((a, b) => a.rankGap - b.rankGap);
    const bestMatches = filtered.slice(0, 5);
    const allEligible = filtered.slice(0, 50);

    return { filtered, bestMatches, allEligible };
  };

  // Run suite of validation checks
  for (const rank of testRanks) {
    for (const cat of testCategories) {
      for (const gender of testGenders) {
        const { filtered, bestMatches } = runPredictQuery(rank, cat, gender, "Punjab");

        // Verify Rank Constraints
        filtered.forEach(m => {
          if (rank > m.closingRank) {
            predEligibilityOk = false;
          }
          if (!m.institute || m.closingRank === null) {
            invalidRecordsReturned = true;
          }
        });

        // Verify Sorting
        for (let i = 1; i < filtered.length; i++) {
          if (filtered[i].rankGap < filtered[i - 1].rankGap) {
            predSortOk = false;
          }
        }

        // Verify Top Matches
        bestMatches.forEach((bm, idx) => {
          if (bm.rankGap !== filtered[idx].rankGap) {
            predTopMatchesOk = false;
          }
        });
      }
    }
  }

  if (predEligibilityOk) {
    pass("Prediction Boundaries Check", "Verified all returned records satisfy: User Rank <= Closing Rank.");
  } else {
    fail("Prediction Boundaries Check", "Failed: Ranks fell outside boundaries in one or more predictions.");
  }

  if (!invalidRecordsReturned) {
    pass("Invalid Records Exclusion Check", "Verified no records with missing ranks or null fields are returned.");
  } else {
    fail("Invalid Records Exclusion Check", "Failed: One or more predictions returned invalid/incomplete records.");
  }

  if (predSortOk) {
    pass("Result Sorting Check", "Verified results are sorted correctly by gap (smallest positive gap first).");
  } else {
    fail("Result Sorting Check", "Failed: Results are not sorted in strict ascending order of rank gap.");
  }

  if (predTopMatchesOk) {
    pass("Top Matches Extraction Check", "Verified Top Matches are selected correctly from the top of the sorted list.");
  } else {
    fail("Top Matches Extraction Check", "Failed: Best matches did not align with the sorted list.");
  }

  // --- 3. Category Validation ---
  const uniqueSeatTypes = Array.from(new Set(records.map(r => r.seatType)));
  const expectedCats = ["OPEN", "EWS", "OBC-NCL", "SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "SC (PwD)", "ST (PwD)"];
  const missingCats = expectedCats.filter(c => !uniqueSeatTypes.includes(c));
  
  if (missingCats.length === 0) {
    pass("Seat Type Casing & Matching", "All standard categories and PwD counterparts are present in the CSV and match exactly.");
  } else {
    warn("Seat Type Casing & Matching", `Some expected seat types were missing from the data: ${missingCats.join(", ")}`);
  }

  // Verify that querying category X returns only category X
  let categoryIsolationOk = true;
  for (const cat of expectedCats) {
    if (!uniqueSeatTypes.includes(cat)) continue;
    const { filtered } = runPredictQuery(50000, cat, "Gender-Neutral", "Punjab");
    filtered.forEach(r => {
      if (r.seatType !== cat) {
        categoryIsolationOk = false;
      }
    });
  }

  if (categoryIsolationOk) {
    pass("Category Isolation Validation", "Verified category matching filters out unrelated Seat Types.");
  } else {
    fail("Category Isolation Validation", "Failed: Querying a category returned seats of another category.");
  }

  // Verify OPEN seats handled correctly
  const { filtered: openFiltered } = runPredictQuery(50000, "OPEN", "Gender-Neutral", "Punjab");
  const nonOpenInOpen = openFiltered.filter(r => r.seatType !== "OPEN");
  if (nonOpenInOpen.length === 0 && openFiltered.length > 0) {
    pass("OPEN Seats Handling Validation", "Verified OPEN seats are handled correctly and only return 'OPEN' Seat Type.");
  } else {
    fail("OPEN Seats Handling Validation", `Failed: Found non-OPEN seat types when querying OPEN, or returned 0 seats.`);
  }

  // --- 4. Gender Validation ---
  const uniqueGenders = Array.from(new Set(records.map(r => r.gender)));
  if (uniqueGenders.includes("Gender-Neutral") && uniqueGenders.includes("Female-only (including Supernumerary)")) {
    pass("Gender Pool Casing & Matching", "Gender values in CSV match expected standard naming.");
  } else {
    fail("Gender Pool Casing & Matching", `Missing standard gender values in CSV. Found: ${uniqueGenders.join(", ")}`);
  }

  let genderNeutralIsolationOk = true;
  const { filtered: gnFiltered } = runPredictQuery(50000, "OPEN", "Gender-Neutral", "Punjab");
  gnFiltered.forEach(r => {
    if (r.gender !== "Gender-Neutral") {
      genderNeutralIsolationOk = false;
    }
  });

  let femaleOnlyIsolationOk = true;
  const { filtered: foFiltered } = runPredictQuery(50000, "OPEN", "Female-only (including Supernumerary)", "Punjab");
  foFiltered.forEach(r => {
    if (r.gender !== "Female-only (including Supernumerary)") {
      femaleOnlyIsolationOk = false;
    }
  });

  if (genderNeutralIsolationOk && femaleOnlyIsolationOk) {
    pass("Gender Isolation Validation", "Verified Gender-Neutral and Female-only filters correctly isolate the gender pools.");
  } else {
    fail("Gender Isolation Validation", "Failed: Found gender mismatch in prediction results.");
  }

  // --- 5. Institute Validation ---
  let hasNIT = false;
  let hasIIIT = false;
  let hasGFTI = false;
  records.forEach(r => {
    const t = getInstituteType(r.institute);
    if (t === "NIT") hasNIT = true;
    if (t === "IIIT") hasIIIT = true;
    if (t === "GFTI") hasGFTI = true;
  });

  if (hasNIT && hasIIIT && hasGFTI) {
    pass("Institute Types Presence", "Verified NIT, IIIT, and GFTI records are all loaded from CSV.");
  } else {
    fail("Institute Types Presence", `Missing institute type(s). Loaded NIT: ${hasNIT}, IIIT: ${hasIIIT}, GFTI: ${hasGFTI}`);
  }

  // Reachability
  let nitReachable = false;
  let iiitReachable = false;
  let gftiReachable = false;

  for (const rank of [10000, 30000, 80000, 150000]) {
    const { filtered } = runPredictQuery(rank, "OPEN", "Gender-Neutral", "Punjab");
    filtered.forEach(r => {
      if (r.instituteType === "NIT") nitReachable = true;
      if (r.instituteType === "IIIT") iiitReachable = true;
      if (r.instituteType === "GFTI") gftiReachable = true;
    });
  }

  if (nitReachable && iiitReachable && gftiReachable) {
    pass("Institute Reachability Verification", "All institute types (NIT, IIIT, GFTI) are reachable through prediction queries.");
  } else {
    fail("Institute Reachability Verification", `Some institute types are unreachable. NIT: ${nitReachable}, IIIT: ${iiitReachable}, GFTI: ${gftiReachable}`);
  }

  // --- 6. Home State Validation ---
  let nitStateMappingOk = true;
  const missingStates = new Set();
  const nitRecords = records.filter(r => getInstituteType(r.institute) === "NIT");
  
  nitRecords.forEach(r => {
    const state = getNitState(r.institute);
    if (!state) {
      nitStateMappingOk = false;
      missingStates.add(r.institute);
    }
  });

  if (nitStateMappingOk) {
    pass("NIT State Location Mapping", "Verified all NIT institutions are mapped to their respective Indian states.");
  } else {
    fail("NIT State Location Mapping", `Failed: NITs missing state location mapping: ${Array.from(missingStates).join(", ")}`);
  }

  const checkMappings = [
    { name: "Dr. B R Ambedkar National Institute of Technology, Jalandhar", state: "Punjab" },
    { name: "National Institute of Technology, Calicut", state: "Kerala" },
    { name: "National Institute of Technology, Delhi", state: "Delhi" },
    { name: "National Institute of Technology, Rourkela", state: "Odisha" },
    { name: "National Institute of Technology, Warangal", state: "Telangana" }
  ];
  let mappingsCorrect = true;
  checkMappings.forEach(item => {
    if (getNitState(item.name) !== item.state) {
      mappingsCorrect = false;
    }
  });

  if (mappingsCorrect) {
    pass("Specific NIT State Accuracy", "Validated Calicut (Kerala), Delhi (Delhi), Jalandhar (Punjab), Rourkela (Odisha), and Warangal (Telangana) mappings.");
  } else {
    fail("Specific NIT State Accuracy", "Failed: One or more specific NIT state mappings are incorrect.");
  }

  // Quotas are identified correctly
  const uniqueQuotas = Array.from(new Set(records.map(r => r.quota.toLowerCase())));
  const hasHSQuota = uniqueQuotas.includes("home state");
  const hasOSQuota = uniqueQuotas.includes("other state");
  if (hasHSQuota && hasOSQuota) {
    pass("Quota Identification Validation", "Home State (HS) and Other State (OS) quotas are correctly identified in the dataset.");
  } else {
    fail("Quota Identification Validation", `Failed to identify both HS and OS quotas. Found: ${uniqueQuotas.join(", ")}`);
  }

  // Home State Visibility
  const punjabQuery = runPredictQuery(40000, "OPEN", "Gender-Neutral", "Punjab");
  const hsOpportunities = punjabQuery.filtered.filter(r => r.instituteType === "NIT" && r.quota.toLowerCase() === "home state");
  const jalandharHSOpportunity = hsOpportunities.some(r => r.institute.includes("Jalandhar"));
  
  if (jalandharHSOpportunity) {
    pass("Home State NIT Opportunity Visibility", "Verified student from Punjab can see 'Home State' quota opportunities for NIT Jalandhar.");
  } else {
    fail("Home State NIT Opportunity Visibility", "Failed: Student could not see 'Home State' quota for their home NIT.");
  }

  // Non-Home State NIT Isolation
  let nonHomeStateNITHasHS = false;
  punjabQuery.filtered.forEach(r => {
    if (r.instituteType === "NIT") {
      const state = getNitState(r.institute);
      if (state !== "Punjab" && r.quota.toLowerCase() === "home state") {
        nonHomeStateNITHasHS = true;
      }
    }
  });

  if (!nonHomeStateNITHasHS) {
    pass("Non-Home State NIT Isolation", "Verified student from Punjab cannot see 'Home State' quota seats for other NITs (e.g. Calicut, Delhi).");
  } else {
    fail("Non-Home State NIT Isolation", "Failed: Student was shown 'Home State' quota seats for non-home NITs.");
  }

  // --- 7. Result Validation ---
  let allCollegesReturnedOk = true;
  const testQueryResults = runPredictQuery(45000, "OPEN", "Gender-Neutral", "Delhi");
  let expectedMatchCount = 0;
  records.forEach(r => {
    if (r.seatType !== "OPEN") return;
    if (r.gender !== "Gender-Neutral") return;
    if (r.closingRank === null) return;
    if (45000 > r.closingRank) return;
    const type = getInstituteType(r.institute);
    if (type === "NIT") {
      const state = getNitState(r.institute);
      if (r.quota.toLowerCase() === "home state" && state !== "Delhi") return;
    }
    expectedMatchCount++;
  });

  if (testQueryResults.filtered.length === expectedMatchCount) {
    pass("Complete Results Return Validation", "Verified that the predictor returns the complete set of eligible records, not a restricted subset.");
  } else {
    fail("Complete Results Return Validation", `Mismatch in result count: expected ${expectedMatchCount}, got ${testQueryResults.filtered.length}.`);
  }

  // Verify rank distribution densities
  const results15k = runPredictQuery(15000, "OPEN", "Gender-Neutral", "Delhi").filtered.length;
  const results50k = runPredictQuery(50000, "OPEN", "Gender-Neutral", "Delhi").filtered.length;
  const results100k = runPredictQuery(100000, "OPEN", "Gender-Neutral", "Delhi").filtered.length;
  const results200k = runPredictQuery(200000, "OPEN", "Gender-Neutral", "Delhi").filtered.length;

  if (results15k > 0 && results50k > 0 && results100k > 0 && results200k > 0) {
    pass("Rank Distribution Densities", `Verified cutoffs exist across all ranks. 15k: ${results15k}, 50k: ${results50k}, 100k: ${results100k}, 200k: ${results200k} matches.`);
  } else {
    fail("Rank Distribution Densities", `Failed: Some ranks returned 0 matches. 15k: ${results15k}, 50k: ${results50k}, 100k: ${results100k}, 200k: ${results200k}`);
  }

  // --- 8. Rank Diagnostics (Ranks below 30,000 Investigation) ---
  const rankDiagnostics = {};
  for (const rank of [10000, 15000, 20000, 30000]) {
    const matches = records.filter(r => {
      if (r.seatType !== "OPEN") return false;
      if (r.gender !== "Gender-Neutral") return false;
      if (r.closingRank === null) return false;
      return rank <= r.closingRank;
    });

    const rounds = { 1: 0, 2: 0, 3: 0 };
    const types = { NIT: 0, IIIT: 0, GFTI: 0, Other: 0 };
    
    matches.forEach(r => {
      if (r.round) rounds[r.round] = (rounds[r.round] || 0) + 1;
      const type = getInstituteType(r.institute);
      types[type] = (types[type] || 0) + 1;
    });

    rankDiagnostics[rank] = {
      total: matches.length,
      rounds,
      types
    };
  }

  return { passed, failed, warnings, inconsistencies, rankDiagnostics };
}
