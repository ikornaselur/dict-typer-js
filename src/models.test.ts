import {DictEntry, MemberEntry} from './models';

describe('MemberEntry', () => {
  test('toString has base output', () => {
    // test_member_entry_base_output
    const entry = new MemberEntry('str');

    expect(entry.toString()).toBe('str');
  });

  test('toString has sub types', () => {
    // test_member_entry_sub_types
    const entry = new MemberEntry('List', [new MemberEntry('str')]);

    expect(entry.toString()).toBe('List[str]');
  });

  test('toString sub types with union', () => {
    // test_member_entry_sub_types_union
    const entry = new MemberEntry('List', [new MemberEntry('str'), new MemberEntry('int')]);

    expect(entry.toString()).toBe('List[Union[int, str]]');
  });

  test('toString sub types optional if just one type', () => {
    // test_member_entry_sub_types_optional_if_just_one_type
    const entry = new MemberEntry('List', [new MemberEntry('str'), new MemberEntry('None')]);

    expect(entry.toString()).toBe('List[Optional[str]]');
  });

  test('toString sub types union instead of optional if multiple types', () => {
    // test_member_entry_sub_types_union_instead_of_optional_if_multiple_types
    const entry = new MemberEntry('List', [
      new MemberEntry('str'),
      new MemberEntry('int'),
      new MemberEntry('None'),
    ]);

    expect(entry.toString()).toBe('List[Union[None, int, str]]');
  });

  test('returns correct imports', () => {
    // test_member_entry_get_imports
    const justList = new MemberEntry('List');
    const justListOneItem = new MemberEntry('List', [new MemberEntry('str')]);
    const listWithUnion = new MemberEntry('List', [new MemberEntry('str'), new MemberEntry('int')]);
    const listWithOptional = new MemberEntry('List', [
      new MemberEntry('str'),
      new MemberEntry('None'),
    ]);

    expect(justList.getImports()).toEqual(new Set(['List']));
    expect(justListOneItem.getImports()).toEqual(new Set(['List']));
    expect(listWithUnion.getImports()).toEqual(new Set(['List', 'Union']));
    expect(listWithOptional.getImports()).toEqual(new Set(['List', 'Optional']));
  });

  test('returns correct imports from sub members', () => {
    // test_member_entry_get_imports_from_sub_members
    const subEntry = new DictEntry('Nested', {
      foo: [new MemberEntry('List', [new MemberEntry('int'), new MemberEntry('str')])],
    });
    const entry = new MemberEntry('List', [
      subEntry,
      new MemberEntry('Set', [new MemberEntry('int')]),
    ]);

    expect(entry.getImports()).toEqual(new Set(['List', 'Union', 'Set']));
  });

  test("doesn't return itself with imports if unknown type import", () => {
    expect(new MemberEntry('Foo', []).getImports()).toEqual(new Set([]));
    expect(new MemberEntry('Bar', []).getImports()).toEqual(new Set([]));
  });

  test('with DictEntry', () => {
    // test_member_entry_with_dict_entry
    const dictEntry = new DictEntry('SubType', {foo: [new MemberEntry('str')]});
    const entry = new MemberEntry('List', [dictEntry]);

    expect(entry.toString()).toBe('List[SubType]');
  });
});

describe('DictEntry', () => {
  test('toString has base output', () => {
    // test_dict_entry_base_output
    const entry = new DictEntry('Root', {
      foo: [new MemberEntry('str')],
      bar: [new MemberEntry('int')],
    });

    // prettier-ignore
    expect(entry.toString()).toBe(
      [
        'class Root(TypedDict):',
        '    foo: str',
        '    bar: int'
      ].join('\n'),
    );
  });

  test('nested dicts', () => {
    // test_dict_entry_nested_dicts
    const subEntry = new DictEntry('Nested', {
      foo: [new MemberEntry('List', [new MemberEntry('int'), new MemberEntry('str')])],
    });
    const entry = new DictEntry('Root', {sub: [subEntry]});

    // prettier-ignore
    expect(entry.toString()).toBe(
      [
        'class Root(TypedDict):',
        '    sub: Nested',
      ].join('\n'),
    );
  });

  test('with member entry', () => {
    // test_dict_entry_with_member_entry
    const dictEntry = new DictEntry('SubType', {foo: [new MemberEntry('str')]});
    const memberEntry = new MemberEntry('List', [dictEntry]);
    const entry = new MemberEntry('Set', [memberEntry]);

    expect(entry.toString()).toBe('Set[List[SubType]]');
  });

  test('returns correct imports', () => {
    // test_dict_entry_get_imports
    const baseEntry = new DictEntry('Root', {foo: [new MemberEntry('str')]});
    const baseEntryWithList = new DictEntry('Root', {
      bar: [new MemberEntry('List', [new MemberEntry('int'), new MemberEntry('str')])],
    });

    expect(baseEntry.getImports()).toEqual(new Set([]));
    expect(baseEntryWithList.getImports()).toEqual(new Set(['List', 'Union']));
  });

  test('returns correct imports with sub members', () => {
    // test_dict_entry_get_imports_from_sub_members
    const subEntry = new DictEntry('Nested', {
      foo: [new MemberEntry('List', [new MemberEntry('int'), new MemberEntry('str')])],
    });
    const entry = new DictEntry('Root', {sub: [subEntry]});

    expect(entry.getImports()).toEqual(new Set(['List', 'Union']));
  });
});
