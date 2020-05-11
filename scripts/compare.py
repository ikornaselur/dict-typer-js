import click
import os
import re
from typing import Dict, List

IGNORED = [
    "test_member_entry_is_hashable_based_on_str_out",
    "test_convert_with_empty_set",
    "test_convert_with_simple_set",
    "test_convert_with_mixed_set",
    "test_convert_with_empty_tuple",
    "test_convert_with_simple_tuple",
    "test_convert_with_mixed_tuple",
]


def get_py_tests(path: str) -> Dict[str, List[str]]:
    pattern = r"def (test_[a-z_]+)\(.*"
    tests = {}

    for test_file in os.listdir(path):
        if not test_file.startswith("test_"):
            continue
        with open(os.path.join(path, test_file), "r") as f:
            tests[test_file] = re.findall(pattern, f.read())

    return tests


def get_js_tests(path: str) -> Dict[str, List[str]]:
    pattern = re.compile(
        r"test\('([\w\s]+)', \(\) => {\n\s+// (test_[a-z_]+)", re.MULTILINE
    )
    tests = {}

    for test_file in os.listdir(path):
        if ".test." not in test_file:
            continue
        with open(os.path.join(path, test_file), "r") as f:
            tests[test_file] = re.findall(pattern, f.read())

    return tests


def run() -> None:
    py_test_path = os.environ["PYTHON_TESTS_PATH"]
    js_test_path = os.environ["JAVASCRIPT_TESTS_PATH"]

    py_tests = get_py_tests(py_test_path)
    js_tests = get_js_tests(js_test_path)

    # Naive and inefficient, but it's a script, so don't really care
    for py_test_file, py_test_names in py_tests.items():
        to_output = []
        file_colour = "green"
        for py_test_name in py_test_names:
            if py_test_name in IGNORED:
                to_output.append({"message": f" |  {py_test_name}", "fg": "yellow"})
                if file_colour == "green":
                    file_colour = "yellow"
                continue
            covered_by = None
            for js_test_file, js_test_names in js_tests.items():
                for js_test_name, covered_py_test in js_test_names:
                    if covered_py_test == py_test_name:
                        covered_by = (js_test_file, js_test_name)
                        break
            if covered_by is None:
                file_colour = "red"
                to_output.append({"message": f" |  {py_test_name}", "fg": "red"})
            else:
                to_output.append({"message": f" |  {py_test_name}", "fg": "green"})
                to_output.append(
                    {
                        "message": f" |  |  {covered_by[0]}:'{covered_by[1]}'",
                        "fg": "green",
                    }
                )

        click.secho(f"{py_test_file}", fg=file_colour)
        for output in to_output:
            click.secho(**output)  # type: ignore


if __name__ == "__main__":
    run()
