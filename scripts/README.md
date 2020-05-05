# Scripts

A script that takes in the unit tests of the python library and searches
through all the unit tests in the JS port of it and identifies which Python
tests are not ported over.

A JS test is considered covering a python test if it starts with a comment that
is the name of a python test
