import { WorkflowInstanceRepository, WorkflowInstance } from '../types';

export class InMemoryWorkflowInstanceRepository
  implements WorkflowInstanceRepository
{
  private instances: Map<string, WorkflowInstance>;

  constructor() {
    this.instances = new Map();
  }

  async save(instance: WorkflowInstance): Promise<void> {
    this.instances.set(instance.id, { ...instance });
  }

  async get(id: string): Promise<WorkflowInstance | null> {
    const instance = this.instances.get(id);
    return instance ? { ...instance } : null;
  }

  async list(filters?: Partial<WorkflowInstance>): Promise<WorkflowInstance[]> {
    let instances = Array.from(this.instances.values());

    if (filters) {
      instances = instances.filter(instance => {
        for (const [key, value] of Object.entries(filters)) {
          if (instance[key as keyof WorkflowInstance] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    return instances.map(instance => ({ ...instance }));
  }

  async update(id: string, updates: Partial<WorkflowInstance>): Promise<void> {
    const instance = this.instances.get(id);
    if (!instance) {
      throw new Error(`Workflow instance ${id} not found`);
    }

    this.instances.set(id, { ...instance, ...updates });
  }

  async delete(id: string): Promise<void> {
    this.instances.delete(id);
  }
}
