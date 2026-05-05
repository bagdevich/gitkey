import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { expandHome } from "../dist/ssh/path.js";

test("expandHome expands home-relative SSH paths", () => {
  assert.equal(
    expandHome("~/.ssh/work_ed25519"),
    path.join(os.homedir(), ".ssh", "work_ed25519"),
  );
});

test("expandHome leaves absolute paths unchanged", () => {
  assert.equal(
    expandHome("/tmp/work_ed25519"),
    "/tmp/work_ed25519",
  );
});
