import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { execa } from "execa";
import { parseSshConfig } from "../ssh/parseConfig.js";

function expandHome(filePath: string): string {
  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }

  return filePath;
}

export async function agentAddCommand(hostArg?: string) {
  const hosts = parseSshConfig().filter((h) => h.identityFile);

  if (!hosts.length) {
    throw new Error("No hosts with IdentityFile found in ~/.ssh/config");
  }

  const selectedHost =
    hostArg ??
    (await select({
      message: "Select SSH key to add:",
      choices: hosts.map((h) => ({
        name: `${h.host} → ${h.identityFile}`,
        value: h.host,
      })),
    }));

  const host = hosts.find((h) => h.host === selectedHost);

  if (!host?.identityFile) {
    throw new Error(`Host not found or has no IdentityFile: ${selectedHost}`);
  }

  const keyPath = expandHome(host.identityFile);

  if (!fs.existsSync(keyPath)) {
    throw new Error(`Key file does not exist: ${host.identityFile}`);
  }

  console.log(chalk.green(`Adding key to ssh-agent:`));
  console.log(chalk.gray(host.identityFile));

  const macResult = await execa("ssh-add", ["--apple-use-keychain", keyPath], {
    stdio: "inherit",
    reject: false,
  });

  if (macResult.exitCode === 0) {
    console.log(chalk.green("Added with macOS Keychain"));
    return;
  }

  console.log(
    chalk.yellow("macOS Keychain flag failed, trying regular ssh-add..."),
  );

  const fallbackResult = await execa("ssh-add", [keyPath], {
    stdio: "inherit",
    reject: false,
  });

  if (fallbackResult.exitCode !== 0) {
    throw new Error(`Failed to add key: ${host.identityFile}`);
  }

  console.log(chalk.green("Added with regular ssh-add"));
}
