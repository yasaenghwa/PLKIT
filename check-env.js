const fs = require("fs");

const requiredEnvFile = ".env";

if (!fs.existsSync(requiredEnvFile)) {
  console.error(`❌ Error: Missing required ${requiredEnvFile} file.`);
  process.exit(1); // Exit with error code
} else {
  console.log(`✅ ${requiredEnvFile} file found.`);
}
