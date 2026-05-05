export function rewriteGitUrlWithHost(url: string, hostAlias: string): string {
  const scpLike = url.match(/^git@([^:]+):(.+)$/);

  if (scpLike) {
    return `git@${hostAlias}:${scpLike[2]}`;
  }

  const sshUrl = url.match(/^ssh:\/\/git@([^/]+)\/(.+)$/);

  if (sshUrl) {
    return `git@${hostAlias}:${sshUrl[2]}`;
  }

  throw new Error(
    "Unsupported git URL. Use format: git@github.com:org/repo.git",
  );
}

export function extractHostAliasFromGitUrl(url: string): string | null {
  const scpLike = url.match(/^git@([^:]+):(.+)$/);

  if (scpLike) {
    return scpLike[1];
  }

  const sshUrl = url.match(/^ssh:\/\/git@([^/]+)\/(.+)$/);

  if (sshUrl) {
    return sshUrl[1];
  }

  return null;
}
