import * as core from '@actions/core';

interface Suggestion {
  name: string;
  mismatches: Mismatch[];
}

interface Mismatch {
  original_begin_line: number;
  original_end_line: number;
  expected_begin_line: number;
  expected_end_line: number;
  original: string;
  expected: string;
}

export interface SummaryContext {
  rustc: string;
  cargo: string;
  rustfmt: string;
}

export class CheckRunner {
  private rootDirectory: string;
  private suggestions: number;

  constructor(rootDirectory: string) {
    this.rootDirectory = `${rootDirectory}/`;
    this.suggestions = 0;
  }

  public tryPush(line: string): void {
    let contents: Suggestion[];
    try {
      contents = JSON.parse(line);
    } catch (error) {
      core.debug('Not JSON, ignoring it');
      return;
    }

    this.addAnnotations(contents);
  }

  public async addSummary(context: SummaryContext): Promise<void> {
    core.info(`Rustfmt results: ${this.suggestions} suggestions`);

    return core.summary
      .addHeading('Results')
      .addTable([
        [
          { data: 'Message kind', header: true },
          { data: 'Amount', header: true },
        ],
        ['Suggestions', `${this.suggestions}`],
      ])
      .addHeading('Versions')
      .addList([context.rustc, context.cargo, context.rustfmt])
      .write()
      .then((_summary) => {});
  }

  private addAnnotations(contents: Suggestion[]): void {
    contents.forEach((suggestion) => {
      // Fix file_name to remove root directory
      const fileName = suggestion.name.replace(this.rootDirectory, '');

      suggestion.mismatches.forEach((mismatch) => {
        const properties: core.AnnotationProperties = {
          file: fileName,
          startLine: mismatch.original_begin_line,
          endLine: mismatch.original_end_line,
        };

        this.suggestions += 1;
        core.warning(mismatch.expected, properties);
      });
    });
  }
}
