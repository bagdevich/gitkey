# gitkey

[![npm version](https://img.shields.io/npm/v/%40bagdevich%2Fgitkey)](https://www.npmjs.com/package/@bagdevich/gitkey)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-macOS-black)](#limitations)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

> Stop editing `~/.ssh/config` manually.

`gitkey` is a CLI for managing SSH keys and Git profiles.
It helps you work with multiple GitHub and Bitbucket accounts without manually juggling SSH config, remotes, and agent state.

## Contents

- [Why](#why)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)
- [Zsh Prompt Integration](#zsh-prompt-integration)
- [Development](#development)
- [Limitations](#limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Why

If you use multiple Git accounts across work, personal projects, or different providers, you have probably hit at least one of these:

- `Permission denied (publickey)`
- the wrong SSH key is being used
- manual edits in `~/.ssh/config`
- confusing `ssh-agent` state

`gitkey` gives you a small CLI to manage that workflow in one place.

## Features

- Manage SSH profiles from `~/.ssh/config`
- Clone repositories with profile selection
- Switch the SSH profile used by an existing repo
- Show the active SSH profile for the current repository
- Diagnose SSH setup with `doctor`
- Auto-fix common permission issues with `fix`
- Generate new SSH keys
- Add keys to `ssh-agent` and macOS Keychain
- Install zsh right-prompt integration

## Requirements

- Node.js `>=18`
- `git`
- OpenSSH tools such as `ssh`, `ssh-add`, and `ssh-keygen`
- `zsh` if you want prompt integration
- macOS for the best supported experience today

## Installation

```bash
npm install -g @bagdevich/gitkey
```

## Usage

List SSH profiles:

```bash
gitkey list
```

Clone a repository with a selected SSH profile:

```bash
gitkey clone git@github.com:org/repo.git
```

Switch SSH profile in the current repository:

```bash
gitkey use
```

Switch a specific remote:

```bash
gitkey use origin
```

Show current SSH profile:

```bash
gitkey status
```

Prompt-friendly output:

```bash
gitkey status --prompt
```

Run diagnostics:

```bash
gitkey doctor
```

Fix common SSH issues:

```bash
gitkey fix
```

Add a key to `ssh-agent`:

```bash
gitkey agent-add
```

Generate a new SSH key:

```bash
gitkey generate
```

Test an SSH connection:

```bash
gitkey test
```

## Example

Given this SSH config:

```sshconfig
Host keyName
  HostName github.com
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/keyNamegit
  IdentitiesOnly yes
```

Instead of:

```bash
git clone git@github.com:org/repo.git
```

You can run:

```bash
gitkey clone git@github.com:org/repo.git
```

Select:

```text
keyName -> github.com ~/.ssh/keyNamegit
```

And `gitkey` will execute:

```bash
git clone git@keyName:org/repo.git
```

## Zsh Prompt Integration

Install:

```bash
gitkey install-shell
source ~/.zshrc
```

Inside a Git repository, your prompt can show:

```text
🔑 keyName
```

## Development

```bash
git clone git@github.com:bagdevich/gitkey.git
cd gitkey

npm install
npm run dev -- list
```

Build:

```bash
npm run build
npm link
gitkey list
```

## Limitations

- `agent-add`, `generate`, and `install-shell` are currently optimized for macOS.
- Prompt integration currently targets `zsh`.
- SSH profiles are expected to be defined in `~/.ssh/config`.

## Roadmap

- convert HTTPS remotes to SSH
- extended repo info
- test all profiles
- prune unused keys
- Windows support

## Contributing

Pull requests are welcome.

If you find a bug or have an idea, open an issue.
