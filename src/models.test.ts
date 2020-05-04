import {MemberEntry} from './models';

describe('MemberEntry', () => {
  test('returns itself with imports if known type import', () => {
    expect(new MemberEntry('List', []).getImports()).toEqual(new Set(['List']));
    expect(new MemberEntry('Tuple', []).getImports()).toEqual(new Set(['Tuple']));
    expect(new MemberEntry('Dict', []).getImports()).toEqual(new Set(['Dict']));
  });

  test("doesn't return itself with imports if unknown type import", () => {
    expect(new MemberEntry('Foo', []).getImports()).toEqual(new Set([]));
    expect(new MemberEntry('Bar', []).getImports()).toEqual(new Set([]));
  });

  test('toString has base output', () => {
    const entry = new MemberEntry('str');

    expect(entry.toString()).toBe('str');
  });

  test('toString has sub types', () => {
    const entry = new MemberEntry('List', [new MemberEntry('str')]);

    expect(entry.toString()).toBe('List[str]');
  });
});
