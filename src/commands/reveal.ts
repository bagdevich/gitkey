import fs from "node:fs";
import chalk from "chalk";
import { execa } from "execa";
import { resolveSshHost } from "../ssh/resolveHost.js";
import { resolveKeyFile } from "../ssh/keyFile.js";

type RevealOptions = {
  current?: boolean;
  pub?: boolean;
  private?: boolean;
};

export async function revealCommand(
  hostArg: string | undefined,
  options: RevealOptions,
) {
  const host = await resolveSshHost(hostArg, options);

  if (!host.identityFile) {
    throw new Error(`Host "${host.host}" has no IdentityFile`);
  }

  const { filePath, visibility } = resolveKeyFile(host.identityFile, options);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log(chalk.green(`Revealing ${visibility} key:`));
  console.log(chalk.gray(filePath));

  await execa("open", ["-R", filePath]);
}
