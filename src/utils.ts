import {MemberEntry} from './models';

export const subMembersToImports = (subMembers: MemberEntry[]): Set<string> => {
  let imports: Set<string> = new Set();

  subMembers.forEach(member => {
    imports = new Set([...imports, ...member.getImports()]);
  });

  const names = new Set(subMembers.map(member => member.name));

  if (names.size === 2 && names.has('None')) {
    imports.add('Optional');
  } else if (names.size > 1) {
    imports.add('Union');
  }

  return imports;
};

/*
export const subMembersToString = (subMembers: MemberEntry[]): Set<string> => {
  return new Set();
};
*/
