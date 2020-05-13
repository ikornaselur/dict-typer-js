//import {Int, Float, Str} from './baseTypes';
import {BaseSource} from './types';

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
  parseString(): string | null {
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
  parseNumber(): number | null {
    const start = this.#idx;
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
      return Number(this.#str.slice(start, this.#idx));
    }
  }
  parseKeyword<T extends boolean | null>(key: string, value: T): T {
    if (this.#str.slice(this.#idx, this.#idx + key.length) === key) {
      this.#idx += key.length;
      return value;
    }
  }
  parseObject(): object | null {
    if (this.#str[this.#idx] === '{') {
      this.#idx++;
      this.skipWhitespace();

      const result = {};

      let initial = true;
      while (this.#str[this.#idx] !== '}') {
        if (!initial) {
          this.eatComma();
          this.skipWhitespace();
        }

        const key = this.parseString();

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
  parseArray(): BaseSource[] | null {
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
  parseValue(): BaseSource {
    this.skipWhitespace();
    const value =
      this.parseString() ??
      this.parseNumber() ??
      this.parseObject() ??
      this.parseArray() ??
      this.parseKeyword('true', true) ??
      this.parseKeyword('false', false) ??
      this.parseKeyword('null', null);
    this.skipWhitespace();
    return value;
  }

  parse(): BaseSource {
    return this.parseValue();
  }
}

export const parse = (str: string): BaseSource => {
  const parser = new Parser(str);

  return parser.parse();
};
