import { WorkflowRepository, WorkflowTemplate, WorkflowType } from '../types';

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private templates: Map<string, WorkflowTemplate>;

  constructor() {
    this.templates = new Map();
  }

  async getTemplate(id: string): Promise<WorkflowTemplate | null> {
    return this.templates.get(id) || null;
  }

  async getTemplateByType(type: WorkflowType): Promise<WorkflowTemplate[]> {
    const templates: WorkflowTemplate[] = [];

    for (const template of this.templates.values()) {
      if (template.type === type) {
        templates.push(template);
      }
    }

    return templates;
  }

  async saveTemplate(template: WorkflowTemplate): Promise<void> {
    this.templates.set(template.id, template);
  }

  async deleteTemplate(id: string): Promise<void> {
    this.templates.delete(id);
  }

  async listTemplates(): Promise<WorkflowTemplate[]> {
    return Array.from(this.templates.values());
  }
}
