This demo is a test of creating a new user branch with a commit of a new file, then checking the status of mering user branch into master. This is to see if there is any race condition. 

Supply values for `server`, `owner`, `repo`, `userBranch`, `tokenid` and `checkCountMax` or use the defaults.

Set `inputsReady = true` when you are ready to check.

```js
import {useState, useEffect} from 'react';
import { checkMergeUserIntoDefaultBranch } from './checkMergeUserIntoDefaultBranch.js';

function Component() {
  const server = "https://qa.door43.org"
  const owner = "dcs-poc-org"
  // Can use: en_tn, en_tn_main_branch
  const repo = "en_tn"
  /* Can use: branch-is-same, branch-behind, 
      branch-ahead, branch-behind-and-ahead, 
      branch-conflicts
  */
  const userBranch = "dcs-poc-commit-and-check"
  const tokenid = "c8b93b7ccf7018eee9fec586733a532c5f858cdd" // for single org use of the dcs-poc user
  const checkCountMax = 4
  const inputsReady = false // set to true when settings above are ready

  const [results, setResults] = useState([])
  const [branchMade, setBranchMade] = useState(false)
  const [checkCount, setCheckCount] = useState(0)

  useEffect( () => {
    const doCommit = async () => {
      const _result = await makeCommitWithNewBranch({server, owner, repo, userBranch, tokenid})
      console.log(_result)
      if(_result.status == 422) {
        alert(`Please delete the branch ${userBranch} first and run again.`)
      } else if(_result.status == 201) {
        setBranchMade(true)
      } else {
        alert(`${_result.status}: ${_result.statusText}`)
      }
    }
    if ( (server !== "") 
      && (owner !== "") 
      && (repo !== "") 
      && (userBranch !== "" )
      && (tokenid !== "")
      && inputsReady) 
    {
      console.log("All inputs ready")
      doCommit()
    }
  }, [server, owner, repo, userBranch, tokenid, inputsReady])

  useEffect( () => {
    const doCheck = async () => {
      const _result = await checkMergeUserIntoDefaultBranch(
        {server, owner, repo, userBranch, tokenid}
      );
      setCheckCount(checkCount+1)
      setResults([...results, _result])
    }

    if ( (server !== "") 
      && (owner !== "") 
      && (repo !== "") 
      && (userBranch !== "" )
      && (tokenid !== "")
      && inputsReady && branchMade && checkCount < checkCountMax) 
    {
      console.log("Branch has been made")
      doCheck()
    }
  }, [server, owner, repo, userBranch, tokenid, inputsReady, branchMade, checkCount])

  return (results?<pre>{JSON.stringify(results,null,4)}</pre>:<>Enter settings and set `inputsReady = true`</>)
}
;

async function makeCommitWithNewBranch({server, owner, repo, userBranch, tokenid}) {
  const uri = `${server}/api/v1/repos/${owner}/${repo}/contents/new_file.txt`;
  const payload = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenid}` },
    body: `{  
        "content": "dGhpcyBpcyBhIHRlc3Q=",
        "branch": "master",
        "new_branch": "${userBranch}"
      }`,
  }
  return await fetch(uri, payload);
}

<Component />
```