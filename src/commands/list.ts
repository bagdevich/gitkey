import chalk from "chalk";
import { parseSshConfig } from "../ssh/parseConfig.js";

export function listCommand() {
  const hosts = parseSshConfig();

  if (!hosts.length) {
    console.log(chalk.yellow("No hosts found in ~/.ssh/config"));
    return;
  }

  for (const item of hosts) {
    console.log(
      `${chalk.cyan(item.host)} ${chalk.gray("→")} ${item.hostName ?? "-"} ${chalk.gray(
        item.identityFile ?? "",
      )}`,
    );
  }
}
