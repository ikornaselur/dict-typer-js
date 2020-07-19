import {Int, Float, Str, Bool, Null} from './baseTypes';
import {Source} from './types';

const isHexadecimal = (char: string): boolean => {
  return (char >= '0' && char <= '9') || (char.toLowerCase() >= 'a' && char.toLowerCase() <= 'f');
};

/* A custom JSON parser, based very heavily on the parser described by Tan Li Hau
 * in their blog at https://lihautan.com/json-parser-with-javascript/
 *
 * The parser uses base types that are useful for this library, to distinguish
 * between floats and integers, as Python has those two values. This is because
 * Javascript doesn't distinguish between 10.0 and 10, as all numbers in
 * Javascript are floats, while the this library should process {"foo": 5.5} and
 * {"foo": 5.0} as same DictTypes
 */
class Parser {
  #str: string;
  #idx: number;

  constructor(str: string) {
    this.#str = str;
    this.#idx = 0;
  }

  parse(): Source {
    return this.parseValue();
  }

  /*
   * Skippers
   */
  skipWhitespace(): void {
    while (
      this.#str[this.#idx] === ' ' ||
      this.#str[this.#idx] === '\n' ||
      this.#str[this.#idx] === '\t' ||
      this.#str[this.#idx] === '\r'
    ) {
      this.#idx++;
    }
  }

  /*
   * Eaters
   */
  eatColon(): void {
    if (this.#str[this.#idx] !== ':') {
      throw new Error('Expeced ":"');
    }
    this.#idx++;
  }
  eatComma(): void {
    if (this.#str[this.#idx] !== ',') {
      throw new Error('Expected ","');
    }
    this.#idx++;
  }

  /*
   * Parsers
   */
  parseString(): Str | undefined {
    const value = this.parseStringRaw();
    if (value !== undefined) {
      return new Str(value);
    }
  }

  parseStringRaw(): string | undefined {
    if (this.#str[this.#idx] === '"') {
      this.#idx++;
      let result = '';
      while (this.#str[this.#idx] !== '"') {
        if (this.#str[this.#idx] === '\\') {
          const char = this.#str[this.#idx + 1];
          if (
            char === '"' ||
            char === '\\' ||
            char === '/' ||
            char === 'b' ||
            char === 'f' ||
            char === 'n' ||
            char === 'r' ||
            char === 't'
          ) {
            result += char;
            this.#idx++;
          } else if (char === 'u') {
            if (
              isHexadecimal(this.#str[this.#idx + 2]) &&
              isHexadecimal(this.#str[this.#idx + 3]) &&
              isHexadecimal(this.#str[this.#idx + 4]) &&
              isHexadecimal(this.#str[this.#idx + 5])
            ) {
              result += String.fromCharCode(
                parseInt(this.#str.slice(this.#idx + 2, this.#idx + 6), 16),
              );
              this.#idx += 5;
            }
          }
        } else {
          result += this.#str[this.#idx];
        }
        this.#idx++;
      }
      this.#idx++;
      return result;
    }
  }
  parseNumber(): Int | Float | undefined {
    const start = this.#idx;
    let floatNumber = false;
    if (this.#str[this.#idx] === '-') {
      this.#idx++;
    }
    if (this.#str[this.#idx] === '0') {
      this.#idx++;
    } else if (this.#str[this.#idx] >= '1' && this.#str[this.#idx] <= '9') {
      this.#idx++;
      while (this.#str[this.#idx] >= '0' && this.#str[this.#idx] <= '9') {
        this.#idx++;
      }
    }

    if (this.#str[this.#idx] === '.') {
      floatNumber = true;
      this.#idx++;
      while (this.#str[this.#idx] >= '0' && this.#str[this.#idx] <= '9') {
        this.#idx++;
      }
    }
    if (this.#str[this.#idx] === 'e' || this.#str[this.#idx] === 'E') {
      this.#idx++;
      if (this.#str[this.#idx] === '-' || this.#str[this.#idx] === '+') {
        this.#idx++;
      }
      while (this.#str[this.#idx] >= '0' && this.#str[this.#idx] <= '9') {
        this.#idx++;
      }
    }
    if (this.#idx > start) {
      const value = Number(this.#str.slice(start, this.#idx));
      if (floatNumber) {
        return new Float(value);
      } else {
        return new Int(value);
      }
    }
  }
  parseKeyword<T extends Bool | Null>(key: string, value: T): T | undefined {
    if (this.#str.slice(this.#idx, this.#idx + key.length) === key) {
      this.#idx += key.length;
      return value;
    }
  }
  parseObject(): object | undefined {
    if (this.#str[this.#idx] === '{') {
      this.#idx++;
      this.skipWhitespace();

      const result: {[index: string]: Source} = {};

      let initial = true;
      while (this.#str[this.#idx] !== '}') {
        if (!initial) {
          this.eatComma();
          this.skipWhitespace();
        }

        const key = this.parseStringRaw();
        if (!key) {
          throw new Error('Key not found');
        }

        this.skipWhitespace();
        this.eatColon();

        const value = this.parseValue();

        result[key] = value;
        initial = false;
      }
      this.#idx++; // Moving over '}'
      return result;
    }
  }
  parseArray(): Source[] | undefined {
    if (this.#str[this.#idx] === '[') {
      this.#idx++;
      this.skipWhitespace();

      const result = [];
      let initial = true;
      while (this.#str[this.#idx] !== ']') {
        if (!initial) {
          this.eatComma();
        }
        const value = this.parseValue();
        result.push(value);
        initial = false;
      }
      this.#idx++; // Moving over ']'
      return result;
    }
  }
  parseValue(): Source {
    this.skipWhitespace();
    const value =
      this.parseString() ??
      this.parseNumber() ??
      this.parseObject() ??
      this.parseArray() ??
      this.parseKeyword('true', new Bool(true)) ??
      this.parseKeyword('false', new Bool(false)) ??
      this.parseKeyword('null', new Null(null));
    this.skipWhitespace();
    if (!value) {
      throw new Error('Unable to get value');
    }
    return value;
  }
}

export const parse = (str: string): Source => {
  // Error checking the input is just done by using the built in JSON parser
  try {
    JSON.parse(str);
  } catch (error) {
    throw new Error(`Unable to parse input string: ${error}`);
  }

  const parser = new Parser(str);

  return parser.parse();
};
