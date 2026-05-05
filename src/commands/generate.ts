import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";
import { input, select, confirm } from "@inquirer/prompts";
import { execa } from "execa";
import { getSshConfigPath, parseSshConfig } from "../ssh/parseConfig.js";

function expandHome(filePath: string): string {
  if (filePath.startsWith("~/"))
    return path.join(os.homedir(), filePath.slice(2));
  return filePath;
}

function toHomePath(filePath: string): string {
  const home = os.homedir();
  if (filePath.startsWith(home)) return `~${filePath.slice(home.length)}`;
  return filePath;
}

export async function generateCommand() {
  const sshDir = path.join(os.homedir(), ".ssh");

  if (!fs.existsSync(sshDir)) {
    fs.mkdirSync(sshDir, { recursive: true });
    fs.chmodSync(sshDir, 0o700);
  }

  const hostAlias = await input({
    message: "Host alias:",
    required: true,
    validate: (value) => {
      if (parseSshConfig().some((h) => h.host === value)) {
        return `Host "${value}" already exists in ~/.ssh/config`;
      }

      return true;
    },
  });

  const provider = await select({
    message: "Provider:",
    choices: [
      { name: "GitHub", value: "github.com" },
      { name: "Bitbucket", value: "bitbucket.org" },
      { name: "Custom", value: "custom" },
    ],
  });

  const hostName =
    provider === "custom"
      ? await input({ message: "HostName:", required: true })
      : provider;

  const email = await input({
    message: "Email/comment for key:",
    required: true,
  });

  const defaultKeyName = `${hostAlias}_ed25519`;

  const keyName = await input({
    message: "Key filename:",
    default: defaultKeyName,
    required: true,
  });

  const keyPath = path.join(sshDir, keyName);
  const identityFile = toHomePath(keyPath);

  if (fs.existsSync(keyPath)) {
    const overwrite = await confirm({
      message: `${identityFile} already exists. Overwrite?`,
      default: false,
    });

    if (!overwrite) {
      console.log(chalk.yellow("Cancelled"));
      return;
    }
  }

  await execa("ssh-keygen", ["-t", "ed25519", "-C", email, "-f", keyPath], {
    stdio: "inherit",
  });

  fs.chmodSync(keyPath, 0o600);

  if (fs.existsSync(`${keyPath}.pub`)) {
    fs.chmodSync(`${keyPath}.pub`, 0o644);
  }

  console.log(chalk.green("\nGenerated key:"));
  console.log(chalk.gray(identityFile));

  const addToAgent = await confirm({
    message: "Add key to ssh-agent/macOS Keychain?",
    default: true,
  });

  if (addToAgent) {
    const macResult = await execa(
      "ssh-add",
      ["--apple-use-keychain", keyPath],
      {
        stdio: "inherit",
        reject: false,
      },
    );

    if (macResult.exitCode !== 0) {
      await execa("ssh-add", [keyPath], {
        stdio: "inherit",
      });
    }
  }

  const addHost = await confirm({
    message: `Add Host "${hostAlias}" to ~/.ssh/config?`,
    default: true,
  });

  if (addHost) {
    const configPath = getSshConfigPath();
    const currentConfig = fs.existsSync(configPath)
      ? fs.readFileSync(configPath, "utf8")
      : "";

    const block = `
# ${hostAlias}
Host ${hostAlias}
  HostName ${hostName}
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ${identityFile}
  IdentitiesOnly yes
`;

    fs.writeFileSync(
      configPath,
      `${currentConfig.trimEnd()}\n\n${block.trim()}\n`,
    );
    fs.chmodSync(configPath, 0o600);

    console.log(chalk.green(`Added Host "${hostAlias}" to ~/.ssh/config`));
  }

  const pubPath = `${keyPath}.pub`;

  if (fs.existsSync(pubPath)) {
    const pubKey = fs.readFileSync(pubPath, "utf8").trim();

    console.log(chalk.green("\nPublic key:"));
    console.log(chalk.gray(pubKey));

    const copy = await confirm({
      message: "Copy public key to clipboard?",
      default: true,
    });

    if (copy) {
      await execa("pbcopy", {
        input: pubKey,
      });

      console.log(chalk.green("Copied public key to clipboard"));
    }
  }

  console.log(chalk.green("\nDone"));
}
