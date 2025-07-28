/**
 * API Documentation Plugin
 * 
 * Extracts and formats API documentation from TypeScript/JavaScript code
 * using JSDoc and TSDoc annotations
 */

import * as ts from 'typescript';
import {
  DocumentationPlugin,
  DocumentationType,
  PluginContext,
  DocumentationItem,
  SourceLocation,
  CodeExample
} from '../core-engine';

export class APIDocumentationPlugin implements DocumentationPlugin {
  name = 'api-documentation';
  type = DocumentationType.API;
  description = 'Extracts API documentation from JSDoc/TSDoc annotations';

  async generate(context: PluginContext): Promise<DocumentationItem[]> {
    const items: DocumentationItem[] = [];
    
    // Process each source file
    for (const [filePath, sourceFile] of context.astCache) {
      const fileItems = this.extractFromFile(sourceFile, filePath);
      items.push(...fileItems);
    }
    
    return items;
  }

  /**
   * Extract documentation from a single file
   */
  private extractFromFile(sourceFile: ts.SourceFile, filePath: string): DocumentationItem[] {
    const items: DocumentationItem[] = [];
    
    const visit = (node: ts.Node) => {
      // Extract documentation based on node type
      if (ts.isClassDeclaration(node) && node.name && this.isExported(node)) {
        const classDoc = this.extractClassDocumentation(node, filePath, sourceFile);
        if (classDoc) items.push(classDoc);
        
        // Extract class members
        node.members.forEach(member => {
          if (this.isPublicOrProtected(member)) {
            const memberDoc = this.extractMemberDocumentation(member, node.name!.text, filePath, sourceFile);
            if (memberDoc) items.push(memberDoc);
          }
        });
      } else if (ts.isFunctionDeclaration(node) && node.name && this.isExported(node)) {
        const funcDoc = this.extractFunctionDocumentation(node, filePath, sourceFile);
        if (funcDoc) items.push(funcDoc);
      } else if (ts.isInterfaceDeclaration(node) && this.isExported(node)) {
        const interfaceDoc = this.extractInterfaceDocumentation(node, filePath, sourceFile);
        if (interfaceDoc) items.push(interfaceDoc);
      } else if (ts.isTypeAliasDeclaration(node) && this.isExported(node)) {
        const typeDoc = this.extractTypeDocumentation(node, filePath, sourceFile);
        if (typeDoc) items.push(typeDoc);
      } else if (ts.isEnumDeclaration(node) && this.isExported(node)) {
        const enumDoc = this.extractEnumDocumentation(node, filePath, sourceFile);
        if (enumDoc) items.push(enumDoc);
      } else if (ts.isVariableStatement(node) && this.isExported(node)) {
        node.declarationList.declarations.forEach(decl => {
          if (ts.isIdentifier(decl.name)) {
            const varDoc = this.extractVariableDocumentation(decl, filePath, sourceFile, node);
            if (varDoc) items.push(varDoc);
          }
        });
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    
    return items;
  }

  /**
   * Extract class documentation
   */
  private extractClassDocumentation(
    node: ts.ClassDeclaration,
    filePath: string,
    sourceFile: ts.SourceFile
  ): DocumentationItem | null {
    if (!node.name) return null;
    
    const jsdoc = this.extractJSDoc(node, sourceFile);
    const location = this.getSourceLocation(node, sourceFile, filePath);
    
    return {
      id: `class-${node.name.text}`,
      name: node.name.text,
      type: 'class',
      description: jsdoc.description,
      category: jsdoc.category || 'Classes',
      tags: jsdoc.tags,
      source: location,
      examples: jsdoc.examples,
      seeAlso: jsdoc.seeAlso,
      metadata: {
        extends: this.getExtends(node),
        implements: this.getImplements(node),
        typeParameters: this.getTypeParameters(node),
        decorators: this.getDecorators(node),
        abstract: this.hasModifier(node, ts.SyntaxKind.AbstractKeyword),
        ...jsdoc.metadata
      }
    };
  }

  /**
   * Extract class member documentation
   */
  private extractMemberDocumentation(
    member: ts.ClassElement,
    className: string,
    filePath: string,
    sourceFile: ts.SourceFile
  ): DocumentationItem | null {
    let name: string | undefined;
    let type: string;
    let signature: string | undefined;
    
    if (ts.isMethodDeclaration(member) || ts.isMethodSignature(member)) {
      name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
      type = 'method';
      signature = this.getMethodSignature(member);
    } else if (ts.isPropertyDeclaration(member) || ts.isPropertySignature(member)) {
      name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
      type = 'property';
      signature = this.getPropertySignature(member);
    } else if (ts.isConstructorDeclaration(member)) {
      name = 'constructor';
      type = 'constructor';
      signature = this.getConstructorSignature(member);
    } else if (ts.isGetAccessorDeclaration(member)) {
      name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
      type = 'getter';
      signature = this.getAccessorSignature(member);
    } else if (ts.isSetAccessorDeclaration(member)) {
      name = member.name && ts.isIdentifier(member.name) ? member.name.text : undefined;
      type = 'setter';
      signature = this.getAccessorSignature(member);
    } else {
      return null;
    }
    
    if (!name) return null;
    
    const jsdoc = this.extractJSDoc(member, sourceFile);
    const location = this.getSourceLocation(member, sourceFile, filePath);
    
    return {
      id: `${className}-${name}`,
      name: `${className}.${name}`,
      type,
      description: jsdoc.description,
      category: `${className} Members`,
      tags: jsdoc.tags,
      source: location,
      examples: jsdoc.examples,
      seeAlso: jsdoc.seeAlso,
      metadata: {
        signature,
        parameters: jsdoc.parameters,
        returns: jsdoc.returns,
        throws: jsdoc.throws,
        static: this.hasModifier(member, ts.SyntaxKind.StaticKeyword),
        readonly: this.hasModifier(member, ts.SyntaxKind.ReadonlyKeyword),
        abstract: this.hasModifier(member, ts.SyntaxKind.AbstractKeyword),
        async: this.hasModifier(member, ts.SyntaxKind.AsyncKeyword),
        visibility: this.getVisibility(member),
        ...jsdoc.metadata
      }
    };
  }

  /**
   * Extract function documentation
   */
  private extractFunctionDocumentation(
    node: ts.FunctionDeclaration,
    filePath: string,
    sourceFile: ts.SourceFile
  ): DocumentationItem | null {
    if (!node.name) return null;
    
    const jsdoc = this.extractJSDoc(node, sourceFile);
    const location = this.getSourceLocation(node, sourceFile, filePath);
    const signature = this.getFunctionSignature(node);
    
    return {
      id: `function-${node.name.text}`,
      name: node.name.text,
      type: 'function',
      description: jsdoc.description,
      category: jsdoc.category || 'Functions',
      tags: jsdoc.tags,
      source: location,
      examples: jsdoc.examples,
      seeAlso: jsdoc.seeAlso,
      metadata: {
        signature,
        parameters: jsdoc.parameters,
        returns: jsdoc.returns,
        throws: jsdoc.throws,
        typeParameters: this.getTypeParameters(node),
        async: this.hasModifier(node, ts.SyntaxKind.AsyncKeyword),
        generator: !!node.asteriskToken,
        ...jsdoc.metadata
      }
    };
  }

  /**
   * Extract interface documentation
   */
  private extractInterfaceDocumentation(
    node: ts.InterfaceDeclaration,
    filePath: string,
    sourceFile: ts.SourceFile
  ): DocumentationItem | null {
    const jsdoc = this.extractJSDoc(node, sourceFile);
    const location = this.getSourceLocation(node, sourceFile, filePath);
    
    const properties = node.members
      .filter(ts.isPropertySignature)
      .map(prop => ({
        name: prop.name && ts.isIdentifier(prop.name) ? prop.name.text : '?',
        type: prop.type ? this.getTypeString(prop.type) : 'any',
        optional: !!prop.questionToken,
        readonly: this.hasModifier(prop, ts.SyntaxKind.ReadonlyKeyword),
        description: this.extractJSDoc(prop, sourceFile).description
      }));
    
    const methods = node.members
      .filter(ts.isMethodSignature)
      .map(method => ({
        name: method.name && ts.isIdentifier(method.name) ? method.name.text : '?',
        signature: this.getMethodSignature(method),
        description: this.extractJSDoc(method, sourceFile).description
      }));
    
    return {
      id: `interface-${node.name.text}`,
      name: node.name.text,
      type: 'interface',
      description: jsdoc.description,
      category: jsdoc.category || 'Interfaces',
      tags: jsdoc.tags,
      source: location,
      examples: jsdoc.examples,
      seeAlso: jsdoc.seeAlso,
      metadata: {
        extends: this.getInterfaceExtends(node),
        typeParameters: this.getTypeParameters(node),
        properties,
        methods,
        ...jsdoc.metadata
      }
    };
  }

  /**
   * Extract type alias documentation
   */
  private extractTypeDocumentation(
    node: ts.TypeAliasDeclaration,
    filePath: string,
    sourceFile: ts.SourceFile
  ): DocumentationItem | null {
    const jsdoc = this.extractJSDoc(node, sourceFile);
    const location = this.getSourceLocation(node, sourceFile, filePath);
    
    return {
      id: `type-${node.name.text}`,
      name: node.name.text,
      type: 'type',
      description: jsdoc.description,
      category: jsdoc.category || 'Types',
      tags: jsdoc.tags,
      source: location,
      examples: jsdoc.examples,
      seeAlso: jsdoc.seeAlso,
      metadata: {
        definition: this.getTypeString(node.type),
        typeParameters: this.getTypeParameters(node),
        ...jsdoc.metadata
      }
    };
  }

  /**
   * Extract enum documentation
   */
  private extractEnumDocumentation(
    node: ts.EnumDeclaration,
    filePath: string,
    sourceFile: ts.SourceFile
  ): DocumentationItem | null {
    const jsdoc = this.extractJSDoc(node, sourceFile);
    const location = this.getSourceLocation(node, sourceFile, filePath);
    
    const members = node.members.map(member => ({
      name: member.name && ts.isIdentifier(member.name) ? member.name.text : '?',
      value: member.initializer ? member.initializer.getText(sourceFile) : undefined,
      description: this.extractJSDoc(member, sourceFile).description
    }));
    
    return {
      id: `enum-${node.name.text}`,
      name: node.name.text,
      type: 'enum',
      description: jsdoc.description,
      category: jsdoc.category || 'Enums',
      tags: jsdoc.tags,
      source: location,
      examples: jsdoc.examples,
      seeAlso: jsdoc.seeAlso,
      metadata: {
        const: this.hasModifier(node, ts.SyntaxKind.ConstKeyword),
        members,
        ...jsdoc.metadata
      }
    };
  }

  /**
   * Extract variable/constant documentation
   */
  private extractVariableDocumentation(
    node: ts.VariableDeclaration,
    filePath: string,
    sourceFile: ts.SourceFile,
    statement: ts.VariableStatement
  ): DocumentationItem | null {
    if (!ts.isIdentifier(node.name)) return null;
    
    const jsdoc = this.extractJSDoc(statement, sourceFile);
    const location = this.getSourceLocation(node, sourceFile, filePath);
    const isConst = statement.declarationList.flags & ts.NodeFlags.Const;
    
    return {
      id: `${isConst ? 'const' : 'variable'}-${node.name.text}`,
      name: node.name.text,
      type: isConst ? 'constant' : 'variable',
      description: jsdoc.description,
      category: jsdoc.category || (isConst ? 'Constants' : 'Variables'),
      tags: jsdoc.tags,
      source: location,
      examples: jsdoc.examples,
      seeAlso: jsdoc.seeAlso,
      metadata: {
        type: node.type ? this.getTypeString(node.type) : 'any',
        value: node.initializer ? this.getInitializerValue(node.initializer) : undefined,
        ...jsdoc.metadata
      }
    };
  }

  /**
   * Extract JSDoc comments
   */
  private extractJSDoc(node: ts.Node, sourceFile: ts.SourceFile): any {
    const result: any = {
      description: '',
      tags: [],
      examples: [],
      seeAlso: [],
      parameters: [],
      metadata: {}
    };
    
    const jsDocComments = ts.getJSDocCommentsAndTags(node);
    if (jsDocComments.length === 0) return result;
    
    for (const jsDoc of jsDocComments) {
      if (ts.isJSDoc(jsDoc)) {
        // Extract description
        if (jsDoc.comment) {
          result.description = this.getCommentText(jsDoc.comment);
        }
        
        // Process tags
        if (jsDoc.tags) {
          for (const tag of jsDoc.tags) {
            const tagName = tag.tagName.text;
            
            switch (tagName) {
              case 'param':
              case 'parameter':
                if (ts.isJSDocParameterTag(tag)) {
                  result.parameters.push({
                    name: tag.name.getText(sourceFile),
                    type: tag.typeExpression ? tag.typeExpression.type.getText(sourceFile) : 'any',
                    description: tag.comment ? this.getCommentText(tag.comment) : '',
                    optional: tag.isBracketed
                  });
                }
                break;
                
              case 'returns':
              case 'return':
                if (ts.isJSDocReturnTag(tag)) {
                  result.returns = {
                    type: tag.typeExpression ? tag.typeExpression.type.getText(sourceFile) : 'any',
                    description: tag.comment ? this.getCommentText(tag.comment) : ''
                  };
                }
                break;
                
              case 'throws':
              case 'exception':
                result.throws = result.throws || [];
                result.throws.push({
                  type: tag.typeExpression ? tag.typeExpression.type.getText(sourceFile) : 'Error',
                  description: tag.comment ? this.getCommentText(tag.comment) : ''
                });
                break;
                
              case 'example':
                const exampleText = tag.comment ? this.getCommentText(tag.comment) : '';
                const example = this.parseExample(exampleText);
                if (example) result.examples.push(example);
                break;
                
              case 'see':
              case 'link':
                const seeText = tag.comment ? this.getCommentText(tag.comment) : '';
                if (seeText) result.seeAlso.push(seeText);
                break;
                
              case 'category':
              case 'group':
                result.category = tag.comment ? this.getCommentText(tag.comment) : '';
                break;
                
              case 'deprecated':
                result.metadata.deprecated = {
                  message: tag.comment ? this.getCommentText(tag.comment) : 'This is deprecated',
                  since: undefined
                };
                break;
                
              case 'since':
                result.metadata.since = tag.comment ? this.getCommentText(tag.comment) : '';
                break;
                
              case 'author':
                result.metadata.author = tag.comment ? this.getCommentText(tag.comment) : '';
                break;
                
              case 'version':
                result.metadata.version = tag.comment ? this.getCommentText(tag.comment) : '';
                break;
                
              default:
                // Custom tags
                result.tags.push(tagName);
                if (tag.comment) {
                  result.metadata[tagName] = this.getCommentText(tag.comment);
                }
            }
          }
        }
      }
    }
    
    return result;
  }

  /**
   * Get comment text from JSDoc comment
   */
  private getCommentText(comment: string | ts.NodeArray<ts.JSDocComment>): string {
    if (typeof comment === 'string') {
      return comment;
    }
    
    return comment.map(c => c.getText()).join('');
  }

  /**
   * Parse example from text
   */
  private parseExample(text: string): CodeExample | null {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return null;
    
    // Check if first line is a title
    let title: string | undefined;
    let startIndex = 0;
    
    if (!lines[0].startsWith('```')) {
      title = lines[0];
      startIndex = 1;
    }
    
    // Find code block
    let code = '';
    let language = 'typescript';
    let inCodeBlock = false;
    let description = '';
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          const lang = line.slice(3).trim();
          if (lang) language = lang;
        } else {
          inCodeBlock = false;
        }
      } else if (inCodeBlock) {
        code += line + '\n';
      } else if (!inCodeBlock && code) {
        description += line + '\n';
      } else if (!inCodeBlock && !code) {
        // Code without code block markers
        code += line + '\n';
      }
    }
    
    return {
      title,
      code: code.trim(),
      language,
      description: description.trim() || undefined
    };
  }

  /**
   * Get source location
   */
  private getSourceLocation(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    filePath: string
  ): SourceLocation {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    
    return {
      file: filePath,
      line: line + 1,
      column: character + 1
    };
  }

  /**
   * Check if node is exported
   */
  private isExported(node: ts.Node): boolean {
    return !!(ts.getCombinedModifierFlags(node as any) & ts.ModifierFlags.Export);
  }

  /**
   * Check if member is public or protected
   */
  private isPublicOrProtected(member: ts.ClassElement): boolean {
    const modifiers = ts.getCombinedModifierFlags(member as any);
    
    // If no visibility modifier, it's public by default
    if (!(modifiers & (ts.ModifierFlags.Public | ts.ModifierFlags.Protected | ts.ModifierFlags.Private))) {
      return true;
    }
    
    return !!(modifiers & (ts.ModifierFlags.Public | ts.ModifierFlags.Protected));
  }

  /**
   * Check if node has specific modifier
   */
  private hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
    return !!(ts.getCombinedModifierFlags(node as any) & this.modifierKindToFlags(kind));
  }

  /**
   * Convert modifier kind to flags
   */
  private modifierKindToFlags(kind: ts.SyntaxKind): ts.ModifierFlags {
    const map: Record<number, ts.ModifierFlags> = {
      [ts.SyntaxKind.PublicKeyword]: ts.ModifierFlags.Public,
      [ts.SyntaxKind.PrivateKeyword]: ts.ModifierFlags.Private,
      [ts.SyntaxKind.ProtectedKeyword]: ts.ModifierFlags.Protected,
      [ts.SyntaxKind.StaticKeyword]: ts.ModifierFlags.Static,
      [ts.SyntaxKind.ReadonlyKeyword]: ts.ModifierFlags.Readonly,
      [ts.SyntaxKind.AbstractKeyword]: ts.ModifierFlags.Abstract,
      [ts.SyntaxKind.AsyncKeyword]: ts.ModifierFlags.Async,
      [ts.SyntaxKind.ConstKeyword]: ts.ModifierFlags.Const,
      [ts.SyntaxKind.ExportKeyword]: ts.ModifierFlags.Export
    };
    
    return map[kind] || 0;
  }

  /**
   * Get visibility of class member
   */
  private getVisibility(member: ts.ClassElement): string {
    const modifiers = ts.getCombinedModifierFlags(member as any);
    
    if (modifiers & ts.ModifierFlags.Private) return 'private';
    if (modifiers & ts.ModifierFlags.Protected) return 'protected';
    return 'public';
  }

  /**
   * Get extends clause
   */
  private getExtends(node: ts.ClassDeclaration): string | undefined {
    if (!node.heritageClauses) return undefined;
    
    const extendsClause = node.heritageClauses.find(
      clause => clause.token === ts.SyntaxKind.ExtendsKeyword
    );
    
    if (!extendsClause || extendsClause.types.length === 0) return undefined;
    
    return extendsClause.types[0].expression.getText();
  }

  /**
   * Get implements clause
   */
  private getImplements(node: ts.ClassDeclaration): string[] {
    if (!node.heritageClauses) return [];
    
    const implementsClause = node.heritageClauses.find(
      clause => clause.token === ts.SyntaxKind.ImplementsKeyword
    );
    
    if (!implementsClause) return [];
    
    return implementsClause.types.map(type => type.expression.getText());
  }

  /**
   * Get interface extends
   */
  private getInterfaceExtends(node: ts.InterfaceDeclaration): string[] {
    if (!node.heritageClauses) return [];
    
    return node.heritageClauses[0].types.map(type => type.expression.getText());
  }

  /**
   * Get type parameters
   */
  private getTypeParameters(node: ts.Node & { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration> }): string[] {
    if (!node.typeParameters) return [];
    
    return node.typeParameters.map(param => {
      let result = param.name.text;
      
      if (param.constraint) {
        result += ` extends ${param.constraint.getText()}`;
      }
      
      if (param.default) {
        result += ` = ${param.default.getText()}`;
      }
      
      return result;
    });
  }

  /**
   * Get decorators
   */
  private getDecorators(node: ts.Node): string[] {
    const decorators = ts.getDecorators(node as any);
    if (!decorators) return [];
    
    return decorators.map(decorator => decorator.getText());
  }

  /**
   * Get method signature
   */
  private getMethodSignature(method: ts.MethodDeclaration | ts.MethodSignature): string {
    const name = method.name && ts.isIdentifier(method.name) ? method.name.text : '?';
    const typeParams = method.typeParameters 
      ? `<${method.typeParameters.map(p => p.getText()).join(', ')}>` 
      : '';
    const params = method.parameters.map(p => p.getText()).join(', ');
    const returnType = method.type ? method.type.getText() : 'any';
    
    return `${name}${typeParams}(${params}): ${returnType}`;
  }

  /**
   * Get property signature
   */
  private getPropertySignature(prop: ts.PropertyDeclaration | ts.PropertySignature): string {
    const name = prop.name && ts.isIdentifier(prop.name) ? prop.name.text : '?';
    const optional = (prop as any).questionToken ? '?' : '';
    const type = prop.type ? prop.type.getText() : 'any';
    
    return `${name}${optional}: ${type}`;
  }

  /**
   * Get constructor signature
   */
  private getConstructorSignature(ctor: ts.ConstructorDeclaration): string {
    const params = ctor.parameters.map(p => p.getText()).join(', ');
    return `constructor(${params})`;
  }

  /**
   * Get accessor signature
   */
  private getAccessorSignature(accessor: ts.GetAccessorDeclaration | ts.SetAccessorDeclaration): string {
    const name = accessor.name && ts.isIdentifier(accessor.name) ? accessor.name.text : '?';
    
    if (ts.isGetAccessorDeclaration(accessor)) {
      const returnType = accessor.type ? accessor.type.getText() : 'any';
      return `get ${name}(): ${returnType}`;
    } else {
      const param = accessor.parameters[0];
      const paramText = param ? param.getText() : 'value: any';
      return `set ${name}(${paramText})`;
    }
  }

  /**
   * Get function signature
   */
  private getFunctionSignature(func: ts.FunctionDeclaration): string {
    const name = func.name ? func.name.text : '?';
    const typeParams = func.typeParameters 
      ? `<${func.typeParameters.map(p => p.getText()).join(', ')}>` 
      : '';
    const params = func.parameters.map(p => p.getText()).join(', ');
    const returnType = func.type ? func.type.getText() : 'any';
    
    return `${name}${typeParams}(${params}): ${returnType}`;
  }

  /**
   * Get type string
   */
  private getTypeString(type: ts.TypeNode): string {
    return type.getText();
  }

  /**
   * Get initializer value
   */
  private getInitializerValue(initializer: ts.Expression): string {
    const text = initializer.getText();
    
    // Limit length for display
    if (text.length > 100) {
      return text.substring(0, 97) + '...';
    }
    
    return text;
  }
}

// Export singleton instance
export const apiDocumentationPlugin = new APIDocumentationPlugin();