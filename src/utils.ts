import {SubMembers} from './types';

export const subMembersToImports = (subMembers: SubMembers): Set<string> => {
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

export const subMembersToString = (subMembers: SubMembers): string => {
  if (
    subMembers.length === 2 &&
    subMembers.map(member => member.name).some(name => name === 'None')
  ) {
    const optionalMember = subMembers.map(member => member.name).find(name => name !== 'None');
    return `Optional[${optionalMember.toString()}]`;
  }
  if (subMembers.length === 1) {
    return subMembers[0].toString();
  }
  if (subMembers.length > 0) {
    const names = subMembers.map(member => member.name).sort();
    return `Union[${names.join(', ')}]`;
  }
  return '';
};
