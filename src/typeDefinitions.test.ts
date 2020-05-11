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
    expect(getTypeDefinitions(source)).toBe([
        "from typing_extensions import TypedDict",
        "",
        "",
        "class Root(TypedDict):",
        "    value: None",
    ].join('\n'));
  });
});
