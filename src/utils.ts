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

const pythonKeywords = [
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield',
];

const isKeyWord = (key: string): boolean => {
  return pythonKeywords.indexOf(key) > -1;
};

const isIdentifier = (key: string): boolean => {
  // A custom implementation of "".isidentifier() in Python. Likely not as
  // robust, but will be good enough
  const identifierRegex = new RegExp(/^[a-z_][a-z0-9_]*$/, 'i');
  return identifierRegex.test(key);
};

export const isValidKey = (key: string): boolean => {
  if (isKeyWord(key)) {
    return false;
  }
  return isIdentifier(key);
};

export const keyToClassName = (key: string): string => {
  const parts1 = key.split(/[^a-zA-Z0-9]/);

  const parts2: string[] = [];
  for (const part of parts1) {
    if (/^[a-z0-9]+$/.test(part)) {
      parts2.push(part);
    } else {
      // Assume camelCase
      for (const subPart of part.split(/([A-Z][^A-Z]+)/)) {
        if (subPart.length > 0) {
          parts2.push(subPart);
        }
      }
    }
  }

  return parts2
    .map(part => `${part.charAt(0).toUpperCase()}${part.substring(1).toLowerCase()}`)
    .join('');
};
