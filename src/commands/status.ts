import chalk from "chalk";
import { getRemoteUrl } from "../git/getRemoteUrl.js";
import { extractHostAliasFromGitUrl } from "../ssh/gitUrl.js";
import { parseSshConfig } from "../ssh/parseConfig.js";

type StatusOptions = {
  prompt?: boolean;
};

export async function statusCommand(options: StatusOptions) {
  const remoteUrl = await getRemoteUrl("origin");

  if (!remoteUrl) {
    if (!options.prompt) {
      console.log(chalk.gray("No git remote found"));
    }
    return;
  }

  const hostAlias = extractHostAliasFromGitUrl(remoteUrl);

  if (!hostAlias) {
    if (!options.prompt) {
      console.log(chalk.gray("Remote is not SSH URL"));
    }
    return;
  }

  const host = parseSshConfig().find((h) => h.host === hostAlias);

  if (options.prompt) {
    if (host) {
      process.stdout.write(`🔑 ${host.host}`);
    }
    return;
  }

  if (!host) {
    console.log(chalk.yellow(`SSH host alias: ${hostAlias}`));
    console.log(chalk.gray("But it was not found in ~/.ssh/config"));
    return;
  }

  console.log(chalk.green("Git SSH profile:"));
  console.log(`${chalk.cyan(host.host)} → ${host.hostName ?? "-"}`);
  console.log(chalk.gray(host.identityFile ?? ""));
}
