import {DictEntry, MemberEntry, memberSort} from './models';
import {subMembersToString, subMembersToImports, keyToClassName, eqSet} from './utils';
import {parse} from './parser';
import {Int, Float, Str, Bool, Null, Dict, List, Source, EntryType} from './types';

class DefinitionBuilder {
  #definitions: DictEntry[];
  #rootTypeName: string;
  #typePostfix: string;
  #showImports: boolean;
  #forceAlternative: boolean;
  #source: Source;
  #nameMap: Record<string, string>;
  #output?: string;

  constructor(
    source: Source,
    rootTypeName = 'Root',
    typePostfix = '',
    showImports = true,
    forceAlternative = false,
    nameMap = {},
  ) {
    this.#source = source;
    this.#rootTypeName = rootTypeName;
    this.#typePostfix = typePostfix;
    this.#showImports = showImports;
    this.#forceAlternative = forceAlternative;
    this.#definitions = [];
    this.#nameMap = nameMap;
  }

  private addDefinition(entry: DictEntry): DictEntry {
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
    return entry;
  }

  private convertList(typeName: string, list: List): MemberEntry {
    const entry = new MemberEntry('List');
    let idx = 0;

    for (const element of list) {
      const itemType = this.getType(element, `${typeName}${idx}`);

      entry.addSubMember(itemType);
      if (itemType instanceof DictEntry) {
        this.addDefinition(itemType);
      }

      idx += 1;
    }

    return entry;
  }

  private getName(typeName: string): string {
    return this.#nameMap[typeName] || typeName;
  }

  private convertDict(typeName: string, dict: Dict): DictEntry {
    const entry = new DictEntry(this.getName(typeName), {}, this.#forceAlternative);

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

  private getType(item: Source, key: string): EntryType {
    if (item === null) {
      throw new Error('Unable to get type on null');
    }
    switch (item.constructor) {
      case Int:
        return new MemberEntry('int');
      case Float:
        return new MemberEntry('float');
      case Str:
        return new MemberEntry('str');
      case Bool:
        return new MemberEntry('bool');
      case Null:
        return new MemberEntry('None');
      case Array:
        return this.convertList(`${key}Item`, item as List);
      case Object:
        return this.convertDict(`${keyToClassName(key)}${this.#typePostfix}`, item as Dict);
      default:
        throw `Can't getType for ${item}`;
    }
  }

  buildOutput(): string {
    if (this.#output !== undefined) {
      return this.#output;
    }

    this.#output = '';

    const sourceType = this.getType(this.#source, this.#rootTypeName);
    let rootItem = null;

    if (sourceType instanceof DictEntry) {
      this.addDefinition(sourceType);
    } else {
      rootItem = sourceType;
    }

    if (this.#showImports) {
      let typingImports: Set<string> = new Set([]);
      let typedDictImport = false;

      for (const definition of this.#definitions) {
        if (definition instanceof DictEntry) {
          typedDictImport = true;
        }
        typingImports = new Set([...typingImports, ...definition.getImports()]);
      }
      if (rootItem !== null) {
        typingImports = new Set([...typingImports, ...subMembersToImports([rootItem])]);
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

    if (!(sourceType instanceof DictEntry)) {
      if (this.#output.length > 0) {
        this.#output += '\n';
        if (this.#definitions.length > 0) {
          this.#output += '\n\n';
        }
      }
      this.#output += `${this.#rootTypeName}${this.#typePostfix} = ${subMembersToString([
        sourceType,
      ])}`;
    }

    return this.#output;
  }
}

export const getTypeDefinitions = (
  source: string,
  {
    rootTypeName = 'Root',
    typePostfix = '',
    showImports = true,
    forceAlternative = false,
    nameMap = {},
  } = {},
): string => {
  const parsed = parse(source);
  const builder = new DefinitionBuilder(
    parsed,
    rootTypeName,
    typePostfix,
    showImports,
    forceAlternative,
    nameMap,
  );
  return builder.buildOutput();
};
