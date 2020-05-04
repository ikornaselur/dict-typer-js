import {subMembersToImports} from './utils';
import {MemberEntry} from './models';

test('subMembersToImports gets imports from members', () => {
  const subMembers = [new MemberEntry('List', []), new MemberEntry('List', [])];

  expect(subMembersToImports(subMembers)).toEqual(new Set(['List']));
});

test('subMembersToImports gets adds Union if multiple imports', () => {
  const subMembers = [new MemberEntry('List', []), new MemberEntry('Dict', [])];

  expect(subMembersToImports(subMembers)).toEqual(new Set(['List', 'Dict', 'Union']));
});

test('subMembersToImports gets adds Optional if one of two imports is None', () => {
  const subMembers = [new MemberEntry('List', []), new MemberEntry('None', [])];

  expect(subMembersToImports(subMembers)).toEqual(new Set(['List', 'Optional']));
});
