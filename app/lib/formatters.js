export function abbreviateInstituteName(name) {
  if (!name) return "";
  let shortName = name;
  
  // 1. Remove duplicate parenthesized phrases (e.g. "(IIIT)" or "(NIT)")
  shortName = shortName.replace(/\(\s*(iiit|nit|iit|gfti|iiest|mnnit|mnit|manit|spa|indian institute of information technology|national institute of technology)\s*\)/ig, "");
  
  // 2. Specific well-known abbreviations
  shortName = shortName.replace(/Dr\.\s*B\.\s*R\.\s*Ambedkar\s*National\s*Institute\s*of\s*Technology/i, "NIT");
  shortName = shortName.replace(/Motilal\s*Nehru\s*National\s*Institute\s*of\s*Technology/i, "MNNIT");
  shortName = shortName.replace(/Malaviya\s*National\s*Institute\s*of\s*Technology/i, "MNIT");
  shortName = shortName.replace(/Maulana\s*Azad\s*National\s*Institute\s*of\s*Technology/i, "MANIT");
  shortName = shortName.replace(/Atal\s*Bihari\s*Vajpayee\s*Indian\s*Institute\s*of\s*Information\s*Technology\s*&\s*Management/i, "ABV-IIITM");
  shortName = shortName.replace(/Indian\s*Institute\s*of\s*Engineering\s*Science\s*and\s*Technology/i, "IIEST");
  shortName = shortName.replace(/School\s*of\s*Planning\s*and\s*Architecture/i, "SPA");
  
  // 3. Generic abbreviations
  shortName = shortName.replace(/National\s*Institute\s*of\s*Technology/i, "NIT");
  shortName = shortName.replace(/Indian\s*Institute\s*of\s*Information\s*Technology/i, "IIIT");
  shortName = shortName.replace(/Government\s*Engineering\s*College/i, "GEC");
  shortName = shortName.replace(/Indian\s*Institute\s*of\s*Technology/i, "IIT");
  
  // 4. Normalize punctuation
  shortName = shortName.replace(/,/g, " ");
  shortName = shortName.replace(/\s+/g, " ");
  
  // 5. Deduplicate contiguous duplicates (e.g. "IIIT IIIT" -> "IIIT", "NIT NIT" -> "NIT")
  shortName = shortName.replace(/\b(NIT|IIIT|IIT|MNNIT|MNIT|MANIT)\b(?:\s+\b\1\b)+/gi, "$1");
  
  // 6. Handle abbreviations next to their parenthesized equivalents
  shortName = shortName.replace(/\b(NIT|IIIT|IIT|MNNIT|MNIT|MANIT)\s*\(\s*\1\s*\)/gi, "$1");
  shortName = shortName.replace(/\b(NIT|IIIT|IIT|MNNIT|MNIT|MANIT)\s*\(\s*Indian\s*Institute\s*of\s*Information\s*Technology\s*\)/gi, "$1");
  shortName = shortName.replace(/\b(NIT|IIIT|IIT|MNNIT|MNIT|MANIT)\s*\(\s*National\s*Institute\s*of\s*Technology\s*\)/gi, "$1");
  
  // 7. Clean spacing
  shortName = shortName.replace(/\s+/g, " ");
  
  return shortName.trim();
}
