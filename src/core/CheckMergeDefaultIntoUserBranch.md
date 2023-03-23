This demo is a test of checking for an update of the user branch from master.
You must supply values server, owner, repo, userName, userBranch, and tokenid.

```js
import {useState, useEffect} from 'react';
import { checkMergeDefaultIntoUserBranch } from './checkMergeDefaultIntoUserBranch.js';

function Component() {
  const server = "qa.door43.org"
  const owner = "unfoldingWord"
  const repo = "en_ult"
  const userName = "cecil.new"
  const userBranch = "gt-RUT-cecil.new"
  const tokenid = ""

  const [results, setResults] = useState(null)

  useEffect( () => {
    const doCheck = async () => {
      const _results = await checkMergeDefaultIntoUserBranch(
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