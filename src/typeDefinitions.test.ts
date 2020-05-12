import {getTypeDefinitions} from './typeDefinitions';

describe('Basics', () => {
  test('simple json', () => {
    // test_convert_simple_json
    const source = {id: 123, item: 'value', progress: 0.71};

    // prettier-ignore
    expect(getTypeDefinitions(source)).toBe([
        "from typing_extensions import TypedDict",
        "",
        "",
        "class Root(TypedDict):",
        "    id: int",
        "    item: str",
        "    progress: float",
    ].join('\n'));
  });

  test('base types', () => {
    // test_convert_base_types
    const source = {
      boolType: true,
      floatType: 1.23,
      intType: 120,
      strType: 'hello',
      noneType: null,
      listType: [1, 2, 3],
    };

    // prettier-ignore
    expect(getTypeDefinitions(source)).toBe([
        "from typing import List",
        "",
        "from typing_extensions import TypedDict",
        "",
        "",
        "class Root(TypedDict):",
        "    boolType: bool",
        "    floatType: float",
        "    intType: int",
        "    strType: str",
        "    noneType: None",
        "    listType: List[int]",
    ].join('\n'));
  });

  test('convert none', () => {
    // test_convert_none
    const source = {value: null};

    // prettier-ignore
    expect(getTypeDefinitions(source)).toBe(
      [
        "from typing_extensions import TypedDict",
        "",
        "",
        "class Root(TypedDict):",
        "    value: None",
      ].join('\n')
    );
  });
});

describe('Dicts', () => {
  test('empty root dicts', () => {
    // test_convert_empty_root_dict
    const source = {};

    // prettier-ignore
    expect(getTypeDefinitions(source)).toBe(
      [
        "from typing_extensions import TypedDict",
        "",
        "",
        "class Root(TypedDict):",
        "    pass",
      ].join('\n')
    );
  });
  test('nested empty dict', () => {
    // test_convert_with_nested_empty_dict
    const source = {nest: {}};

    expect(getTypeDefinitions(source)).toBe(
      [
        'from typing_extensions import TypedDict',
        '',
        '',
        'class Nest(TypedDict):',
        '    pass',
        '',
        '',
        'class Root(TypedDict):',
        '    nest: Nest',
      ].join('\n'),
    );
  });
  test('nested dict', () => {
    // test_convert_with_nested_dict
    const source = {nest: {foo: 'bar'}};

    expect(getTypeDefinitions(source)).toBe(
      [
        'from typing_extensions import TypedDict',
        '',
        '',
        'class Nest(TypedDict):',
        '    foo: str',
        '',
        '',
        'class Root(TypedDict):',
        '    nest: Nest',
      ].join('\n'),
    );
  });
  test('multiple levels nested dict', () => {
    // test_convert_with_multiple_levels_nested_dict
    const source = {level1: {level2: {level3: {level4: 'foo'}}}};

    expect(getTypeDefinitions(source)).toBe(
      [
        'from typing_extensions import TypedDict',
        '',
        '',
        'class Level3(TypedDict):',
        '    level4: str',
        '',
        '',
        'class Level2(TypedDict):',
        '    level3: Level3',
        '',
        '',
        'class Level1(TypedDict):',
        '    level2: Level2',
        '',
        '',
        'class Root(TypedDict):',
        '    level1: Level1',
      ].join('\n'),
    );
  });
  test('multiple nested dict', () => {
    // test_convert_with_multiple_nested_dict
    const source = {nest: {foo: 'bar'}, otherNest: {baz: 'qux'}};

    expect(getTypeDefinitions(source)).toBe(
      [
        'from typing_extensions import TypedDict',
        '',
        '',
        'class Nest(TypedDict):',
        '    foo: str',
        '',
        '',
        'class OtherNest(TypedDict):',
        '    baz: str',
        '',
        '',
        'class Root(TypedDict):',
        '    nest: Nest',
        '    otherNest: OtherNest',
      ].join('\n'),
    );
  });
  test('repeated nested dict', () => {
    // test_convert_with_repeated_nested_dict
    const source = {
      nest: {foo: 'bar'},
      otherNest: {foo: 'qux'},
      uniqueNest: {baz: 'qux'},
    };

    expect(getTypeDefinitions(source)).toBe(
      [
        'from typing_extensions import TypedDict',
        '',
        '',
        'class Nest(TypedDict):',
        '    foo: str',
        '',
        '',
        'class UniqueNest(TypedDict):',
        '    baz: str',
        '',
        '',
        'class Root(TypedDict):',
        '    nest: Nest',
        '    otherNest: Nest',
        '    uniqueNest: UniqueNest',
      ].join('\n'),
    );
  });
  test('Nested overlapping dict', () => {
    // test_convert_nested_overlapping_dict
    const source = [{x: {foo: 'bar'}}, {x: {baz: 'qux'}}];

    expect(getTypeDefinitions(source)).toBe(
      [
        'from typing import List, Union',
        '',
        'from typing_extensions import TypedDict',
        '',
        '',
        'class X(TypedDict):',
        '    foo: str',
        '',
        '',
        'class X1(TypedDict):',
        '    baz: str',
        '',
        '',
        'class RootItem0(TypedDict):',
        '    x: Union[X, X1]',
        '',
        '',
        'Root = List[RootItem0]',
      ].join('\n'),
    );
  });
});
