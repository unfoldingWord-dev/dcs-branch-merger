import Path from 'path'
import { getPrJson } from './common'
import { getRepoJson } from './common'
import { apiPath } from './constants'

/*
  Reference swagger:
  https://qa.door43.org/api/swagger#/repository/repoMergePullRequest

  Example API:
  https://qa.door43.org/api/v1/repos/unfoldingWord/en_ult/pulls/3361/merge
*/
export async function mergePullRequest({
  server, owner, repo, prId, head, tokenid
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
    Path.join(apiPath,'repos',owner,repo,'pulls',prId,'merge')

  let res_json = {};
  try {
    const res = await fetch(uri+`?token=${tokenid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{
        "Do": "merge",
        "MergeCommitID": "${head}",
        "MergeMessageField": "Merge PR ${prId}",
        "MergeTitleField": "Merge PR ${prId}",
        "delete_branch_after_merge": true,
        "force_merge": true,
        "head_commit_id": "${head}",
        "merge_when_checks_succeed": false
      }`,
    })
    res_json = await res.json()
    console.log("res, res_json",res,res_json)
    if ( res.status === 200 ) {
      returnObject.success = true;
      returnObject.status = res.status;
    } else {
      returnObject.status = res.status;
      returnObject.message = res_json.message;
    }
  } catch (e) {
    console.log("e:",e)
  }

  return returnObject;
}

