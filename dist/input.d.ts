/**
 * Parse action input into a some proper thing.
 */
export interface Input {
    toolchain: string;
    args: string[];
    workingDirectory?: string;
}
export declare function get(): Input;
