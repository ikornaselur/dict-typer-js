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
export const parse = (str: string): BaseSource => {
  let i = 0;

  let parseValue: () => BaseSource; // eslint-disable-line prefer-const

  const skipWhitespace = (): void => {
    while (str[i] === ' ' || str[i] === '\n' || str[i] === '\t' || str[i] === '\r') {
      i++;
    }
  };

  const eatColon = (): void => {
    if (str[i] !== ':') {
      throw new Error('Expeced ":"');
    }
    i++;
  };
  const eatComma = (): void => {
    if (str[i] !== ',') {
      throw new Error('Expected ","');
    }
    i++;
  };

  const parseString = (): string | null => {
    if (str[i] === '"') {
      i++;
      let result = '';
      while (str[i] !== '"') {
        if (str[i] === '\\') {
          const char = str[i + 1];
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
            i++;
          } else if (char === 'u') {
            if (
              isHexadecimal(str[i + 2]) &&
              isHexadecimal(str[i + 3]) &&
              isHexadecimal(str[i + 4]) &&
              isHexadecimal(str[i + 5])
            ) {
              result += String.fromCharCode(parseInt(str.slice(i + 2, i + 6), 16));
              i += 5;
            }
          }
        } else {
          result += str[i];
        }
        i++;
      }
      i++;
      return result;
    }
  };
  const parseKey = (): string => {
    return parseString();
  };
  const parseNumber = (): number | null => {
    const start = i;
    if (str[i] === '-') {
      i++;
    }
    if (str[i] === '0') {
      i++;
    } else if (str[i] >= '1' && str[i] <= '9') {
      i++;
      while (str[i] >= '0' && str[i] <= '9') {
        i++;
      }
    }

    if (str[i] === '.') {
      i++;
      while (str[i] >= '0' && str[i] <= '9') {
        i++;
      }
    }
    if (str[i] === 'e' || str[i] === 'E') {
      i++;
      if (str[i] === '-' || str[i] === '+') {
        i++;
      }
      while (str[i] >= '0' && str[i] <= '9') {
        i++;
      }
    }
    if (i > start) {
      return Number(str.slice(start, i));
    }
  };
  const parseKeyword = <T extends boolean | null>(key: string, value: T): T => {
    if (str.slice(i, i + key.length) === key) {
      i += key.length;
      return value;
    }
  };
  const parseObject = (): object | null => {
    if (str[i] === '{') {
      i++;
      skipWhitespace();

      const result = {};

      let initial = true;
      while (str[i] !== '}') {
        if (!initial) {
          eatComma();
          skipWhitespace();
        }

        const key = parseKey();

        skipWhitespace();
        eatColon();

        const value = parseValue();

        result[key] = value;
        initial = false;
      }
      i++; // Moving over '}'
      return result;
    }
  };
  const parseArray = (): BaseSource[] | null => {
    if (str[i] === '[') {
      i++;
      skipWhitespace();

      const result = [];
      let initial = true;
      while (str[i] !== ']') {
        if (!initial) {
          eatComma();
        }
        const value = parseValue();
        result.push(value);
        initial = false;
      }
      i++; // Moving over ']'
      return result;
    }
  };
  parseValue = (): BaseSource => {
    skipWhitespace();
    const value =
      parseString() ??
      parseNumber() ??
      parseObject() ??
      parseArray() ??
      parseKeyword('true', true) ??
      parseKeyword('false', false) ??
      parseKeyword('null', null);
    skipWhitespace();
    return value;
  };

  return parseValue();
};
