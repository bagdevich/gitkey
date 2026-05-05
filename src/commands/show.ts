import fs from "node:fs";
import chalk from "chalk";
import { resolveSshHost } from "../ssh/resolveHost.js";
import { resolveKeyFile } from "../ssh/keyFile.js";

type ShowOptions = {
  current?: boolean;
  pub?: boolean;
  private?: boolean;
};

export async function showCommand(
  hostArg: string | undefined,
  options: ShowOptions,
) {
  const host = await resolveSshHost(hostArg, options);

  if (!host.identityFile) {
    throw new Error(`Host "${host.host}" has no IdentityFile`);
  }

  const { filePath, visibility } = resolveKeyFile(host.identityFile, options);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log(chalk.green(`${host.host} → ${visibility} key`));
  console.log(chalk.gray(filePath));
  console.log("");

  console.log(fs.readFileSync(filePath, "utf8"));
}
