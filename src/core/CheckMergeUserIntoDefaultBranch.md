This demo is a test of checking for a merge of the user branch into the default branch.
You must supply values server, owner, repo, userName, userBranch, and tokenid.


```js
import {useState, useEffect} from 'react';
import { checkMergeUserIntoDefaultBranch } from './checkMergeUserIntoDefaultBranch.js';

function Component() {
  const server = "qa.door43.org"
  const owner = "unfoldingWord"
  const repo = "en_tn"
  const userName = "richmahn"
  const userBranch = "richmahn-tc-create-1"
  const tokenid = ""

  const [results, setResults] = useState(null)

  useEffect( () => {
    const doCheck = async () => {
      const _results = await checkMergeUserIntoDefaultBranch(
        {server, owner, repo, userName, userBranch, tokenid}
      );
      setResults(_results)
    }

    if ( (server !== "") 
      && (owner !== "") 
      && (repo !== "") 
      && (userName !== "") 
      && (userBranch !== "") 
      && (tokenid !== "")) 
    {
      console.log("All inputs ready")
      doCheck()
    }


  }, [server, owner, repo, userName, userBranch, tokenid])

  return (
  <>
  <pre>{JSON.stringify(results,null,4)}</pre>
  </>
  )
}
;

<Component />
```