# ctf-scoring-ephemeral-mru

Initialized using [@stackr/sdk](https://www.stackrlabs.xyz/).

It is an Ephemeral Micro-Rollup that can be used as a Scoring System for games like Capture The Flag.

Ephemeral rollups are short-lived i.e. only for the duration of the game but preserve state roots and tx data on the L1 for future retraceability and verifiability of user's data (in this case, game score). Learn more about Ephemeral rollups [here](https://mirror.xyz/stackrlabs.eth/B-3hUw4Y8L3yWAqzsYWn9KddwluR0oZSHZ3c4K7r9VY).

> A video demo is available [here](https://twitter.com/zkcat_eth/status/1776645571928850770).

## Usage

### Setup

- `cp .env.example .env`
- Add values in `.env`.
- Add an address to the `admins` list in `genesis-state.json` file. This should be the same `ADDRESS` you added in `.env`.

### Install

```bash
$ stackr register
$ stackr deploy
```

### Run

```bash
$ bun run src/cli.ts
```
