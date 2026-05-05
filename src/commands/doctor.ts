import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";
import { execa } from "execa";
import { parseSshConfig, getSshConfigPath } from "../ssh/parseConfig.js";

function expandHome(filePath: string): string {
  if (filePath.startsWith("~/")) {
    return path.join(os.homedir(), filePath.slice(2));
  }

  return filePath;
}

function mode(filePath: string): string {
  return (fs.statSync(filePath).mode & 0o777).toString(8);
}

function ok(message: string) {
  console.log(`${chalk.green("✓")} ${message}`);
}

function warn(message: string) {
  console.log(`${chalk.yellow("!")} ${message}`);
}

function fail(message: string) {
  console.log(`${chalk.red("✗")} ${message}`);
}

export async function doctorCommand() {
  const sshDir = path.join(os.homedir(), ".ssh");
  const configPath = getSshConfigPath();

  console.log(chalk.bold("gitkey doctor\n"));

  if (!fs.existsSync(sshDir)) {
    fail("~/.ssh does not exist");
    return;
  }

  ok("~/.ssh exists");

  const sshDirMode = mode(sshDir);

  if (sshDirMode === "700") {
    ok("~/.ssh permissions are 700");
  } else {
    warn(`~/.ssh permissions are ${sshDirMode}, recommended 700`);
    console.log(chalk.gray(`  fix: chmod 700 ~/.ssh`));
  }

  if (!fs.existsSync(configPath)) {
    fail("~/.ssh/config does not exist");
    return;
  }

  ok("~/.ssh/config exists");

  const configMode = mode(configPath);

  if (configMode === "600" || configMode === "644") {
    ok(`~/.ssh/config permissions are ${configMode}`);
  } else {
    warn(`~/.ssh/config permissions are ${configMode}, recommended 600`);
    console.log(chalk.gray(`  fix: chmod 600 ~/.ssh/config`));
  }

  const hosts = parseSshConfig();

  if (!hosts.length) {
    warn("No Host entries found in ~/.ssh/config");
    return;
  }

  ok(`Found ${hosts.length} Host entries`);

  const hostNames = hosts.map((h) => h.host);
  const duplicates = hostNames.filter(
    (host, index) => hostNames.indexOf(host) !== index,
  );

  if (duplicates.length) {
    warn(`Duplicate Host entries: ${[...new Set(duplicates)].join(", ")}`);
  } else {
    ok("No duplicate Host entries");
  }

  console.log("");

  for (const host of hosts) {
    console.log(chalk.cyan(host.host));

    if (!host.hostName) {
      warn("  missing HostName");
    } else {
      ok(`  HostName: ${host.hostName}`);
    }

    if (!host.identityFile) {
      warn("  missing IdentityFile");
      continue;
    }

    const keyPath = expandHome(host.identityFile);

    if (!fs.existsSync(keyPath)) {
      fail(`  IdentityFile not found: ${host.identityFile}`);
      continue;
    }

    ok(`  IdentityFile exists: ${host.identityFile}`);

    const keyMode = mode(keyPath);

    if (keyMode === "600") {
      ok(`  key permissions are ${keyMode}`);
    } else {
      warn(`  key permissions are ${keyMode}, recommended 600`);
      console.log(chalk.gray(`    fix: chmod 600 ${host.identityFile}`));
    }

    const pubPath = `${keyPath}.pub`;

    if (fs.existsSync(pubPath)) {
      ok(`  public key exists: ${host.identityFile}.pub`);
    } else {
      warn(`  public key missing: ${host.identityFile}.pub`);
      console.log(
        chalk.gray(
          `    fix: ssh-keygen -y -f ${host.identityFile} > ${host.identityFile}.pub`,
        ),
      );
    }
  }

  console.log("");

  const agent = await execa("ssh-add", ["-l"], {
    reject: false,
  });

  if (agent.exitCode === 0) {
    ok("ssh-agent has loaded keys");
  } else {
    warn("ssh-agent has no loaded keys or is unavailable");
    console.log(chalk.gray("  fix: ssh-add --apple-use-keychain ~/.ssh/<key>"));
  }
}
