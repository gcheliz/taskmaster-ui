import { StepExecutor } from '../types';
import { AgentStepExecutor } from './AgentStepExecutor';
import { CommandStepExecutor } from './CommandStepExecutor';
import { ConditionStepExecutor } from './ConditionStepExecutor';
import { ParallelStepExecutor } from './ParallelStepExecutor';
import { SequentialStepExecutor } from './SequentialStepExecutor';

export class StepExecutorFactory {
  private executors: Map<string, StepExecutor>;

  constructor() {
    this.executors = new Map();
    this.registerDefaultExecutors();
  }

  private registerDefaultExecutors(): void {
    this.executors.set('agent', new AgentStepExecutor());
    this.executors.set('command', new CommandStepExecutor());
    this.executors.set('condition', new ConditionStepExecutor());
    this.executors.set('parallel', new ParallelStepExecutor(this));
    this.executors.set('sequential', new SequentialStepExecutor(this));
  }

  getExecutor(type: string): StepExecutor {
    const executor = this.executors.get(type);
    if (!executor) {
      throw new Error(`No executor registered for step type: ${type}`);
    }
    return executor;
  }

  registerExecutor(type: string, executor: StepExecutor): void {
    this.executors.set(type, executor);
  }
}
