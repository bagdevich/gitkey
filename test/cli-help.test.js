import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const runCli = (...args) =>
  execFileSync("node", ["dist/index.js", ...args], { encoding: "utf8" });

test("root help lists the key utility commands", () => {
  const output = runCli("--help");

  assert.match(output, /open \[options] \[host]/);
  assert.match(output, /copy-pub \[options] \[host]/);
  assert.match(output, /reveal \[options] \[host]/);
  assert.match(output, /show \[options] \[host]/);
  assert.doesNotMatch(output, /open-pub/);
});

test("open help documents safe public-key defaults", () => {
  const output = runCli("open", "--help");

  assert.match(output, /Open SSH key file \(public by default\)/);
  assert.match(output, /--private\s+Open private key/);
});

test("show help documents safe public-key defaults", () => {
  const output = runCli("show", "--help");

  assert.match(output, /Print SSH key content \(public by default\)/);
  assert.match(output, /--private\s+Show private key/);
});
