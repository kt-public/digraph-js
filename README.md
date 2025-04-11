[![CI](https://github.com/kt-public/digraph-js/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kt-public/digraph-js/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=bugs)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=kt-public_digraph-js&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=kt-public_digraph-js)

# ya-digraph-js

Based on the idea of https://github.com/antoine-coulon/digraph-js

Make Directed Graphs traversal and construction effortless, also includes deep circular dependency detection.

# Dual-type package

This package is compiled into a dual-type module es6 and commonjs, so it can be used in both environments. For example, azure functions have issues at the moment with using es6 modules.
