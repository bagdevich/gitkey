import { execa } from "execa";

export async function getRemoteUrl(remote = "origin"): Promise<string | null> {
  try {
    const result = await execa("git", ["remote", "get-url", remote], {
      reject: false,
    });

    if (result.exitCode !== 0) return null;

    return result.stdout.trim() || null;
  } catch {
    return null;
  }
}
