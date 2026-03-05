import { Input } from '../src/input.js';
import { run } from '../src/run.js';

const SECONDS = 1000;

describe('run', () => {
  it.each([
    {
      name: 'rust-tests-fmt-warnings',
      input: {
        toolchain: 'nightly',
        args: [],
        workingDirectory: 'rust_tests/fmt_warnings',
      },
    },
  ])(
    '$name',
    async ({ input }: { input: Input }) => {
      const inputWithoutCache: Input = {
        ...input,
        ...(!process.env.CI && { cacheKey: 'no-cache' }),
      };

      await expect(run(inputWithoutCache)).rejects.toThrow();
    },
    240 * SECONDS,
  );
});
