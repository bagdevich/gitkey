import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";

const BLOCK_START = "# >>> gitkey prompt";
const BLOCK_END = "# <<< gitkey prompt";

const ZSH_BLOCK = `
${BLOCK_START}
autoload -Uz add-zsh-hook

_gitkey_prompt() {
  local status
  status="$(gitkey status --prompt 2>/dev/null)"

  if [[ -n "$status" ]]; then
    RPROMPT="%F{240}$status%f"
  else
    RPROMPT=""
  fi
}

add-zsh-hook precmd _gitkey_prompt
${BLOCK_END}
`;

export function installShellCommand() {
  const zshrcPath = path.join(os.homedir(), ".zshrc");

  const current = fs.existsSync(zshrcPath)
    ? fs.readFileSync(zshrcPath, "utf8")
    : "";

  if (current.includes(BLOCK_START)) {
    console.log(chalk.yellow("gitkey prompt is already installed in ~/.zshrc"));
    return;
  }

  fs.writeFileSync(zshrcPath, `${current.trimEnd()}\n\n${ZSH_BLOCK}\n`);

  console.log(chalk.green("Installed gitkey prompt into ~/.zshrc"));
  console.log(chalk.gray("Restart terminal or run: source ~/.zshrc"));
}
