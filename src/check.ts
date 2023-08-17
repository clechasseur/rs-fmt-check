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

interface FileAnnotations {
  fileName: string;
  annotations: FileAnnotation[];
}

interface FileAnnotation {
  title: string;
  beginLine: number;
  endLine: number;
  content: string;
}

export interface SummaryContext {
  rustc: string;
  cargo: string;
  rustfmt: string;
}

export class CheckRunner {
  private rootDirectory: string;
  private fileAnnotations: Array<FileAnnotations>;
  private annotationsCount: number;

  constructor(rootDirectory: string) {
    this.rootDirectory = `${rootDirectory}/`;
    this.fileAnnotations = [];
    this.annotationsCount = 0;
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
    core.info(`Rustfmt results: ${this.annotationsCount} annotations`);

    // Add all the annotations now. It is limited to 10, but it's better than nothing.
    // All annotations will also be included in the summary, below.
    // For more information, see https://docs.github.com/en/rest/checks/runs?apiVersion=2022-11-28
    this.fileAnnotations.forEach((fileAnnotations) => {
      fileAnnotations.annotations.forEach((fileAnnotation) => {
        const properties: core.AnnotationProperties = {
          title: fileAnnotation.title,
          file: fileAnnotations.fileName,
          startLine: fileAnnotation.beginLine,
          endLine: fileAnnotation.endLine,
        };

        core.warning(fileAnnotation.content, properties);
      });
    });

    // Now generate the summary with all annotations included.
    core.summary.addHeading('Results');
    for (const fileAnnotations of this.fileAnnotations) {
      const label = `\`${fileAnnotations.fileName}\``;
      const content = fileAnnotations.annotations
        .map((fileAnnotation) => {
          const linesMsg = this.linesMsg(
            fileAnnotation.beginLine,
            fileAnnotation.endLine,
            true,
          );

          return `#### ${linesMsg}\n\n\`\`\`\n${fileAnnotation.content}\n\`\`\`\n`;
        })
        .join('\n');

      core.summary.addDetails(label, content);
    }

    return core.summary
      .addHeading('Versions')
      .addList([context.rustc, context.cargo, context.rustfmt])
      .write()
      .then((_summary) => {});
  }

  private addAnnotations(contents: Suggestion[]): void {
    contents.forEach((suggestion) => {
      const fileAnnotations: FileAnnotations = {
        // Fix file_name to remove root directory
        fileName: suggestion.name.replace(this.rootDirectory, ''),
        annotations: suggestion.mismatches.map((mismatch) => ({
          title: this.annotationTitle(mismatch),
          beginLine: mismatch.original_begin_line,
          endLine: mismatch.original_end_line,
          content: mismatch.expected,
        })),
      };

      this.fileAnnotations.push(fileAnnotations);
      this.annotationsCount += fileAnnotations.annotations.length;
    });
  }

  private annotationTitle(mismatch: Mismatch): string {
    const linesMsg = this.linesMsg(
      mismatch.original_begin_line,
      mismatch.original_end_line,
    );
    const replacementLinesMsg = this.replacementLinesMsg(mismatch);
    return `Suggested formatting at ${linesMsg} (replaced with ${replacementLinesMsg})`;
  }

  private linesMsg(
    beginLine: number,
    endLine: number,
    capitalize: boolean = false,
  ): string {
    const firstLetter = capitalize ? 'L' : 'l';
    return beginLine == endLine
      ? `${firstLetter}ine ${beginLine}`
      : `${firstLetter}ines ${beginLine}-${endLine}`;
  }

  private replacementLinesMsg(mismatch: Mismatch): string {
    const replacementLines =
      mismatch.expected_end_line - mismatch.expected_begin_line + 1;
    return `${replacementLines} line${replacementLines > 1 ? 's' : ''}`;
  }
}
