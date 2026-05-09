import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

export type DiplomaRow = {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  affiliateCode: string;
  affiliateSource?: string;
  dob: string;
  sex: string;
  documentNumber: string;
  fatherName: string;
  motherName: string;
  belt: string;
  martialArt: string;
  language: string;
  currency: string;
  price: number;
};

export async function appendDiplomaRow(row: DiplomaRow): Promise<void> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  if (!GOOGLE_SHEETS_API_KEY)
    throw new Error("GOOGLE_SHEETS_API_KEY is not configured");

  const SHEET_ID = process.env.DIPLOMA_SHEET_ID;
  if (!SHEET_ID) throw new Error("DIPLOMA_SHEET_ID is not configured");

  const TAB = process.env.DIPLOMA_SHEET_TAB || "Sheet1";

  const timestamp = new Date().toISOString();
  const values = [
    [
      timestamp,
      row.firstName,
      row.lastName,
      row.email,
      row.whatsapp,
      row.affiliateCode,
      row.dob,
      row.sex,
      row.documentNumber,
      row.fatherName,
      row.motherName,
      row.belt,
      row.martialArt,
      row.language,
      row.currency,
      String(row.price),
      "PAID",
      "NO",
      "NO",
      row.affiliateSource ?? "manual",
    ],
  ];

  const range = `${TAB}!A:T`;
  const url = `${GATEWAY_URL}/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SHEETS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Sheets append failed [${response.status}]: ${body}`,
    );
  }
}
