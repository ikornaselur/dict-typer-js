import {subMembersToString, subMembersToImports, isValidKey} from './utils';
import {SubMembers, DictMembers, EntryType} from './types';

const KNOWN_TYPE_IMPORTS: string[] = ['List', 'Tuple', 'Set', 'FrozenSet', 'Dict'];

const isValidName = (name: string): boolean => {
  if (!isValidKey(name)) {
    return false;
  }
  return KNOWN_TYPE_IMPORTS.indexOf(name) === -1;
};

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

  get dependsOn(): Set<string> {
    return new Set(this.#subMembers.map(subMember => subMember.name));
  }
}

export class DictEntry {
  name: string;
  members: DictMembers;
  #indentation: number;
  #forceAlternative: boolean;

  constructor(name: string, members: DictMembers = {}, forceAlternative = false, indentation = 4) {
    if (isValidName(name)) {
      this.name = name;
    } else {
      this.name = `${name}_`;
    }
    this.members = members;
    this.#indentation = indentation;
    this.#forceAlternative = forceAlternative;
  }

  getImports(): Set<string> {
    if (Object.keys(this.members).length === 0) {
      return new Set(['Dict']);
    }

    return new Set(
      Object.values(this.members)
        .map(sm => subMembersToImports(sm))
        .reduce((prev, curr) => prev.concat([...curr]), []),
    );
  }

  toString(): string {
    const out: string[] = [];
    if (this.#forceAlternative) {
      out.push(`${this.name} = TypedDict("${this.name}", {`);
      for (const [key, value] of Object.entries(this.members)) {
        out.push(`${' '.repeat(this.#indentation)}"${key}": ${subMembersToString(value)},`);
      }
      out.push('})');
    } else {
      out.push(`class ${this.name}(TypedDict):`);
      for (const [key, value] of Object.entries(this.members)) {
        out.push(`${' '.repeat(this.#indentation)}${key}: ${subMembersToString(value)}`);
      }
    }
    return out.join('\n');
  }

  get dependsOn(): Set<string> {
    if (Object.keys(this.members).length === 0) {
      return new Set([]);
    }
    const membersDepends = Object.values(this.members)
      .flat()
      .map(member => member.dependsOn)
      .reduce((prev, curr) => prev.concat([...curr]), []);
    const memberNames = Object.values(this.members)
      .flat()
      .map(member => member.name);

    return new Set([...membersDepends, ...memberNames]);
  }
}

export const memberSort = (left: EntryType, right: EntryType): number => {
  if (left.dependsOn.has(right.name)) {
    return 1;
  }
  if (right.dependsOn.has(left.name)) {
    return -1;
  }
  return 0;
};
