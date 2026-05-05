import { select } from "@inquirer/prompts";
import { getRemoteUrl } from "../git/getRemoteUrl.js";
import { extractHostAliasFromGitUrl } from "./gitUrl.js";
import { parseSshConfig, type SshHost } from "./parseConfig.js";

type ResolveOptions = {
  current?: boolean;
};

export async function resolveSshHost(
  hostArg?: string,
  options: ResolveOptions = {},
): Promise<SshHost> {
  const hosts = parseSshConfig().filter((h) => h.identityFile);

  if (!hosts.length) {
    throw new Error("No SSH hosts with IdentityFile found");
  }

  if (options.current) {
    const remoteUrl = await getRemoteUrl("origin");

    if (!remoteUrl) {
      throw new Error("No origin remote found in current repository");
    }

    const alias = extractHostAliasFromGitUrl(remoteUrl);

    if (!alias) {
      throw new Error("Current origin remote is not an SSH URL");
    }

    const host = hosts.find((h) => h.host === alias);

    if (!host) {
      throw new Error(`Host "${alias}" was not found in ~/.ssh/config`);
    }

    return host;
  }

  if (hostArg) {
    const host = hosts.find((h) => h.host === hostArg);

    if (!host) {
      throw new Error(`Host "${hostArg}" was not found in ~/.ssh/config`);
    }

    return host;
  }

  const selectedHost = await select({
    message: "Select SSH profile:",
    choices: hosts.map((h) => ({
      name: `${h.host} → ${h.identityFile}`,
      value: h.host,
    })),
  });

  const host = hosts.find((h) => h.host === selectedHost);

  if (!host) {
    throw new Error("Invalid host selected");
  }

  return host;
}
