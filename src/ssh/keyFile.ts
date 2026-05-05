import { expandHome } from "./path.js";

export type KeyFileOptions = {
  pub?: boolean;
  private?: boolean;
};

export function resolveKeyFile(identityFile: string, options: KeyFileOptions) {
  if (options.pub && options.private) {
    throw new Error('Use either "--pub" or "--private", not both');
  }

  const visibility = options.private ? "private" : "public";
  const privatePath = expandHome(identityFile);
  const filePath =
    visibility === "private" ? privatePath : `${privatePath}.pub`;

  return { filePath, visibility };
}
