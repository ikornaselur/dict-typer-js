import {subMembersToString, subMembersToImports} from './utils';
import {SubMembers, DictMembers} from './types';

const KNOWN_TYPE_IMPORTS: string[] = ['List', 'Tuple', 'Set', 'FrozenSet', 'Dict'];

export class MemberEntry {
  name: string;
  #subMembers: SubMembers;

  constructor(name: string, subMembers: SubMembers = []) {
    this.name = name;
    this.#subMembers = subMembers;
  }

  getImports(): Set<string> {
    const imports: Set<string> = new Set();

    if (KNOWN_TYPE_IMPORTS.includes(this.name)) {
      imports.add(this.name);
    }

    const subMemberImports = subMembersToImports(this.#subMembers);

    return new Set([...imports, ...subMemberImports]);
  }

  toString(): string {
    const subString = subMembersToString(this.#subMembers);
    if (subString) {
      return `${this.name}[${subString}]`;
    }

    return this.name;
  }
}

export class DictEntry {
  name: string;
  #members: DictMembers;
  #indentation: number;
  #forceAlternative: boolean;

  constructor(name: string, members: DictMembers = {}, indentation = 4, forceAlternative = false) {
    this.name = name;
    this.#members = members;
    this.#indentation = indentation;
    this.#forceAlternative = forceAlternative;
  }

  getImports(): Set<string> {
    return new Set();
  }

  toString(): string {
    const out: string[] = [];
    if (this.#forceAlternative) {
      //
    } else {
      out.push(`class ${this.name}(TypedDict):`);
      for (let key in this.#members) {
        const value = this.#members[key];
        if (value instanceof DictEntry) {
          out.push(`${' '.repeat(this.#indentation)}${key}: ${value.name}`);
        } else {
          out.push(`${' '.repeat(this.#indentation)}${key}: ${subMembersToString(value)}`);
        }
      }
    }
    return out.join('\n');
  }
}
