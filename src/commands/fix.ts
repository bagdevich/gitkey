import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";
import { execa } from "execa";
import { confirm } from "@inquirer/prompts";
import { parseSshConfig, getSshConfigPath } from "../ssh/parseConfig.js";

function expandHome(filePath: string): string {
  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }

  return filePath;
}

function ok(message: string) {
  console.log(`${chalk.green("✓")} ${message}`);
}

function warn(message: string) {
  console.log(`${chalk.yellow("!")} ${message}`);
}

export async function fixCommand() {
  const sshDir = path.join(os.homedir(), ".ssh");
  const configPath = getSshConfigPath();

  console.log(chalk.bold("gitkey fix\n"));

  if (!fs.existsSync(sshDir)) {
    fs.mkdirSync(sshDir, { recursive: true });
    ok("Created ~/.ssh");
  }

  fs.chmodSync(sshDir, 0o700);
  ok("Fixed ~/.ssh permissions → 700");

  if (fs.existsSync(configPath)) {
    fs.chmodSync(configPath, 0o600);
    ok("Fixed ~/.ssh/config permissions → 600");
  } else {
    fs.writeFileSync(configPath, "");
    fs.chmodSync(configPath, 0o600);
    ok("Created ~/.ssh/config with permissions → 600");
  }

  const hosts = parseSshConfig();

  for (const host of hosts) {
    if (!host.identityFile) continue;

    const keyPath = expandHome(host.identityFile);

    if (!fs.existsSync(keyPath)) {
      warn(`Key not found, skipped: ${host.identityFile}`);
      continue;
    }

    fs.chmodSync(keyPath, 0o600);
    ok(`Fixed key permissions → ${host.identityFile}`);

    const pubPath = `${keyPath}.pub`;

    if (!fs.existsSync(pubPath)) {
      const shouldGenerate = await confirm({
        message: `Generate missing public key for ${host.identityFile}?`,
        default: true,
      });

      if (shouldGenerate) {
        const result = await execa("ssh-keygen", ["-y", "-f", keyPath], {
          reject: false,
        });

        if (result.exitCode === 0 && result.stdout.trim()) {
          fs.writeFileSync(pubPath, `${result.stdout.trim()}\n`);
          fs.chmodSync(pubPath, 0o644);
          ok(`Generated ${host.identityFile}.pub`);
        } else {
          warn(`Could not generate public key for ${host.identityFile}`);
        }
      }
    } else {
      fs.chmodSync(pubPath, 0o644);
      ok(`Fixed public key permissions → ${host.identityFile}.pub`);
    }
  }

  console.log("");
  ok("Fix completed");
}
