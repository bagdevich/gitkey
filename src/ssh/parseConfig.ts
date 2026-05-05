import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type SshHost = {
  host: string;
  hostName?: string;
  user?: string;
  identityFile?: string;
};

export function getSshConfigPath() {
  return path.join(os.homedir(), ".ssh", "config");
}

export function parseSshConfigContent(content: string): SshHost[] {
  const lines = content.split(/\r?\n/);

  const hosts: SshHost[] = [];
  let current: SshHost | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) continue;

    const [key, ...rest] = line.split(/\s+/);
    const value = rest.join(" ");

    if (key.toLowerCase() === "host") {
      if (current) hosts.push(current);
      current = { host: value };
      continue;
    }

    if (!current) continue;

    switch (key.toLowerCase()) {
      case "hostname":
        current.hostName = value;
        break;
      case "user":
        current.user = value;
        break;
      case "identityfile":
        current.identityFile = value;
        break;
    }
  }

  if (current) hosts.push(current);

  return hosts;
}

export function parseSshConfig(): SshHost[] {
  const configPath = getSshConfigPath();

  if (!fs.existsSync(configPath)) {
    return [];
  }

  const content = fs.readFileSync(configPath, "utf8");

  return parseSshConfigContent(content);
}
