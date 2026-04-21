#!/usr/bin/env node
/**
 * preinstall: require pnpm, or offer to re-run the install-like command with pnpm.
 * Exits non-zero after a successful delegated pnpm install so npm/yarn/bun do not continue.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

function isPnpm() {
  const ua = process.env.npm_config_user_agent || '';
  if (/\bpnpm\b/i.test(ua)) return true;
  const execPath = process.env.npm_execpath || '';
  if (execPath.includes('pnpm')) return true;
  return false;
}

function isCI() {
  return Boolean(
    process.env.CI ||
      process.env.CONTINUOUS_INTEGRATION ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.JENKINS_URL,
  );
}

function inferPnpmArgs() {
  let original = [];
  try {
    original = JSON.parse(process.env.npm_config_argv || '{}').original || [];
  } catch {
    /* ignore */
  }

  if (original.length === 0) {
    return ['install'];
  }

  const cmd = original[0];
  const rest = original.slice(1);

  if (cmd === 'install' || cmd === 'i' || cmd === 'in' || cmd === 'add' || cmd === 'a') {
    if (cmd === 'add' || cmd === 'a') {
      return ['add', ...rest];
    }
    return ['install', ...rest];
  }

  if (cmd === 'ci') {
    return ['install', '--frozen-lockfile', ...rest];
  }

  if (cmd === 'remove' || cmd === 'rm' || cmd === 'uninstall' || cmd === 'un') {
    return ['remove', ...rest];
  }

  return ['install', ...rest];
}

function promptYnCancel(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
  });

  return new Promise((resolve) => {
    const ask = () => {
      rl.question(question, (answer) => {
        const a = (answer ?? '').trim().toLowerCase();
        if (a === '' || a === 'y' || a === 'yes') {
          rl.close();
          resolve('yes');
          return;
        }
        if (a === 'n' || a === 'no') {
          rl.close();
          resolve('no');
          return;
        }
        if (a === 'cancel') {
          rl.close();
          resolve('cancel');
          return;
        }
        process.stderr.write('Type y, n, or cancel.\n');
        ask();
      });
    };
    ask();
  });
}

function promptRunPnpm(args) {
  const cmdLine = `pnpm ${args.join(' ')}`.trim();
  return promptYnCancel(
    `Run this with pnpm instead? [Y/n/cancel] (default: yes) → ${cmdLine}\n> `,
  );
}

function projectRoot() {
  return process.env.INIT_CWD || process.cwd();
}

/** Remove artifacts from a non-pnpm install so pnpm can own the tree. */
function removeWrongPmArtifacts(root) {
  const candidates = [
    path.join(root, 'node_modules'),
    path.join(root, 'package-lock.json'),
    path.join(root, 'npm-shrinkwrap.json'),
    path.join(root, 'yarn.lock'),
    path.join(root, 'bun.lockb'),
    path.join(root, 'bun.lock'),
  ];
  const removed = [];
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue;
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        fs.rmSync(p, { recursive: true, force: true });
      } else {
        fs.unlinkSync(p);
      }
      removed.push(path.relative(root, p) || p);
    } catch (err) {
      console.error(`Could not remove ${p}: ${err.message}`);
    }
  }
  return removed;
}

async function main() {
  if (isPnpm()) {
    process.exit(0);
  }

  const banner =
    'This app is set up for pnpm only. Using npm, yarn, bun, or another client can break the lockfile and node_modules layout.';

  // npm v7+ often runs root `preinstall` only after it has already fetched dependencies, so a
  // `postinstall` guard is the reliable way to fail the install when the wrong client was used.
  const lifecycle = process.env.npm_lifecycle_event || '';
  if (lifecycle === 'postinstall') {
    const root = projectRoot();
    console.error(`\n${banner}\n`);
    console.error(
      'Cleaning up non-pnpm artifacts (node_modules, npm/yarn/bun lockfiles) under:\n',
      `${root}\n`,
    );
    const removed = removeWrongPmArtifacts(root);
    if (removed.length > 0) {
      console.error(`Removed: ${removed.join(', ')}\n`);
    } else {
      console.error('(Nothing to remove.)\n');
    }

    if (isCI() || !process.stdin.isTTY) {
      console.error(`Use: pnpm ${inferPnpmArgs().join(' ')}\n`);
      process.exit(1);
    }

    const choice = await promptYnCancel(
      'Run pnpm install now? [Y/n/cancel] (default: yes)\n> ',
    );

    if (choice === 'no' || choice === 'cancel') {
      console.error(
        '\nRun manually when ready, from the project root: pnpm install\n',
      );
      process.exit(1);
    }

    const pnpmArgs = inferPnpmArgs();
    const result = spawnSync('pnpm', pnpmArgs, {
      stdio: 'inherit',
      shell: false,
      env: process.env,
      cwd: root,
    });

    if (result.error) {
      console.error('\nCould not run pnpm. Is it installed and on your PATH?\n');
      process.exit(1);
    }

    const code = result.status ?? 1;
    if (code !== 0) {
      process.exit(code);
    }

    console.error('\npnpm finished successfully.\n');
    process.exit(0);
  }

  if (isCI() || !process.stdin.isTTY) {
    console.error(banner);
    console.error(`Use: pnpm ${inferPnpmArgs().join(' ')}`);
    process.exit(1);
  }

  console.error(`\n${banner}\n`);

  const pnpmArgs = inferPnpmArgs();
  const choice = await promptRunPnpm(pnpmArgs);

  if (choice === 'no' || choice === 'cancel') {
    console.error(
      '\nAborted. When you are ready, run the same step with pnpm (e.g. pnpm install).\n',
    );
    process.exit(1);
  }

  const result = spawnSync('pnpm', pnpmArgs, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.error) {
    console.error('\nCould not run pnpm. Is it installed and on your PATH?\n');
    process.exit(1);
  }

  const code = result.status ?? 1;
  if (code !== 0) {
    process.exit(code);
  }

  console.error(
    '\npnpm finished successfully. Stopping the other package manager with a non-zero exit so it does not run a second, conflicting install.\n',
  );
  process.exit(1);
}

main();
