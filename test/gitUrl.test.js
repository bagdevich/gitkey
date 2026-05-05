import test from "node:test";
import assert from "node:assert/strict";
import {
  extractHostAliasFromGitUrl,
  rewriteGitUrlWithHost,
} from "../dist/ssh/gitUrl.js";

test("rewriteGitUrlWithHost rewrites scp-like git URLs", () => {
  assert.equal(
    rewriteGitUrlWithHost("git@github.com:org/repo.git", "work"),
    "git@work:org/repo.git",
  );
});

test("rewriteGitUrlWithHost rewrites ssh URLs", () => {
  assert.equal(
    rewriteGitUrlWithHost("ssh://git@github.com/org/repo.git", "work"),
    "git@work:org/repo.git",
  );
});

test("rewriteGitUrlWithHost rejects unsupported URLs", () => {
  assert.throws(
    () => rewriteGitUrlWithHost("https://github.com/org/repo.git", "work"),
    /Unsupported git URL/,
  );
});

test("extractHostAliasFromGitUrl reads scp-like and ssh URLs", () => {
  assert.equal(
    extractHostAliasFromGitUrl("git@bagdevich:bagdevich/gitkey.git"),
    "bagdevich",
  );
  assert.equal(
    extractHostAliasFromGitUrl("ssh://git@github.com/org/repo.git"),
    "github.com",
  );
  assert.equal(
    extractHostAliasFromGitUrl("https://github.com/org/repo.git"),
    null,
  );
});
