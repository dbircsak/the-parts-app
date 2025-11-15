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
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsingErrors = result.errors
          .map((err: any) => `Row ${err.row}: ${err.message}`)
          .filter(Boolean);

        if (parsingErrors.length > 0) {
          console.warn(
            `CSV parsing had ${result.errors.length} error(s): ${parsingErrors.join("; ")}`
          );
        }

        resolve({
          data: result.data as any[],
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
  return boolStr?.toLowerCase() === "true" || boolStr === "1";
}
