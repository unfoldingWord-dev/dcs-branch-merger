import Path from 'path'
import { getPrJson } from './common'
import { apiPath } from './constants'

/*
  Reference swagger:
  https://qa.door43.org/api/swagger#/repository/repoCreatePullRequest
*/
export async function checkMergeDefaultIntoUserBranch({
  server, owner, repo, userName, userBranch, tokenid,
}) {
  const date = new Date(Date.now())
  const dateString = date.toISOString()
  const uri = "https://" + server + '/' + Path.join(apiPath,'repos',owner,repo,'pulls')
  let pr_json = {};
  let returnObject = { syncNeeded: false, conflict: false, message: "" };
  try {
    let res = await fetch(uri+'?token='+tokenid, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{
        "assignee": "${userName}",
        "assignees": [
          "${userName}"
        ],
        "base": "master",
        "body": "Merge master into user branch by ${userName}",
        "due_date": "${dateString}",
        "head": "${userBranch}",
        "labels": [
          0
        ],
        "milestone": 0,
        "title": "${userBranch}"
      }`,
    })
    pr_json = await res.json()
    if ( res.status === 409 ) {
      // then the body.message will contain the pr number
      const msg = pr_json.message
      // have to parse the text returned. Hopefully it doesn't change!
      // here is an example: 
      // message:
      //"pull request already exists for these targets 
      // [id: 11033, 
      // issue_id: 3358, <<<--- this is the PR number
      // head_repo_id: 11419, 
      // base_repo_id: 11419, 
      // head_branch: gt-RUT-cecil.new, 
      // base_branch: master]"
      const pr_id = msg.split("issue_id: ")[1].split(",")[0]
      console.log("pr_id:", pr_id)
      pr_json = await getPrJson( { server, owner, repo, prId: pr_id })
    }

    // now interpret the JSON and return the values
    // the attributes needed...
    console.log("pj_json:",pr_json);
    const mergeable = pr_json.mergeable;
    const headSha = pr_json.head.sha;
    const baseSha = pr_json.base.sha;
    const mergeable_base = pr_json.mergeable_base;
    // template return
    // case 1
    if ( mergeable ) {
      returnObject.conflict = false;
      if ( headSha === baseSha && baseSha === mergeable_base ) {
        returnObject.syncNeeded = false
      } else if ( headSha !== baseSha && headSha === mergeable_base ) {
        returnObject.syncNeeded = false
      } else if ( headSha !== baseSha && baseSha === mergeable_base ) {
        returnObject.syncNeeded = true
      } else if ( headSha === baseSha && baseSha !== mergeable_base ) {
        returnObject.syncNeeded = true
      } else if ( headSha !== mergeable_base && baseSha !== mergeable_base ) {
        returnObject.syncNeeded = true
     }
    } else {
      returnObject.conflict = true;
    }
{}
  } catch (e) {
    console.log("e:",e)
  }

  return returnObject;
}

