import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { WorkflowTemplate } from '../types';
import { WorkflowValidator } from '../validators/WorkflowValidator';
import { logger } from '../../utils/logger';

export class YamlTemplateLoader {
  private validator: WorkflowValidator;

  constructor() {
    this.validator = new WorkflowValidator();
  }

  async loadFromFile(filePath: string): Promise<WorkflowTemplate> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const template = yaml.load(content) as WorkflowTemplate;

      // Validate the loaded template
      await this.validator.validateTemplate(template);

      return template;
    } catch (error) {
      logger.error('Failed to load workflow template from file', {
        error,
        filePath,
      });
      throw error;
    }
  }

  async loadFromString(yamlContent: string): Promise<WorkflowTemplate> {
    try {
      const template = yaml.load(yamlContent) as WorkflowTemplate;

      // Validate the loaded template
      await this.validator.validateTemplate(template);

      return template;
    } catch (error) {
      logger.error('Failed to parse workflow template', { error });
      throw error;
    }
  }

  async loadFromDirectory(
    dirPath: string,
    onLoad?: (template: WorkflowTemplate) => Promise<void>
  ): Promise<WorkflowTemplate[]> {
    const templates: WorkflowTemplate[] = [];

    try {
      const files = await fs.readdir(dirPath);
      const yamlFiles = files.filter(
        file => file.endsWith('.yaml') || file.endsWith('.yml')
      );

      for (const file of yamlFiles) {
        try {
          const filePath = path.join(dirPath, file);
          const template = await this.loadFromFile(filePath);
          templates.push(template);

          if (onLoad) {
            await onLoad(template);
          }
        } catch (error) {
          logger.warn(`Failed to load template from ${file}`, { error });
        }
      }

      return templates;
    } catch (error) {
      logger.error('Failed to load workflow templates from directory', {
        error,
        dirPath,
      });
      return templates;
    }
  }

  async saveToFile(
    template: WorkflowTemplate,
    filePath: string
  ): Promise<void> {
    try {
      // Validate before saving
      await this.validator.validateTemplate(template);

      const yamlContent = yaml.dump(template, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
        sortKeys: false,
      });

      await fs.writeFile(filePath, yamlContent, 'utf-8');

      logger.info('Saved workflow template to file', {
        templateId: template.id,
        filePath,
      });
    } catch (error) {
      logger.error('Failed to save workflow template to file', {
        error,
        filePath,
      });
      throw error;
    }
  }
}
