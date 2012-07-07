#!/usr/bin/env node
var authors = require('./authors').authors
var dir = process.cwd()
var print = true
authors(dir, print)
