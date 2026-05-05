import test from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { resolveKeyFile } from "../dist/ssh/keyFile.js";

test("resolveKeyFile defaults to the public key", () => {
  const result = resolveKeyFile("~/.ssh/work_ed25519", {});

  assert.deepEqual(result, {
    visibility: "public",
    filePath: path.join(os.homedir(), ".ssh", "work_ed25519.pub"),
  });
});

test("resolveKeyFile returns the private key when explicitly requested", () => {
  const result = resolveKeyFile("~/.ssh/work_ed25519", { private: true });

  assert.deepEqual(result, {
    visibility: "private",
    filePath: path.join(os.homedir(), ".ssh", "work_ed25519"),
  });
});

test("resolveKeyFile rejects conflicting visibility flags", () => {
  assert.throws(
    () => resolveKeyFile("~/.ssh/work_ed25519", { pub: true, private: true }),
    /Use either "--pub" or "--private", not both/,
  );
});
