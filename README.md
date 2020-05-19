# Dict-Typer JS

A JS port of the Python library [dict-typer](https://github.com/ikornaselur/dict-typer).

Mainly used to play around with TypeScript and Javascript in general and to be
able to create a simple web site to do the conversion. See the original library
for more info for now.

The port only focuses on working with valid json input, while the Python
library aims to support any Python types

## Tests

This project aims to have the same coverage of unit tests as the Python
library, to be able to check that, each unit tests will start with a comment
with the name of the equivalent Python unit test.

For example, a unit test equivalent to `test_a_unit_test` would be:

```javascript
  test('a unit test', () => {
    // test_a_unit_test
    const source = ...

    expect(getTypeDefinitions(source)).toBe(...);
  });
```

Then there's a simple (Python for now) script that will cross reference the
tests to see if there are any missing tests. Set the following two env
variables

```shell
PYTHON_TESTS_PATH=/path/to/dict-typer/py/tests/unit
JAVASCRIPT_TESTS_PATH=/path/to/dict-typer/js/src
```

set up the env with `poetry install --no-dev` and run `poetry run python
compare.py` to get a short report of how the coverage.

```shell
-> % poetry run python compare.py
[-] test_utils.py
[+] |  test_is_covered
[+] |  |  index.test.ts:'covered test'
[/] |  test_is_ignored
[-] |  test_is_missing

[+] Covered: 1
[/] Ignored: 1
[-] Missing: 1
```
