import { Router } from "express";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(process.cwd(), "public");
const DOWNLOADS_DIR = join(PUBLIC_DIR, "downloads");
const ICONS_DIR = join(PUBLIC_DIR, "icons");

function getIconBase64(): string {
  try {
    const buf = readFileSync(join(ICONS_DIR, "icon-180.png"));
    return buf.toString("base64");
  } catch {
    return "";
  }
}

const router = Router();

/* ─────────────────────────────────────────────────────
   iOS Configuration Profile (.mobileconfig)
   
   Installs Sandbox AI as a full-screen Web Clip on iOS.
   The profile is served with the correct MIME type so
   Safari automatically triggers the "Install Profile" flow.
   ───────────────────────────────────────────────────── */
router.get("/ios/profile", (req, res) => {
  // Derive the app URL from the request host
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "sandbox-ai.replit.app";
  const appUrl = `${protocol}://${host}/`;

  // Wrap base64 at 64 chars/line — standard Apple plist format
  const rawB64 = getIconBase64();
  const wrappedB64 = rawB64.match(/.{1,64}/g)?.join("\n      ") ?? "";
  const iconDataBlock = wrappedB64
    ? `\n      <key>Icon</key>\n      <data>\n      ${wrappedB64}\n      </data>\n      <key>PrecomposedIcon</key>\n      <true/>`
    : "";

  const mobileconfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadDisplayName</key>
  <string>Sandbox AI</string>
  <key>PayloadDescription</key>
  <string>Cài Sandbox AI lên màn hình chính iPhone dưới dạng ứng dụng toàn màn hình.</string>
  <key>PayloadIdentifier</key>
  <string>app.sandboxai.profile.v2</string>
  <key>PayloadUUID</key>
  <string>550e8400-e29b-41d4-a716-446655440002</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key>
      <string>com.apple.webClip.managed</string>
      <key>PayloadIdentifier</key>
      <string>app.sandboxai.webclip.v2</string>
      <key>PayloadUUID</key>
      <string>550e8400-e29b-41d4-a716-446655440003</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>PayloadDisplayName</key>
      <string>Sandbox AI</string>
      <key>Label</key>
      <string>Sandbox AI</string>
      <key>URL</key>
      <string>${appUrl}</string>
      <key>FullScreen</key>
      <true/>
      <key>IgnoreManifestScope</key>
      <false/>
      <key>IsRemovable</key>
      <true/>${iconDataBlock}
    </dict>
  </array>
</dict>
</plist>`;

  res.setHeader("Content-Type", "application/x-apple-aspen-config");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="sandbox-ai.mobileconfig"'
  );
  res.setHeader("Cache-Control", "no-store");
  res.send(mobileconfig);
});

/* ─────────────────────────────────────────────────────
   Android APK download
   
   Serves the APK from public/downloads/sandbox-ai.apk.
   If the file does not exist yet, returns instructions.
   ───────────────────────────────────────────────────── */
router.get("/android/apk", (req, res) => {
  const apkPath = join(DOWNLOADS_DIR, "sandbox-ai.apk");

  if (!existsSync(apkPath)) {
    res.status(404).json({
      error: "APK_NOT_AVAILABLE",
      message:
        "APK file not yet available. Use the PWA install on Android Chrome instead.",
      pwa: "Add to Home Screen → tap ⋮ in Chrome → 'Add to Home screen'",
    });
    return;
  }

  res.setHeader("Content-Type", "application/vnd.android.package-archive");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="sandbox-ai.apk"'
  );
  res.setHeader("Cache-Control", "no-store");
  res.download(apkPath, "sandbox-ai.apk");
});

/* ─────────────────────────────────────────────────────
   APK availability check (used by the download page)
   ───────────────────────────────────────────────────── */
router.get("/android/apk/status", (_req, res) => {
  const apkPath = join(DOWNLOADS_DIR, "sandbox-ai.apk");
  res.json({
    available: existsSync(apkPath),
  });
});

export default router;
