import path from 'path';

import * as core from '@actions/core';
import * as exec from '@actions/exec';

import { Cargo, Cross } from '@clechasseur/rs-actions-core';
import * as input from './input';
import { CheckRunner } from './check';

export async function run(actionInput: input.Input): Promise<void> {
  let program;
  if (actionInput.useCross) {
    program = await Cross.getOrInstall();
  } else {
    program = await Cargo.get();
  }

  const toolchain = actionInput.toolchain ? `+${actionInput.toolchain}` : '';

  // TODO: Simplify this block
  let rustcVersion = '';
  let cargoVersion = '';
  let rustfmtVersion = '';
  await exec.exec('rustc', ['-V'], {
    silent: true,
    listeners: {
      stdout: (buffer: Buffer) => (rustcVersion = buffer.toString().trim()),
    },
  });
  await program.call(['-V'], {
    silent: true,
    listeners: {
      stdout: (buffer: Buffer) => (cargoVersion = buffer.toString().trim()),
    },
  });
  await program.call(['fmt', toolchain, '--version'], {
    silent: true,
    listeners: {
      stdout: (buffer: Buffer) => (rustfmtVersion = buffer.toString().trim()),
    },
  });

  let args: string[] = [];
  // Toolchain selection MUST go first in any condition
  if (toolchain) {
    args.push(toolchain);
  }
  args.push('fmt');
  // `--message-format=json` should be right after the `cargo fmt`
  // because usually people are adding the `-- ...` at the end
  // of arguments and it will mess up the output.
  args.push('--message-format=json');

  args = args.concat(actionInput.args);

  const runner = new CheckRunner(actionInput.workingDirectory);
  const options: exec.ExecOptions = {
    ignoreReturnCode: true,
    failOnStdErr: false,
    listeners: {
      stdline: (line: string) => {
        runner.tryPush(line);
      },
    },
  };
  if (actionInput.workingDirectory) {
    options.cwd = path.join(process.cwd(), actionInput.workingDirectory);
  }

  let fmtExitCode: number = 0;
  try {
    core.startGroup('Executing cargo fmt (JSON output)');
    fmtExitCode = await program.call(args, options);
  } finally {
    core.endGroup();
  }

  await runner.addSummary({
    rustc: rustcVersion,
    cargo: cargoVersion,
    rustfmt: rustfmtVersion,
  });

  if (fmtExitCode !== 0) {
    throw new Error(`Rustfmt has exited with exit code ${fmtExitCode}`);
  }
}

async function main(): Promise<void> {
  try {
    const actionInput = input.get();

    await run(actionInput);
  } catch (error) {
    core.setFailed((<Error>error).message);
  }
}

main();
