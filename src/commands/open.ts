import fs from "node:fs";
import chalk from "chalk";
import { execa } from "execa";
import { resolveSshHost } from "../ssh/resolveHost.js";
import { resolveKeyFile } from "../ssh/keyFile.js";

type OpenOptions = {
  current?: boolean;
  pub?: boolean;
  private?: boolean;
};

export async function openCommand(
  hostArg: string | undefined,
  options: OpenOptions,
) {
  const host = await resolveSshHost(hostArg, options);

  if (!host.identityFile) {
    throw new Error(`Host "${host.host}" has no IdentityFile`);
  }

  const { filePath, visibility } = resolveKeyFile(host.identityFile, options);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log(chalk.green(`Opening ${visibility} key:`));
  console.log(chalk.gray(filePath));

  await execa("open", [filePath]);
}
