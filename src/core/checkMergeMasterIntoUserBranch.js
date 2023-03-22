import Path from 'path'
import { apiPath } from './constants'

/*
  Reference swagger:
  https://qa.door43.org/api/swagger#/repository/repoCreatePullRequest
*/
export async function checkMergeMasterIntoUserBranch({
  server, owner, repo, userName, userBranch, tokenid,
}) {
  const date = new Date(Date.now())
  const dateString = date.toISOString()
  const uri = server + '/' + Path.join(apiPath,'repos',owner,repo,'pulls')
  const res = await fetch(uri+'?token='+tokenid, {
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

  return res
}

