import {parse} from './parser';

describe('Parser', () => {
  test('Basic object parsing', () => {
    const out = parse('{"foo": "bar", "baz": 10}');

    expect(out).toEqual({foo: 'bar', baz: 10});
  });
  test('Basic list parsing', () => {
    const out = parse('["foo", "bar", 10]');

    expect(out).toEqual(['foo', 'bar', 10]);
  });
  test('Basic elements parsing', () => {
    expect(parse('"foo"')).toEqual('foo');
    expect(parse('12.2')).toEqual(12.2);
    expect(parse('10')).toEqual(10);
    expect(parse('null')).toEqual(null);
    expect(parse('true')).toEqual(true);
    expect(parse('false')).toEqual(false);
  });
});
