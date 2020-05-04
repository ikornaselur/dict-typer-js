import {subMembersToString, subMembersToImports} from './utils';

const KNOWN_TYPE_IMPORTS: string[] = ['List', 'Tuple', 'Set', 'FrozenSet', 'Dict'];

export class MemberEntry {
  name: string;
  #subMembers: MemberEntry[];

  constructor(name: string, subMembers: MemberEntry[] = []) {
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
