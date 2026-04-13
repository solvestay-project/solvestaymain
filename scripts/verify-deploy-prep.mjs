/**
 * Ensures `next build` succeeds — same step Vercel/your host runs before HTTPS deploy.
 * Run: node scripts/verify-deploy-prep.mjs
 * Requires .env.local (or env) with production Supabase and other vars your build expects.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
console.log("Running next build from:", root);
const result = spawnSync("npm", ["run", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
process.exit(result.status ?? 1);
