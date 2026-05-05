import fs from "node:fs";
import chalk from "chalk";
import { execa } from "execa";
import { resolveSshHost } from "../ssh/resolveHost.js";
import { expandHome } from "../ssh/path.js";

type CopyPubOptions = {
  current?: boolean;
};

export async function copyPubCommand(
  hostArg: string | undefined,
  options: CopyPubOptions,
) {
  const host = await resolveSshHost(hostArg, options);

  if (!host.identityFile) {
    throw new Error(`Host "${host.host}" has no IdentityFile`);
  }

  const pubPath = `${expandHome(host.identityFile)}.pub`;

  if (!fs.existsSync(pubPath)) {
    throw new Error(`Public key not found: ${pubPath}`);
  }

  const pubKey = fs.readFileSync(pubPath, "utf8").trim();

  await execa("pbcopy", {
    input: pubKey,
  });

  console.log(chalk.green(`Copied public key to clipboard:`));
  console.log(chalk.gray(`${host.host} → ${host.identityFile}.pub`));
}
