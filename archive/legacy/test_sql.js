import fs from 'fs';

const sql = fs.readFileSync('supabase/seed.sql', 'utf8');
const insertRegex = /INSERT INTO\s+([a-zA-Z0-9_\.]+)\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?)(?:ON CONFLICT|;)/gi;

let match;
while ((match = insertRegex.exec(sql)) !== null) {
  const table = match[1];
  const columns = match[2].split(',').map(c => c.trim());
  const valuesStr = match[3];

  let inString = false;
  let currentTuple = [];
  let currentValue = "";
  let tuples = [];
  let inParen = false;

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const nextChar = valuesStr[i+1];

    if (char === "'" && !inString) {
      inString = true;
      currentValue += char;
    } else if (char === "'" && inString) {
      if (nextChar === "'") {
        currentValue += "''";
        i++;
      } else {
        inString = false;
        currentValue += char;
      }
    } else if (!inString && char === '(') {
      inParen = true;
    } else if (!inString && char === ')') {
      inParen = false;
      if (currentValue.trim() !== "") currentTuple.push(currentValue.trim());
      tuples.push(currentTuple);
      currentTuple = [];
      currentValue = "";
    } else if (!inString && char === ',' && inParen) {
      currentTuple.push(currentValue.trim());
      currentValue = "";
    } else if (inParen) {
      currentValue += char;
    }
  }

  for (let i = 0; i < tuples.length; i++) {
    if (tuples[i].length !== columns.length) {
      console.log(`Mismatch in ${table}. Columns: ${columns.length}, Tuple ${i+1} length: ${tuples[i].length}`);
    }
  }
}
console.log("Strict scan complete.");
