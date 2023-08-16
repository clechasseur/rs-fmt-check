/**
 * Parse action input into a some proper thing.
 */

import { input } from '@clechasseur/rs-actions-core';

import stringArgv from 'string-argv';

// Parsed action input
export interface Input {
  toolchain: string;
  args: string[];
  workingDirectory?: string;
}

export function get(): Input {
  const args = stringArgv(input.getInput('args'));
  let toolchain = input.getInput('toolchain');
  if (toolchain.startsWith('+')) {
    toolchain = toolchain.slice(1);
  }
  const workingDirectory = input.getInput('working-directory');

  return {
    args,
    toolchain,
    workingDirectory: workingDirectory || undefined,
  };
}
