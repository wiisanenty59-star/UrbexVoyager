import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactDir = __dirname;

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");

  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],

    platform: "node",
    target: "node20",

    bundle: true,
    format: "esm",

    outdir: distDir,
    outExtension: { ".js": ".mjs" },

    logLevel: "info",

    // 🔥 IMPORTANT: prevents TSX resolution issues
    loader: {
      ".ts": "ts",
      ".tsx": "tsx",
    },

    // keep node/native deps external
    external: [
      "*.node",

      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",

      "bufferutil",
      "utf-8-validate",

      "lightningcss",
      "pg-native",
      "oracledb",

      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",

      "@prisma/client",
      "@aws-sdk/*",
      "@google-cloud/*",
      "firebase-admin",

      "playwright",
      "puppeteer",
      "electron",
    ],

    sourcemap: "linked",

    plugins: [
      esbuildPluginPino({ transports: ["pino-pretty"] }),
    ],

    banner: {
      js: `
import { createRequire as __createRequire } from "node:module";
import path from "node:path";
import url from "node:url";

const require = __createRequire(import.meta.url);
globalThis.require = require;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

globalThis.__filename = __filename;
globalThis.__dirname = __dirname;
      `,
    },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});