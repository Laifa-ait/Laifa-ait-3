import fs from "fs";

function isPortListening(port: number): boolean {
  try {
    const hexPort = port.toString(16).toUpperCase().padStart(4, "0");
    const checkFile = (filePath: string) => {
      if (!fs.existsSync(filePath)) return false;
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const localAddr = parts[1];
          const state = parts[3];
          if (localAddr && localAddr.endsWith(":" + hexPort) && state === "0A") {
            return true;
          }
        }
      }
      return false;
    };

    return checkFile("/proc/net/tcp") || checkFile("/proc/net/tcp6");
  } catch {
    return false;
  }
}

// Ensure tests run in isolated test environment and never target production
process.env.NODE_ENV = "test";

// Strip any real Google credentials from test environment to guarantee no accidental production calls can succeed
delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
delete process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// Set isolated test Firebase project ID to prevent any test from targeting production
const targetTestProject = process.env.FIREBASE_TEST_PROJECT_ID || "olmart-test-harness";
process.env.FIREBASE_PROJECT_ID = targetTestProject;
process.env.GCLOUD_PROJECT = targetTestProject;
process.env.GOOGLE_CLOUD_PROJECT = targetTestProject;
process.env.FIREBASE_DATABASE_ID = process.env.FIREBASE_DATABASE_ID || "(default)";

// Check for active emulator ports
const firestorePortActive = isPortListening(8085);
process.env.FIREBASE_EMULATOR_ACTIVE = firestorePortActive ? "true" : "false";

const hasEmulatorHost = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIRESTORE_EMULATOR_HOST.trim().length > 0);

if (!firestorePortActive && !hasEmulatorHost && process.env.ALLOW_TESTS_WITHOUT_EMULATOR !== "true") {
  throw new Error("Refus: aucun émulateur détecté (port 8085 inactif et FIRESTORE_EMULATOR_HOST non défini).");
}

// Always route to loopback emulator host to guarantee zero outbound network calls to GCP production
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199";
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";

