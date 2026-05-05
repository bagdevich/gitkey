import test from "node:test";
import assert from "node:assert/strict";
import { parseSshConfigContent } from "../dist/ssh/parseConfig.js";

test("parseSshConfigContent parses host entries and ignores comments", () => {
  const config = `
# comment
Host work
  HostName github.com
  User git
  IdentityFile ~/.ssh/work_ed25519

Host personal
  HostName bitbucket.org
  IdentityFile ~/.ssh/personal_ed25519
`;

  assert.deepEqual(parseSshConfigContent(config), [
    {
      host: "work",
      hostName: "github.com",
      user: "git",
      identityFile: "~/.ssh/work_ed25519",
    },
    {
      host: "personal",
      hostName: "bitbucket.org",
      identityFile: "~/.ssh/personal_ed25519",
    },
  ]);
});

test("parseSshConfigContent returns an empty list for empty input", () => {
  assert.deepEqual(parseSshConfigContent(""), []);
});
