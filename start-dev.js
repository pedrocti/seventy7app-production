// start-dev.js
import { spawn } from "child_process";
import net from "net";

// Kill port helper
function killPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(resolve);
    });
    server.on("error", () => resolve());
  });
}

async function preparePorts() {
  console.log("🔪 Clearing ports...");

  await killPort(3000);
  await killPort(5000);

  console.log("✅ Ports cleared.");
}

function runScript(name, command, args) {
  console.log(`\n🌟 Starting ${name}...`);

  const proc = spawn(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env },
  });

  proc.on("error", (err) => {
    console.error(`❌ ${name} failed:`, err);
  });

  proc.on("exit", (code) => {
    console.log(`⚠️ ${name} exited with code ${code}`);
  });

  return proc;
}

(async () => {
  await preparePorts();

  const backend = runScript("Backend", "npm", ["run", "backend"]);
  const frontend = runScript("Frontend", "npm", ["run", "frontend"]);

  function shutdown() {
    console.log("\n🛑 Shutting down...");
    backend?.kill("SIGINT");
    frontend?.kill("SIGINT");
    process.exit();
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
})();
