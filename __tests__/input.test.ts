import * as input from '../src/input.js';

const testEnvVars = {
  INPUT_TOOLCHAIN: '+nightly',
  // There are few unnecessary spaces here to check that args parser works properly
  INPUT_ARGS: '    --all   --message-format    human     ',
  'INPUT_WORKING-DIRECTORY': 'rust_tests/fmt_warnings',
};

describe('input', () => {
  beforeEach(() => {
    for (const key in testEnvVars) {
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars];
    }
  });

  it('Parses action input into rs-fmt-check input', () => {
    const result = input.get();

    expect(result.toolchain).toBe('nightly');
    expect(result.args).toStrictEqual(['--all', '--message-format', 'human']);
    expect(result.workingDirectory).toBe('rust_tests/fmt_warnings');
  });
});
