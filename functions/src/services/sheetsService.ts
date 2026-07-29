/**
 * Minimal Google Sheets REST client, authenticated as the Cloud Function's
 * own runtime service account (Application Default Credentials) — no
 * exported key needed. The only setup required is enabling the Sheets API
 * on the GCP project and sharing the target spreadsheet with that service
 * account's email as an Editor (see functions/SHEETS_SETUP.md).
 *
 * Deliberately hand-rolled against the REST API instead of pulling in the
 * full `googleapis` package: `google-auth-library` is already a resolved
 * dependency (via firebase-admin) and its AuthClient.request() gives us
 * authenticated HTTP without adding a multi-MB client library for two
 * endpoints (values.get / values.batchUpdate / values.append).
 */

import { GoogleAuth } from 'google-auth-library';

const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function sheetsRequest<T>(opts: {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  params?: Record<string, string>;
  data?: unknown;
}): Promise<T> {
  const client = await auth.getClient();
  const res = await client.request<T>({
    url: `${SHEETS_BASE}${opts.path}`,
    method: opts.method,
    params: opts.params,
    data: opts.data,
  });
  return res.data;
}

export interface SheetRow {
  /** Stable key used to find-and-update this row on later runs: `${date}_${uid}`. */
  key: string;
  values: (string | number)[];
}

/**
 * Upserts rows by matching column A (the hidden key column) — rows with a
 * key already present are overwritten in place so a second run the same
 * day updates counts instead of duplicating rows; new keys are appended.
 *
 * `sheetName` is optional and defaults to whatever the spreadsheet's first
 * tab is actually named (Google names it "Sheet1" for new spreadsheets,
 * differently in some locales) — omitting a sheet-name prefix in an A1
 * range targets that first tab, so there's no need to rename anything
 * before pointing this at a freshly created spreadsheet.
 */
export async function upsertSheetRows(
  spreadsheetId: string,
  header: string[],
  rows: SheetRow[],
  sheetName?: string
): Promise<void> {
  if (rows.length === 0) return;

  const prefix = sheetName ? `${sheetName}!` : '';
  const endCol = String.fromCharCode('A'.charCodeAt(0) + header.length - 1);

  const existing = await sheetsRequest<{ values?: string[][] }>({
    method: 'GET',
    path: `/${spreadsheetId}/values/${encodeURIComponent(`${prefix}A1:${endCol}`)}`,
  });

  const existingValues = existing.values || [];
  const hasHeader = existingValues.length > 0 && existingValues[0][0] === header[0];

  if (!hasHeader) {
    await sheetsRequest({
      method: 'PUT',
      path: `/${spreadsheetId}/values/${encodeURIComponent(`${prefix}A1`)}`,
      params: { valueInputOption: 'RAW' },
      data: { values: [header] },
    });
  }

  // Row N in the sheet is existingValues[N-1]; data starts at row 2.
  const existingKeys = (hasHeader ? existingValues.slice(1) : existingValues).map((r) => r[0]);

  const updates: { range: string; values: (string | number)[][] }[] = [];
  const appends: (string | number)[][] = [];

  for (const row of rows) {
    const idx = existingKeys.indexOf(row.key);
    if (idx >= 0) {
      const rowNumber = idx + (hasHeader ? 2 : 1);
      updates.push({
        range: `${prefix}A${rowNumber}:${endCol}${rowNumber}`,
        values: [row.values],
      });
    } else {
      appends.push(row.values);
      existingKeys.push(row.key); // avoid duplicate appends within this same run
    }
  }

  if (updates.length > 0) {
    await sheetsRequest({
      method: 'POST',
      path: `/${spreadsheetId}/values:batchUpdate`,
      data: { valueInputOption: 'RAW', data: updates },
    });
  }

  if (appends.length > 0) {
    await sheetsRequest({
      method: 'POST',
      path: `/${spreadsheetId}/values/${encodeURIComponent(`${prefix}A:${endCol}`)}:append`,
      params: { valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' },
      data: { values: appends },
    });
  }
}
