import { select, input } from "@inquirer/prompts";
import { execa } from "execa";
import chalk from "chalk";
import { parseSshConfig } from "../ssh/parseConfig.js";
import { rewriteGitUrlWithHost } from "../ssh/gitUrl.js";

export async function cloneCommand(urlArg?: string) {
  const url =
    urlArg ??
    (await input({
      message: "Git SSH URL:",
      required: true,
    }));

  const hosts = parseSshConfig().filter(
    (h) => h.hostName === "github.com" || h.hostName === "bitbucket.org",
  );

  if (!hosts.length) {
    throw new Error("No Git hosts found in ~/.ssh/config");
  }

  const selectedHost = await select({
    message: "Select SSH profile:",
    choices: hosts.map((h) => ({
      name: `${h.host} → ${h.hostName} ${h.identityFile ?? ""}`,
      value: h.host,
    })),
  });

  const rewrittenUrl = rewriteGitUrlWithHost(url, selectedHost);

  console.log(chalk.green("Cloning with:"));
  console.log(chalk.gray(`git clone ${rewrittenUrl}`));

  await execa("git", ["clone", rewrittenUrl], {
    stdio: "inherit",
  });
}
