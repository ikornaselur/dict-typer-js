import {DictEntry, MemberEntry} from './models';

/* Types for parsing */

class BaseType<T> {
  #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  get value(): T {
    return this.#value;
  }
}

export class Int extends BaseType<number> {}
export class Float extends BaseType<number> {}
export class Str extends BaseType<string> {}
export class Bool extends BaseType<boolean> {}
export class Null extends BaseType<null> {}

export type Base = Int | Float | Str | Bool | Null;
export type Dict = {
  [key: string]: Base | Dict | List;
};
export type List = Array<Base | Dict | List>;
export type Source = Base | Dict | List;

/* Types for conversion models */

export type EntryType = MemberEntry | DictEntry;
export type SubMembers = EntryType[];
export type DictMembers = {[memberName: string]: SubMembers};
