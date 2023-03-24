This demo is a test of checking for an update of the user branch from master.

Supply values for `server`, `owner`, `repo`, and `tokenid` or use the defaults.

Set `inputsReady = true` when you are ready to check.

```js
import {useState, useEffect} from 'react';
import { checkMergeDefaultIntoUserBranch } from './checkMergeDefaultIntoUserBranch.js';

function Component() {
  const server = "qa.door43.org"
  const owner = "dcs-poc-org"
  // Can use: en_tn, en_tn_main_branch
  const repo = "en_tn"
  // Can use: branch-is-same, branch-behind, branch-ahead, branch-behind-and-ahead, branch-conflicts
  const userBranch = "branch-behind"
  const tokenid = "c8b93b7ccf7018eee9fec586733a532c5f858cdd" // for single org use of the dcs-poc user
  const inputsReady = false // set to true when settings above are ready
 
  const [results, setResults] = useState(null)

  useEffect( () => {
    const doCheck = async () => {
      const _results = await checkMergeDefaultIntoUserBranch(
        {server, owner, repo, userBranch, tokenid}
      );
      setResults(_results)
    }

    if ( (server !== "")
      && (owner !== "")
      && (repo !== "")
      && (userBranch !== "")
      && (tokenid !== "")
      && inputsReady)
    {
      console.log("All inputs ready")
      doCheck()
    }
  }, [server, owner, repo, userBranch, tokenid, inputsReady])

  return (results?<pre>{JSON.stringify(results,null,4)}</pre>:<>Enter settings and set `inputsReady = true`</>)
}

<Component />
```