import fs from "node:fs";
import chalk from "chalk";
import { resolveSshHost } from "../ssh/resolveHost.js";
import { expandHome } from "../ssh/path.js";

type ShowOptions = {
  current?: boolean;
  pub?: boolean;
  private?: boolean;
};

export async function showCommand(
  hostArg: string | undefined,
  options: ShowOptions,
) {
  if (options.pub && options.private) {
    throw new Error('Use either "--pub" or "--private", not both');
  }

  const host = await resolveSshHost(hostArg, options);

  if (!host.identityFile) {
    throw new Error(`Host "${host.host}" has no IdentityFile`);
  }

  const keyPath = expandHome(host.identityFile);
  const showPrivate = options.private === true;
  const targetPath = showPrivate ? keyPath : `${keyPath}.pub`;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`File not found: ${targetPath}`);
  }

  console.log(
    chalk.green(`${host.host} → ${showPrivate ? "private key" : "public key"}`),
  );
  console.log(chalk.gray(targetPath));
  console.log("");

  console.log(fs.readFileSync(targetPath, "utf8"));
}
