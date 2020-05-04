import {MemberEntry} from './models';

test('MemberEntry returns itself with imports if known type import', () => {
  expect(new MemberEntry('List', []).getImports()).toEqual(new Set(['List']));
  expect(new MemberEntry('Tuple', []).getImports()).toEqual(new Set(['Tuple']));
  expect(new MemberEntry('Dict', []).getImports()).toEqual(new Set(['Dict']));
});

test("MemberEntry doesn't return itself with imports if unknown type import", () => {
  expect(new MemberEntry('Foo', []).getImports()).toEqual(new Set([]));
  expect(new MemberEntry('Bar', []).getImports()).toEqual(new Set([]));
});
