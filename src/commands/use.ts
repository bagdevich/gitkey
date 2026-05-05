import { select } from "@inquirer/prompts";
import { execa } from "execa";
import chalk from "chalk";
import { getRemoteUrl } from "../git/getRemoteUrl.js";
import { rewriteGitUrlWithHost } from "../ssh/gitUrl.js";
import { parseSshConfig } from "../ssh/parseConfig.js";

export async function useCommand(remote = "origin") {
  const currentUrl = await getRemoteUrl(remote);

  if (!currentUrl) {
    throw new Error(`No remote found: ${remote}`);
  }

  const hosts = parseSshConfig().filter(
    (h) => h.hostName === "github.com" || h.hostName === "bitbucket.org",
  );

  if (!hosts.length) {
    throw new Error("No Git hosts found in ~/.ssh/config");
  }

  const selectedHost = await select({
    message: `Select SSH profile for ${remote}:`,
    choices: hosts.map((h) => ({
      name: `${h.host} → ${h.hostName} ${h.identityFile ?? ""}`,
      value: h.host,
    })),
  });

  const newUrl = rewriteGitUrlWithHost(currentUrl, selectedHost);

  console.log(chalk.gray(`Current: ${currentUrl}`));
  console.log(chalk.green(`New:     ${newUrl}`));

  await execa("git", ["remote", "set-url", remote, newUrl], {
    stdio: "inherit",
  });

  console.log(chalk.green(`Updated ${remote}`));
}
