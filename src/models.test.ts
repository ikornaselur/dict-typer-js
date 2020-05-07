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

  test("doesn't return itself with imports if unknown type import", () => {
    expect(new MemberEntry('Foo', []).getImports()).toEqual(new Set([]));
    expect(new MemberEntry('Bar', []).getImports()).toEqual(new Set([]));
  });

  test('get imports from sub members', () => {
    // test_member_entry_get_imports_from_sub_members
    /*
    sub_entry = DictEntry(
        "NestedType",
        members={
            "foo": {
                MemberEntry(
                    "List", sub_members={MemberEntry("int"), MemberEntry("str")}
                )
            }
        },
    )
    entry = MemberEntry(
        "List",
        sub_members={sub_entry, MemberEntry("Set", sub_members={MemberEntry("int")})},
    )

    assert entry.get_imports() == {"List", "Union", "Set"}
     */
  });
});

describe('DictEntry', () => {
  test('toString has base output', () => {
    // test_dict_entry_base_output
    const entry = new DictEntry('RootType', {
      foo: [new MemberEntry('str')],
      bar: [new MemberEntry('int')],
    });

    // prettier-ignore
    expect(entry.toString()).toBe(
      [
        'class RootType(TypedDict):',
        '    foo: str',
        '    bar: int'
      ].join('\n'),
    );
  });

  test('nested dicts', () => {
    // test_dict_entry_nested_dicts
    const subEntry = new DictEntry('NestedType', {
      foo: [new MemberEntry('List', [new MemberEntry('int'), new MemberEntry('str')])],
    });
    const entry = new DictEntry('RootType', {sub: [subEntry]});

    // prettier-ignore
    expect(entry.toString()).toBe(
      [
        'class RootType(TypedDict):',
        '    sub: NestedType',
      ].join('\n'),
    );
  });
});
