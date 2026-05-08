process.chdir(__dirname + '/..')
process.argv = ['node', 'next', 'dev', '-p', process.env.PORT || '3000']
require('../node_modules/next/dist/bin/next')
