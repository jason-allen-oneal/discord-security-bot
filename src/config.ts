

import dotenv from "dotenv";

dotenv.config();

const { APP_TOKEN, APP_ID } = process.env;

if (!APP_TOKEN || !APP_ID) {
  throw new Error("Missing environment variables");
}

export const color = "#4f0202";

export const config = {
  APP_TOKEN,
  APP_ID,
};


