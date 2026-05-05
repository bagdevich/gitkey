import fs from "node:fs";
import chalk from "chalk";
import { execa } from "execa";
import { resolveSshHost } from "../ssh/resolveHost.js";
import { expandHome } from "../ssh/path.js";

type RevealOptions = {
  current?: boolean;
  pub?: boolean;
  private?: boolean;
};

export async function revealCommand(
  hostArg: string | undefined,
  options: RevealOptions,
) {
  if (options.pub && options.private) {
    throw new Error('Use either "--pub" or "--private", not both');
  }

  const host = await resolveSshHost(hostArg, options);

  if (!host.identityFile) {
    throw new Error(`Host "${host.host}" has no IdentityFile`);
  }

  const keyPath = expandHome(host.identityFile);
  const revealPrivate = options.private === true;
  const targetPath = revealPrivate ? keyPath : `${keyPath}.pub`;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`File not found: ${targetPath}`);
  }

  console.log(
    chalk.green(`Revealing ${revealPrivate ? "private key" : "public key"}:`),
  );
  console.log(chalk.gray(targetPath));

  await execa("open", ["-R", targetPath]);
}
