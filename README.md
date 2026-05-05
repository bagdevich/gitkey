# gitkey

CLI for managing Git SSH profiles, SSH keys, and repository remotes.

`gitkey` helps you work with multiple GitHub/Bitbucket SSH identities without manually editing `~/.ssh/config` every time.

## Features

- List SSH profiles from `~/.ssh/config`
- Clone repositories using a selected SSH host alias
- Switch existing repo remotes to another SSH profile
- Show current repo SSH profile in terminal
- Install zsh right-prompt integration
- Generate new SSH keys
- Add keys to `ssh-agent` and macOS Keychain
- Check and fix SSH config/key permissions

## Installation

```bash
npm install -g @iceworkout/gitkey