import {subMembersToImports, subMembersToString} from './utils';
import {MemberEntry} from './models';

describe('subMembersToImports', () => {
  test('gets imports from members', () => {
    const subMembers = [new MemberEntry('List', []), new MemberEntry('List', [])];

    expect(subMembersToImports(subMembers)).toEqual(new Set(['List']));
  });

  test('gets adds Union if multiple imports', () => {
    const subMembers = [new MemberEntry('List', []), new MemberEntry('Dict', [])];

    expect(subMembersToImports(subMembers)).toEqual(new Set(['List', 'Dict', 'Union']));
  });

  test('gets adds Optional if one of two imports is None', () => {
    const subMembers = [new MemberEntry('List', []), new MemberEntry('None', [])];

    expect(subMembersToImports(subMembers)).toEqual(new Set(['List', 'Optional']));
  });
});

describe('subMembersToString', () => {
  test('gets the value of only member if just one', () => {
    const subMembers = [new MemberEntry('str', [])];

    expect(subMembersToString(subMembers)).toBe('str');
  });

  test('gets value as optional if one of two is None', () => {
    const subMembers = [new MemberEntry('str', []), new MemberEntry('None', [])];

    expect(subMembersToString(subMembers)).toBe('Optional[str]');
  });

  test('gets union of values if multiple', () => {
    const subMembers = [new MemberEntry('str', []), new MemberEntry('int', [])];

    expect(subMembersToString(subMembers)).toBe('Union[int, str]');
  });
});
