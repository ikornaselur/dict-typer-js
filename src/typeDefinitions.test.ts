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
});
