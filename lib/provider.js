'use babel'

import os from 'os'
import glob from 'glob'

export function provideBuilder() {
  
  function flatMap(arr, f) {
    return Array.prototype.concat.apply([], arr.map(f))
  }
  
  let errorMatch = [
    '\\s*(?<file>.+)\\((?<line>\\d+),(?<col>\\d+)\\):\\s*error\\s+(?<message>.+)',
    '\\s*(?<file>.+)\\((?<line>\\d+),255\\+\\):\\s*error\\s+(?<message>.+)',
    '\\s*(?<file>.+):\\s+error\\s*:\\s*(?<message>.+)'
  ]

  let warningMatch = [
    '\\s*(?<file>.+)\\((?<line>\\d+),(?<col>\\d+)\\): warning (?<message>.+)',
    '\\s*(?<file>.+)\\((?<line>\\d+),255\\+\\): warning (?<message>.+)',
    '\\s*(?<file>.+):\\s+warning\\s*:\\s*(?<message>.+)'
  ]

  return class XbuildProvider {
    
    constructor(cwd) {
      this.cwd = cwd
      this.cmd = os.platform() == 'darwin' || os.platform() == 'linux' ? 'xbuild' : 'msbuild'
    }
    
    getNiceName() {
      return 'Xbuild'
    }
    
    isEligible() {
      return this.solutions().length >= 1
    }
    
    solutions() {
      return glob.sync(this.cwd + '/*.sln')
    }
    
    settings() {
      let solutions = this.solutions()
      return flatMap(['Build', 'Clean', 'Rebuild'], target => {
        
        return flatMap(solutions, solution => {
          let solutionName = solution.slice(solution.lastIndexOf('/')+1)

          return flatMap(['Debug', 'Release'], configuration => {
            return [
              {
                exec: this.cmd,
                name: solutionName + ': ' + target + ' ' + configuration,
                args: [solution, '/t:' + target, '/p:Configuration=' + configuration],
                atomCommandName: 'build-xbuild:' + target.toLowerCase() + '-' + configuration.toLowerCase() + '-' + solutionName,
                errorMatch: errorMatch,
                warningMatch: warningMatch
              }
            ]
          })
        })
      })
    }
    
  }
}
