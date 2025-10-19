import { google } from "googleapis";
import fs from "fs";

let saJson: string | null = null;
if (process.env.GOOGLE_CREDENTIALS_PATH) {
  saJson = fs.readFileSync(process.env.GOOGLE_CREDENTIALS_PATH, "utf8");
} else if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  saJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf8");
} else {
  throw new Error("GOOGLE_CREDENTIALS_PATH or GOOGLE_CREDENTIALS_BASE64 is required");
}

const sa = JSON.parse(saJson);
console.log("🔐 Using SA:", sa.client_email);

const auth = new google.auth.JWT({
  email: sa.client_email,
  key: sa.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const sheets = google.sheets({ version: "v4", auth });
export const SHEETS_ID = process.env.SHEETS_ID!;
export const SHEETS_TAB = process.env.SHEETS_TAB || "Cases";

