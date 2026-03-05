export interface SummaryContext {
    rustc: string;
    cargo: string;
    rustfmt: string;
}
export declare class CheckRunner {
    private _rootDirectory;
    private _fileAnnotations;
    private _annotationsCount;
    constructor(rootDirectory: string);
    get annotationsCount(): number;
    tryPush(line: string): void;
    addSummary(context: SummaryContext): Promise<void>;
    private addAnnotations;
    private annotationTitle;
    private linesMsg;
    private replacementLinesMsg;
}
