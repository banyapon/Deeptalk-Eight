const { spawn } = require("child_process");
const path = require("path");
const electronBinary = require("electron");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronBinary, [path.join(__dirname, "..")], {
  stdio: "inherit",
  env,
  windowsHide: false
});

child.on("close", (code) => {
  process.exit(code ?? 1);
});
