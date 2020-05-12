import {DictEntry, MemberEntry, memberSort} from './models';
import {Source, BaseSource, EntryType} from './types';
import {subMembersToString, subMembersToImports, keyToClassName, eqSet} from './utils';

class DefinitionBuilder {
  #definitions: DictEntry[];
  #rootList: MemberEntry[];
  #rootTypeName: string;
  #typePostfix: string;
  #showImports: boolean;
  #source: Source;
  #output?: string;

  constructor(source: Source, rootTypeName = 'Root', typePostfix = '', showImports = true) {
    this.#source = source;
    this.#rootTypeName = rootTypeName;
    this.#typePostfix = typePostfix;
    this.#showImports = showImports;
    this.#definitions = [];
    this.#rootList = [];
  }

  private addDefinition(entry: EntryType): EntryType {
    if (entry instanceof MemberEntry) {
      this.#rootList.push(entry);
    } else {
      const dictsOnly = this.#definitions.filter(def => def instanceof DictEntry);
      for (const definition of dictsOnly) {
        if (eqSet(entry.keys, definition.keys)) {
          definition.updateMembers(entry.members);
          return definition;
        }
        if (entry.name === definition.name) {
          let idx = 1;
          let newName = `${entry.name}${idx}`;
          const dictsNames = dictsOnly.map(d => d.name);
          while (dictsNames.indexOf(newName) > -1) {
            idx += 1;
            newName = `${entry.name}${idx}`;
          }
          entry.name = newName;
        }
      }
      this.#definitions.push(entry);
    }
    return entry;
  }
  private convertList(key: string, list: Array<BaseSource>, itemName: string): MemberEntry {
    const entry = new MemberEntry(key);

    let idx = 0;
    for (const item of list) {
      const itemType = this.getType(item, `${itemName}${idx}`);

      entry.addSubMember(itemType);
      if (itemType instanceof DictEntry) {
        this.addDefinition(itemType);
      }

      idx += 1;
    }

    return entry;
  }
  private convertDict(typeName: string, dict: object): DictEntry {
    const entry = new DictEntry(typeName);
    for (const [key, value] of Object.entries(dict)) {
      let valueType = this.getType(value, key);
      if (valueType instanceof DictEntry) {
        const definition = this.addDefinition(valueType);
        valueType = definition;
      }
      entry.members[key] = [valueType];
    }
    return entry;
  }
  private getType(item: any, key: string): EntryType {
    switch (typeof item) {
      case 'boolean':
        return new MemberEntry('bool');
      case 'number':
        if (Number.isInteger(item)) {
          return new MemberEntry('int');
        } else {
          return new MemberEntry('float');
        }
      case 'string':
        return new MemberEntry('str');
      case 'object':
        if (item === null) {
          return new MemberEntry('None');
        } else if (Array.isArray(item)) {
          const listItemTypes = [];
          let idx = 0;

          for (const element of item) {
            const itemType = this.getType(element, `${key}Item${idx}`);
            if (itemType instanceof DictEntry) {
              if (
                [...listItemTypes].map(listItemType => listItemType.members).indexOf(itemType) > -1
              ) {
                listItemTypes.push(itemType);
                idx += 1;
                if (itemType instanceof DictEntry) {
                  this.addDefinition(itemType);
                }
              }
            } else if (listItemTypes.find(elm => elm.toString() == itemType.toString()) == null) {
              listItemTypes.push(itemType);
            }
          }

          return new MemberEntry('List', [...listItemTypes]);
        } else if (item.constructor == Object) {
          return this.convertDict(`${keyToClassName(key)}${this.#typePostfix}`, item);
        }
      default:
        throw `Can't getType for ${item}`;
    }
  }

  buildOutput(): string {
    if (this.#output !== undefined) {
      return this.#output;
    }

    if (Array.isArray(this.#source)) {
      this.addDefinition(this.convertList('List', this.#source, `${this.#rootTypeName}Item`));
    } else {
      this.addDefinition(
        this.convertDict(`${this.#rootTypeName}${this.#typePostfix}`, this.#source),
      );
    }

    this.#output = '';

    if (this.#showImports) {
      let typingImports = new Set([]);
      let typedDictImport = false;

      for (const definition of this.#definitions) {
        if (definition instanceof DictEntry) {
          typedDictImport = true;
        }
        typingImports = new Set([...typingImports, ...definition.getImports()]);
      }
      if (this.#rootList.length > 0) {
        typingImports = new Set([...typingImports, 'List', ...subMembersToImports(this.#rootList)]);
      }
      if (typingImports.size > 0) {
        this.#output += [`from typing import ${[...typingImports].sort().join(', ')}`, '', ''].join(
          '\n',
        );
      }
      if (typedDictImport) {
        this.#output += ['from typing_extensions import TypedDict', '', '', ''].join('\n');
      }
    }

    this.#output += this.#definitions
      .sort(memberSort)
      .map(d => d.toString())
      .join('\n\n\n');

    if (this.#rootList.length > 0) {
      if (this.#output.length > 0) {
        this.#output += '\n';
        if (this.#definitions.length > 0) {
          this.#output += '\n\n';
        }
      }
      this.#output += `${this.#rootTypeName}${this.#typePostfix} = ${subMembersToString([
        ...this.#rootList,
      ])}`;
    }

    return this.#output;
  }
}

export const getTypeDefinitions = (
  source: Source,
  rootTypeName = 'Root',
  typePostfix = '',
  showImports = true,
): string => {
  const builder = new DefinitionBuilder(source, rootTypeName, typePostfix, showImports);

  return builder.buildOutput();
};
