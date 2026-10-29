/**
 * Utility to export headers and data rows to a native CSV file.
 * Encoded with UTF-8 BOM so Microsoft Excel can display non-ASCII characters
 * (e.g., Arabic and French accents) perfectly.
 */
export type CSVPrimitive = string | number | boolean | null | undefined;
export type CSVRecordRow = Record<string, CSVPrimitive>;

export function exportToCSVNative(rows: CSVRecordRow[], filename: string): void;
export function exportToCSVNative(headers: string[], rows: CSVPrimitive[][], filename: string): void;
export function exportToCSVNative(
  headersOrRows: string[] | CSVRecordRow[],
  rowsOrFilename: CSVPrimitive[][] | string,
  maybeFilename?: string
): void {
  const escapeCSVField = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  let headers: string[];
  let rows: CSVPrimitive[][];
  let filename: string;

  if (typeof rowsOrFilename === 'string') {
    const objectRows = headersOrRows as CSVRecordRow[];
    filename = rowsOrFilename;
    headers = objectRows.length > 0 ? Object.keys(objectRows[0]) : [];
    rows = objectRows.map((obj) => headers.map((h) => obj[h]));
  } else {
    headers = headersOrRows as string[];
    rows = rowsOrFilename;
    filename = maybeFilename || 'export.csv';
  }

  const csvContent = [
    headers.map(escapeCSVField).join(';'),
    ...rows.map((row) => row.map(escapeCSVField).join(';')),
  ].join('\r\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const csvFilename = filename.endsWith('.xlsx') ? filename.replace(/\.xlsx$/, '.csv') : filename;
  link.setAttribute('download', csvFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
