import {subMembersToImports, subMembersToString, isValidKey, keyToClassName, eqSet} from './utils';
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

describe('isValidKey', () => {
  test('with valid names', () => {
    // test_is_valid_key_with_valid_names
    const keys = ['foo', 'foo_bar', 'fooBar', 'number3', 'FOO'];

    expect(keys.every(key => isValidKey(key))).toBeTruthy();
  });

  test('rejects keywords', () => {
    // test_is_valid_key_rejects_keywords
    const keys = ['False', 'async', 'del', 'def', 'if', 'lambda']; // Just few of them

    expect(keys.every(key => !isValidKey(key))).toBeTruthy();
  });

  test('rejects invalid itentifiers', () => {
    // test_is_valid_key_rejects_invalid_identifiers
    const keys = ['foo-bar', '123', '?', 'a space'];

    expect(keys.every(key => !isValidKey(key))).toBeTruthy();
  });
});

describe('keyToClassName', () => {
  test('with valid names', () => {
    // test_key_to_class_name_with_valid_names
    expect(keyToClassName('foo')).toBe('Foo');
    expect(keyToClassName('foo_bar')).toBe('FooBar');
    expect(keyToClassName('FOO')).toBe('Foo');
  });

  test('with reserved keyword names', () => {
    // test_key_to_class_name_with_reserved_keywords_names
    expect(keyToClassName('from')).toBe('From');
    expect(keyToClassName('async')).toBe('Async');
  });

  test('with non valid identifiers', () => {
    // test_key_to_class_name_with_non_valid_identifiers
    expect(keyToClassName('foo-bar')).toBe('FooBar');
    expect(keyToClassName('baz qux')).toBe('BazQux');
  });

  test('with repeated splits', () => {
    // test_key_to_class_name_with_repeated_splits
    expect(keyToClassName('foo-----bar')).toBe('FooBar');
    expect(keyToClassName('baz_____qux')).toBe('BazQux');
    expect(keyToClassName('_____bar')).toBe('Bar');
  });

  test('with camelCase already', () => {
    // test_key_to_class_name_camel_case_already
    expect(keyToClassName('fooBar')).toBe('FooBar');
    expect(keyToClassName('BazQux')).toBe('BazQux');
  });
});

describe('eqSet', () => {
  test('compares equality of two equal sets', () => {
    expect(eqSet(new Set([]), new Set([]))).toBeTruthy();
    expect(eqSet(new Set(['a']), new Set(['a']))).toBeTruthy();
    expect(eqSet(new Set(['a', 'a']), new Set(['a']))).toBeTruthy();
    expect(eqSet(new Set(['a', 'b', 'a']), new Set(['b', 'a']))).toBeTruthy();

    expect(eqSet(new Set(['a', 'a', 'b']), new Set(['a']))).toBeFalsy();
    expect(eqSet(new Set(['a', 'b']), new Set(['a']))).toBeFalsy();
  });
});
