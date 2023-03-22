import Path from 'path'
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
  let res = {}
  try {
    res = await fetch(uri+'?token='+tokenid, {
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
    const pr_json = await res.json()
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
      // now that we have the PR, get the JSON data for it
      // example: https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls/3358
      const uri = "https://" + server + '/' + Path.join(apiPath,'repos',owner,repo,'pulls')

    }
  } catch (e) {
    console.log("e:",e)
  }

  return res
}

