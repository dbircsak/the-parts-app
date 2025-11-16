import Papa from "papaparse";

export interface DailyOutRow {
  ro_number: string;
  owner: string;
  vehicle: string;
  vehicle_color: string;
  license_plate_number: string;
  parts_received_pct: string;
  vehicle_in: string;
  current_phase: string;
  scheduled_out: string;
  body_technician: string;
  estimator: string;
}

export interface PartsStatusRow {
  ro_number: string;
  line: string;
  part_number: string;
  part_description: string;
  part_type: string;
  vendor_name: string;
  ro_qty: string;
  ordered_qty: string;
  ordered_date: string;
  expected_delivery: string;
  received_qty: string;
  invoice_date: string;
  returned_qty: string;
}

export interface VendorRow {
  vendor_name: string;
  primary_phone: string;
  fax: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  preferred: string;
  electronic: string;
}

export function parseCSV(
  content: string
): Promise<{ data: any[]; parsingErrors: string[] }> {
  return new Promise((resolve) => {
    // First pass: find the header row by looking for a line with MULTIPLE known column headers
    const lines = content.split("\n");
    let headerRowIndex = 0;
    const knownHeaders = [
      "ro number",
      "owner",
      "vehicle",
      "vehicle color",
      "license plate number",
      "parts received %",
      "vendor name",
      "primary phone",
      "part number",
      "part description",
      "fax",
      "address",
      "city",
      "state",
      "zip",
      "preferred",
      "electronic",
    ];

    let headerFound = false;
    for (let i = 0; i < lines.length && i < 20; i++) {
      const line = lines[i].toLowerCase();
      const matchCount = knownHeaders.filter((header) =>
        line.includes(header)
      ).length;

      // If this line has multiple known headers, it's probably the header row
      if (matchCount >= 3) {
        headerRowIndex = i;
        headerFound = true;
        console.log(
          `Found header row at line ${i + 1} (matched ${matchCount} headers)`
        );
        break;
      }
    }

    if (!headerFound) {
      const error = `No header row found in first 20 lines of CSV. Expected to find a row with at least 3 of these column names: ${knownHeaders.join(", ")}`;
      console.error(error);
      resolve({
        data: [],
        parsingErrors: [error],
      });
      return;
    }

    const contentFromHeader = lines.slice(headerRowIndex).join("\n");

    Papa.parse(contentFromHeader, {
      header: true,
      trimHeaders: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Map actual CSV headers (with spaces) to expected column names (snake_case)
        // Supports headers from all three CSV types: Daily Out, Parts Status, and Vendors
        const headerMap: Record<string, string> = {
          // Daily Out
          "ro number": "ro_number",
          owner: "owner",
          vehicle: "vehicle",
          "vehicle color": "vehicle_color",
          "license plate number": "license_plate_number",
          "parts received %": "parts_received_pct",
          "vehicle in": "vehicle_in",
          "current phase": "current_phase",
          "scheduled out": "scheduled_out",
          "body technician": "body_technician",
          estimator: "estimator",
          // Parts Status
          line: "line",
          "part number": "part_number",
          "part description": "part_description",
          "part type": "part_type",
          "vendor name": "vendor_name",
          "ro qty": "ro_qty",
          "ordered qty": "ordered_qty",
          "ordered date": "ordered_date",
          "expected delivery": "expected_delivery",
          "received qty": "received_qty",
          "invoice date": "invoice_date",
          "returned qty": "returned_qty",
          // Vendors
          "primary phone": "primary_phone",
          fax: "fax",
          address: "address",
          city: "city",
          state: "state",
          zip: "zip",
          preferred: "preferred",
          electronic: "electronic",
        };

        // Handle empty/undefined headers
        if (!header) {
          return undefined as any;
        }

        const trimmed = header.trim().toLowerCase();
        return headerMap[trimmed] || trimmed;
      },
      transform: (field: string) => {
        // Trim whitespace and replace extended ASCII characters
        if (typeof field !== "string") return field;
        
        let cleaned = field.trim();
        // Replace common extended ASCII/Windows-1252 characters with ASCII equivalents
        const replacements: Record<string, string> = {
          '\u2019': "'",  // right single quotation mark → apostrophe
          '\u2018': "'",  // left single quotation mark → apostrophe
          '\u201C': '"',  // left double quotation mark → quote
          '\u201D': '"',  // right double quotation mark → quote
          '\u2013': '-',  // en dash → hyphen
          '\u2014': '-',  // em dash → hyphen
          '\u00E9': 'e',  // é → e
          '\u00E8': 'e',  // è → e
          '\u00EA': 'e',  // ê → e
          '\u00E0': 'a',  // à → a
          '\u00E1': 'a',  // á → a
          '\u00E2': 'a',  // â → a
          '\u00F1': 'n',  // ñ → n
          '\u00FC': 'u',  // ü → u
          '\u00F3': 'o',  // ó → o
        };
        
        for (const [char, replacement] of Object.entries(replacements)) {
          cleaned = cleaned.replace(new RegExp(char, 'g'), replacement);
        }
        
        return cleaned;
      },
      complete: (result) => {
        const parsingErrors = result.errors
          .map((err: any) => `Row ${err.row}: ${err.message}`)
          .filter(Boolean);

        if (parsingErrors.length > 0) {
          console.warn(
            `CSV parsing had ${result.errors.length} error(s): ${parsingErrors.join("; ")}`
          );
        }

        // Filter out completely empty rows (rows where all values are empty)
        const filteredData = result.data.filter((row: any) => {
          return Object.values(row).some((value: any) => value !== "" && value !== null && value !== undefined);
        });

        if (filteredData.length !== result.data.length) {
          console.log(
            `Filtered out ${result.data.length - filteredData.length} empty row(s)`
          );
        }

        // Log first row for diagnostic purposes
        if (filteredData.length > 0) {
          console.log(`First parsed row keys: ${Object.keys(filteredData[0]).join(", ")}`);
          console.log(`First parsed row data: ${JSON.stringify(filteredData[0])}`);
        }

        resolve({
          data: filteredData as any[],
          parsingErrors,
        });
      },
      error: (error) => {
        console.error("CSV parse error:", error);
        // Continue with empty data if parse fails
        resolve({
          data: [],
          parsingErrors: [String(error)],
        });
      },
    });
  });
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

export function parseNumber(numStr: string): number | null {
  if (!numStr) return null;
  const num = parseFloat(numStr);
  return isNaN(num) ? null : num;
}

export function parseBoolean(boolStr: string): boolean {
  const lower = boolStr?.toLowerCase();
  return lower === "true" || boolStr === "1" || lower === "electronic";
}
