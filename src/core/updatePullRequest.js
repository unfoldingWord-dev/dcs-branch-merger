import Path from 'path'
import { getPrJson } from './common'
import { getRepoJson } from './common'
import { apiPath } from './constants'

/*
  Reference swagger:
  https://qa.door43.org/api/swagger#/repository/repoUpdatePullRequest
  Example API:
  https://qa.door43.org/api/v1/repos/unfoldingWord/en_ult/pulls/3346/update?style=merge
*/
export async function updatePullRequest({
  server, owner, repo, prId, tokenid, style="merge"
}) {
  let returnObject = { success: false, status: "", message: "" };

  // verify inputs
  const res = await getRepoJson( { server, owner, repo })
  if (res.status != "200") {
    returnObject.status = res.status;
    returnObject.message = `repository ${owner}/${repo} not found`;
    return returnObject;
  }

  const uri = "https://" + server + '/' + 
    Path.join(apiPath,'repos',owner,repo,'pulls',prId,'update')

  let res_json = {};
  try {
    const res = await fetch(uri+`?style=${style}&token=${tokenid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '',
    })
    res_json = await res.json()
    console.log("res, res_json",res,res_json)
    if ( res.status === 200 ) {
      returnObject.success = true;
      returnObject.status = res.status;
    } else if ( res.status === 500 ) {
      returnObject.success = true;
      returnObject.status = res.status;
      returnObject.message = res_json.message;
    } else {
      returnObject.status = res.status;
      returnObject.message = res_json.message;
    }
  } catch (e) {
    console.log("e:",e)
  }

  return returnObject;
}

