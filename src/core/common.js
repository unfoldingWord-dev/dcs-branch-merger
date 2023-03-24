import Path from 'path'
import { apiPath } from './constants'


// example: GET https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls/3358
export async function getPrJson({
  server, owner, repo, prId,
}) {
  console.log(server, owner, repo, prId)
  const uri = "https://" + server + '/' + Path.join(apiPath, 'repos', owner, repo, 'pulls', prId)
  let res = {}
  try {
    res = await fetch(uri);
  } catch (e) {
    return null
  }
  return res.json()
}

// example: GET https://qa.door43.org/api/v1/user
export async function getUserJson({
  server, tokenid
}) {
  console.log(server, tokenid)
  const uri = "https://" + server + '/' + Path.join(apiPath, 'user')
  let res = await fetch(uri, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenid}` },
  })
  console.log("getUserJson res.Status: ", res.status)
  switch (res.status) {
    case 401:
      throw Error("invalid token")
    case 200:
      console.log("HERE2")
      return await res.json()
    default:
      console.log("HERE3")
      throw Error("unknown error")
  }
}

// gets the user name that goes with the tokenid
export async function getUsername({
  server, tokenid
}) {
  const userJson = await getUserJson({ server, tokenid })
  console.log(userJson)
  return userJson.login
}

// example: POST https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls
export async function getPrJsonByUserBranch({
  server, owner, repo, userBranch, tokenid
}) {
  // We get a PR by UserBranch by first creating an open PR for the user branch into master.
  // Since only one open PR can exist, the request will return a 409 if it does with information 
  // we can use to get the existing PR, otherwise use the newly created PR.
  const username = await getUsername({ server, tokenid })
  const defaultBranch = await getRepoDefaultBranch({ server, owner, repo })
  const uri = "https://" + server + '/' + Path.join(apiPath, 'repos', owner, repo, 'pulls')
  let payload = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenid}` },
    body: `{  
        "base": "${defaultBranch}",
        "head": "${userBranch}",
        "title": "Merge ${userBranch} into ${defaultBranch} by ${username}"
      }`,
  }
  let res = await fetch(uri, payload)
  let pr_json = {}
  let pr_num = "";
  switch (res.status) {
    case 409:
      // then the body.message will contain the pr number in the issue_id field
      pr_json = await res.json()
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
      pr_num = msg.split("issue_id: ")[1].split(",")[0]
      console.log("pr_num:", pr_num)
      return await getPrJson({ server, owner, repo, prId: pr_num })
    case 404:
      throw Error(`branch ${userBranch} does not exist`)
    case 201:
      return await res.json()
    default:
      throw Error("unknown error")
  }
}

// example: GET https://qa.door43.org/api/v1/repos/unfoldingword/en_ult
export async function getRepoJson({
  server, owner, repo,
}) {
  const uri = "https://" + server + '/' + Path.join(apiPath, 'repos', owner, repo)
  let res = {}
  try {
    res = await fetch(uri);
  } catch (e) {
    return Error(`error fetching ${uri}`)
  }
  switch (res.status) {
    case 404:
      throw Error(`repository ${owner}/${repo} doesn't exist`)
    case 200:
      return await res.json();
    default:
      throw Error('unknown error')
  }
}

export async function getRepoDefaultBranch({
  server, owner, repo,
}) {
  const repoJson = await getRepoJson({ server, owner, repo })
  return repoJson.default_branch
}

// example: POST https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls/3358/update
export async function updatePullRequest({
  server, owner, repo, prNum, tokenid
}) {
  const uri = "https://" + server + '/' +
    Path.join(apiPath, 'repos', owner, repo, 'pulls', `${prNum}`, 'update')

  let res_json = {};
  return await fetch(uri + `?token=${tokenid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

// example: POST https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls/3358/merge
export async function mergePullRequest({
  server, owner, repo, prNum, tokenid
}) {
  const uri = "https://" + server + '/' +
    Path.join(apiPath, 'repos', owner, repo, 'pulls', `${prNum}`, 'merge')

  return await fetch(uri + `?token=${tokenid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: `{
        "Do": "squash",
        "delete_branch_after_merge": true,
        "force_merge": true
      }`,
  })
}
