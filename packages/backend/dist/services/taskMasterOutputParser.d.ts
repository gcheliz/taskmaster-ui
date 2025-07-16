import { ParsedTaskMasterOutput, TaskInfo, ProjectInfo, ITaskMasterOutputParser } from '../types/taskMaster';
/**
 * Strategy Pattern Implementation for Output Parsing
 * Demonstrates: Strategy pattern, regex parsing, data extraction
 */
interface IParsingStrategy {
    canParse(output: string, command: string): boolean;
    parse(output: string): ParsedTaskMasterOutput[];
}
/**
 * Main Output Parser using Strategy Pattern
 */
export declare class TaskMasterOutputParser implements ITaskMasterOutputParser {
    private strategies;
    /**
     * Parse output using appropriate strategy
     */
    parseOutput(rawOutput: string, command: string): ParsedTaskMasterOutput[];
    /**
     * Extract task information from output
     */
    extractTaskInfo(output: string): TaskInfo | null;
    /**
     * Extract multiple tasks from list output
     */
    extractTaskList(output: string): TaskInfo[];
    /**
     * Extract complexity analysis data
     */
    extractComplexityAnalysis(output: string): any;
    /**
     * Extract next task recommendation
     */
    extractNextTask(output: string): TaskInfo | null;
    /**
     * Extract operation result (for actions like init, expand, parse-prd)
     */
    extractOperationResult(output: string, operation: string): any;
    /**
     * Extract project information from output
     */
    extractProjectInfo(output: string): ProjectInfo | null;
    /**
     * Check if output indicates an error
     */
    isErrorOutput(output: string): boolean;
    /**
     * Add a custom parsing strategy
     */
    addStrategy(strategy: IParsingStrategy): void;
}
export declare const taskMasterOutputParser: TaskMasterOutputParser;
export {};
//# sourceMappingURL=taskMasterOutputParser.d.ts.map