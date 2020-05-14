import {parse} from './parser';
import {Int, Float, Str, Bool, Null} from './baseTypes';

describe('Parser', () => {
  test('Basic object parsing', () => {
    const out = parse('{"foo": "bar", "baz": 10, "qux": 10.0}');

    expect(out).toEqual({foo: new Str('bar'), baz: new Int(10), qux: new Float(10)});
  });
  test('Basic list parsing', () => {
    const out = parse('["foo", "bar", 10]');

    expect(out).toEqual([new Str('foo'), new Str('bar'), new Int(10)]);
  });
  test('Basic elements parsing', () => {
    expect(parse('"foo"')).toBeInstanceOf(Str);
    expect(parse('10')).toBeInstanceOf(Int);
    expect(parse('12.2')).toBeInstanceOf(Float);
    expect(parse('null')).toBeInstanceOf(Null);
    expect(parse('true')).toBeInstanceOf(Bool);
    expect(parse('false')).toBeInstanceOf(Bool);
  });
});
