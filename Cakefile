fs = require 'fs'
path = require 'path'
{print} = require 'sys'
{spawn, exec} = require 'child_process'

task 'doc', 'Generate annotated source code with Docco', ()->
  docco = exec 'docco ./*.js test/extend*.js', (err) ->
    throw err if err
  docco.stdout.on 'data', (data) -> print data.toString()
  docco.stderr.on 'data', (data) -> print data.toString()
  docco.on 'exit', (status) -> callback?() if status is 0
