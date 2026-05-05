#!/usr/bin/env node

import { Command } from "commander";
import { listCommand } from "./commands/list.js";
import { cloneCommand } from "./commands/clone.js";
import { testCommand } from "./commands/test.js";
import { statusCommand } from "./commands/status.js";
import { installShellCommand } from "./commands/installShell.js";
import { useCommand } from "./commands/use.js";
import { doctorCommand } from "./commands/doctor.js";
import { fixCommand } from "./commands/fix.js";
import { agentAddCommand } from "./commands/agentAdd.js";
import { generateCommand } from "./commands/generate.js";
import { openCommand } from "./commands/open.js";
import { copyPubCommand } from "./commands/copyPub.js";
import { revealCommand } from "./commands/reveal.js";
import { showCommand } from "./commands/show.js";

const program = new Command();

program
  .name("gitkey")
  .description("SSH profile manager for Git keys")
  .version("0.1.0");

program
  .command("list")
  .description("List SSH hosts from ~/.ssh/config")
  .action(listCommand);

program
  .command("clone")
  .argument("[url]", "Git SSH URL")
  .description("Clone repo using selected SSH host profile")
  .action(cloneCommand);

program
  .command("test")
  .argument("[host]", "SSH host alias")
  .description("Test SSH connection")
  .action(testCommand);

program
  .command("status")
  .description("Show current Git SSH profile")
  .option("--prompt", "Output compact prompt status")
  .action(statusCommand);

program
  .command("install-shell")
  .description("Install zsh right prompt integration")
  .action(installShellCommand);

program
  .command("use")
  .argument("[remote]", "Git remote name", "origin")
  .description("Switch current repo remote to selected SSH profile")
  .action(useCommand);

program
  .command("doctor")
  .description("Check SSH config, keys and agent health")
  .action(doctorCommand);

program
  .command("fix")
  .description("Fix SSH folder, config and key permissions")
  .action(fixCommand);

program
  .command("agent-add")
  .argument("[host]", "SSH host alias")
  .description("Add selected SSH key to ssh-agent and macOS Keychain")
  .action(agentAddCommand);

program
  .command("generate")
  .description("Generate SSH key, add to agent and optionally create Host")
  .action(generateCommand);

program
  .command("open")
  .argument("[host]", "SSH host alias")
  .option("-c, --current", "Use SSH profile from current repository origin")
  .option("--pub", "Open public key")
  .option("--private", "Open private key")
  .description("Open SSH key file (public by default)")
  .action(openCommand);

program
  .command("copy-pub")
  .argument("[host]", "SSH host alias")
  .option("-c, --current", "Use SSH profile from current repository origin")
  .description("Copy public key to clipboard")
  .action(copyPubCommand);

program
  .command("reveal")
  .argument("[host]", "SSH host alias")
  .option("-c, --current", "Use SSH profile from current repository origin")
  .option("--pub", "Reveal public key")
  .option("--private", "Reveal private key")
  .description("Reveal SSH key file in Finder (public by default)")
  .action(revealCommand);

program
  .command("show")
  .argument("[host]", "SSH host alias")
  .option("-c, --current", "Use SSH profile from current repository origin")
  .option("--pub", "Show public key")
  .option("--private", "Show private key")
  .description("Print SSH key content (public by default)")
  .action(showCommand);

program.parse();
