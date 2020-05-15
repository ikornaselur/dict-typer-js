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
