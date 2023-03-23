This demo is a test of updating the user branch from master
You must supply values server, owner, repo, userName, userBranch, pull request id, and tokenid.

Generally, do the demo on checking on the merging master into user branch first. 
Save the Pull Request number returned from that function for this one.

```js
import {useState, useEffect} from 'react';
import { updatePullRequest } from './updatePullRequest.js';

function Component() {
  const server = "qa.door43.org"
  const owner = "unfoldingWord"
  const repo = "en_tn"
  const prId = ""
  const tokenid = ""

  const [results, setResults] = useState(null)

  useEffect( () => {
    const doCheck = async () => {
      const _results = await updatePullRequest(
        {server, owner, repo, prId, tokenid}
      );
      setResults(_results)
    }

    if ( (server !== "") 
      && (owner !== "") 
      && (repo !== "") 
      && (prId !== "" )
      && (tokenid !== "")) 
    {
      console.log("All inputs ready")
      doCheck()
    }


  }, [server, owner, repo, prId, tokenid])

  return (
  <>
  <pre>{JSON.stringify(results,null,4)}</pre>
  </>
  )
}
;

<Component />
```