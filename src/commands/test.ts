import { select } from "@inquirer/prompts";
import { execa } from "execa";
import chalk from "chalk";
import { parseSshConfig } from "../ssh/parseConfig.js";

export async function testCommand(hostArg?: string) {
  const hosts = parseSshConfig();

  const host =
    hostArg ??
    (await select({
      message: "Select host to test:",
      choices: hosts.map((h) => ({
        name: `${h.host} → ${h.hostName ?? "-"}`,
        value: h.host,
      })),
    }));

  console.log(chalk.green(`Testing ssh -T git@${host}`));

  await execa("ssh", ["-T", `git@${host}`], {
    stdio: "inherit",
  });
}
