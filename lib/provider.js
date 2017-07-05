'use babel'

import os from 'os'
import glob from 'glob'

export function provideBuilder() {
  
  function flatMap(arr, f) {
    return Array.prototype.concat.apply([], arr.map(f))
  }
  
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
      let settings = flatMap(this.solutions(), solution => {
        
        let solutionName = solution.slice(solution.lastIndexOf('/')+1)
        
        return flatMap(['Build', 'Rebuild', 'Clean'], target => {
          return flatMap(['Debug', 'Release'], configuration => {
            return [{
              'exec': this.cmd,
              'name': target + ' ' + solutionName + ' ' + configuration,
              'args': [solution, '/t:' + target, '/p:Configuration=' + configuration]
            }]
          })
        })
      })
      
      console.log(settings)
      return settings
    }
    
  }
}
