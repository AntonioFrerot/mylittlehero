import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    ANALYZE: "true",
  },
});

process.exit(result.status ?? 1);
