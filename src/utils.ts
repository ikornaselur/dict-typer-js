import {SubMembers, EntryType} from './types';
import {DictEntry} from './models';

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

const getMemberValue = (item: EntryType): string => {
  if (item instanceof DictEntry) {
    return item.name;
  }
  return item.toString();
};

export const subMembersToString = (subMembers: SubMembers): string => {
  if (
    subMembers.length === 2 &&
    subMembers.map(member => member.name).some(name => name === 'None')
  ) {
    const optionalMember = subMembers.find(member => member.name !== 'None');
    return `Optional[${getMemberValue(optionalMember)}]`;
  }
  if (subMembers.length === 1) {
    return getMemberValue(subMembers[0]);
  }
  if (subMembers.length > 0) {
    const names = subMembers.map(member => getMemberValue(member)).sort();
    return `Union[${names.join(', ')}]`;
  }
  return '';
};
