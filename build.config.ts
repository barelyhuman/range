import { execSync } from 'child_process'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  hooks: {
    'build:done': () => {
      execSync('npx esbuild --minify dist/index.mjs --outfile=dist/index.min.js')
    },
  },
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
