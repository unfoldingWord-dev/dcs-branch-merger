import Path from 'path'
import { apiPath } from './constants'
import { when, extendConfig, or, then, forEveryFirst, chain, repoGetJSON} from './PRPromise'

// example: GET https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls/3358
export const getPrJson = ({server, owner, repo, prId}) => 
  fetch(`${server}/${apiPath}/repos/${owner}/${repo}/pulls/${prId}`)
  .then(r => r.json())
  .catch(_ => null)

// example: GET https://qa.door43.org/api/v1/user
export async function getUserJson({
  server, tokenid
}) {
  const uri = server + '/' + Path.join(apiPath, 'user')
  let res = await fetch(uri, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenid}` },
  })
  switch (res.status) {
    case 401:
      throw Error("invalid token")
    case 200:
      return await res.json()
    default:
      throw Error("unknown error")
  }
}

// gets the user name that goes with the tokenid
export async function getUsername({
  server, tokenid
}) {
  const userJson = await getUserJson({ server, tokenid })
  return userJson.login
}

/**
@typedef RepoAndPRBody
@property {GitURL} server
@property {string} owner
@property {string} repo
@property {string} userBranch
@property {string} prBody
@property {string} tokenid
*/

/**
@typedef {object} PRJson
@description This is the result of calling the API to create a new PR.
@see {@link https://qa.door43.org/api/swagger#/repository/repoCreatePullRequest} for the JSON schema
*/

/**
@function
@description Ensure that the PRJson belongs to the user branch
*/
const keepJsonWhenOnUserBranch = (prJson) =>  
  when(({userBranch}) => prJson.head.ref === userBranch, prJson)

/**
@function
@description fetch the PRJson for an issue that is a PR
*/
const getPRJsonFromIssueJSON = ({number}) =>   
  extendConfig({prId: number}, getPrJson)

/**
@function 
@description get all open PRs created by the given user
*/
export const getOpenPRIssuesForUser = (username) => 
  repoGetJSON(`issues?type=pulls&created_by=${username}&state=open`)

/**
@function
@description Fetches the user's branch PR. 
_NOTE:_ We assume that the user will only have a single PR open at a given time - currently
this is the default behavior of gitea, but if this ever changes then this would be the best
place to look
@param {RepoAndPRBody} repoAndPRBody
@returns {PRJson}
@todo change implementation to use `repoAndPRBody.userBranch`. Currently there doesn't seem
an obvious way from the gitea API to GET a PR based on the branch name. Again, we assume that
the user will only have a single PR open at any time.
*/
export const getPRForUserBranch =
  then
  ( getUsername
  , getOpenPRIssuesForUser
  , issuesJson => forEveryFirst(chain(getPRJsonFromIssueJSON, keepJsonWhenOnUserBranch), issuesJson)
  )

/**
@function
@description Fetches the PRJson for the current user branch. If no PR exists create one
@param {RepoAndPRBody} repoAndPRBody
@result {PRJson}
*/
export const getPrJsonByUserBranch = 
  or(getPRForUserBranch, createPRForUserBranch)

/**
@function
@description
@param {RepoAndPRBody} repoAndPRBody
@result {PRJson}
@example POST https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls
*/
async function createPRForUserBranch({
  server, owner, repo, userBranch, prBody, tokenid
}) {
  // We get a PR by UserBranch by first creating an open PR for the user branch into master.
  // Since only one open PR can exist, the request will return a 409 if it does with information 
  // we can use to get the existing PR, otherwise use the newly created PR.
  const username = await getUsername({ server, tokenid })
  const defaultBranch = await getRepoDefaultBranch({ server, owner, repo })
  const res = await fetch
    (`${server}/${apiPath}/repos/${owner}/${repo}/pulls`
    , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenid}` },
        body: `{  
            "base": "${defaultBranch}",
            "head": "${userBranch}",
            "title": "Merge ${userBranch} into ${defaultBranch} by ${username}",
            "body": "${prBody ? prBody : ""}"
          }`,
      }
    )
  switch (res.status) {
    case 409:
      //In the rare case that: a PR doesn't already exist for the user's branch, and subsequently creating a new PR 
      //returns the already exist error code, then parse the PR number and attempt a fetch. This branch _should never
      //happen_ but we leave it here as a last resort.

      // then the body.message will contain the pr number in the issue_id field
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
      const prId = await (res.json().then(({message}) => message.split("issue_id: ")[1].split(",")[0]))
      return await getPrJson({ server, owner, repo, prId })
    case 404:
      throw Error(`branch ${userBranch} does not exist`)
    case 201:
      return await res.json()
    default:
      throw Error("unhandled status ${res.status}")
  }
}

// example: GET https://qa.door43.org/api/v1/repos/unfoldingword/en_ult
export async function getRepoJson({
  server, owner, repo,
}) {
  const uri = server + '/' + Path.join(apiPath, 'repos', owner, repo)
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
  const uri = server + '/' +
    Path.join(apiPath, 'repos', owner, repo, 'pulls', `${prNum}`, 'update')

  let res_json = {};
  return await fetch(uri + `?token=${tokenid}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
}

// example: POST https://qa.door43.org/api/v1/repos/unfoldingword/en_ult/pulls/3358/merge
export async function mergePullRequest({
  server, owner, repo, prNum, prBody, tokenid
}) {

  // if pr body is not empty, then first update the PR with it
  // example: 
  /*
    curl -X 'PATCH' \
      'https://qa.door43.org/api/v1/repos/dcs-poc-org/en_tn/pulls/2' \
      -H 'accept: application/json' \
      -H 'authorization: Basic your-psw-here' \
      -H 'Content-Type: application/json' \
      -d '{
      "body": "This is an update test!"
    }'

    Status on success is a 201
  */
  if ( prBody && prBody !== "" ) {
    console.log("Updating PR with description:", prBody)
    const uri = server + '/' + Path.join(apiPath, 'repos', owner, repo, 'pulls', `${prNum}`)
    let res = {}
    try {
      res = await fetch(uri + `?token=${tokenid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: `{
            "body": "${prBody}"
        }`,
      })
    } catch (e) {
      return Error(`error fetching to update PR: ${uri}`)
    }
    if ( res.status !== 201 ) {
      throw Error(`Unknown error on update to PR, status ${res.status}`)
    }
  }

  // now do the merge
  const uri = server + '/' +
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

/*
The URL for base contents:
https://git.door43.org/api/v1/repos/dcs-poc-org/en_tn/contents/tn_TIT.tsv?ref=2d137737c84b93c4336d1de2937f89269fba9e93
*/
export async function getContentsSha({
  server, owner, repo, filename, commitSha
}) {
  const uri = server + '/' + Path.join(apiPath, 'repos', owner, repo, 'contents', filename, '?ref='+commitSha)
  // console.log("getContentsSha() uri:", uri)
  let sha = null
  try {
    const res = await fetch(uri);
    const cJson = await res.json();
    sha = cJson.sha
  } catch (e) {
    console.log("getContentsSha() error:", e)
    sha = null
  }
  return sha
}

/**
@typedef {string} SHA
@description a git commit SHA
*/

/**
@typedef RepoAndPRJsonAndFileName
@property {HttpURL} server
@property {string} owner
@property {string} repo
@property {object} prJson the return value to 
@property {SHA} prJson.base the SHA of the branch the PR is merging into
@property {SHA} prJSON.merge_base the SHA of the merge base of the PR (this acts as the last common commit between the PR's base and target branch)
@property {string} filename the file path in the PR to check its updatable status
*/

/**
@typedef {boolean} FileIsUpdatable
@description Whether the given file is updatable. 

- `true` if the file has been updated in the base branch for a PR
- `false` if the file hasn't been updated in the base branch
*/

/**
@function
@description Checks if a file has been updated in the base branch of a PR. 
This is used to determine if a PR is mergable 
@param RepoAndPRJsonAndFileName
@return FileIsUpdatable
@see {@link checkMergeDefaultIntoUserBranch}
*/
export const checkFilenameUpdateable = ({
  server, owner, repo, prJson: {base: {sha: base}, merge_base}, filename
}) => 
  merge_base === base ? Promise.resolve(false)
    // master has been update since branch created
    // Therefore check if file has been updated in master
  : getContentsSha({server, owner, repo, filename, commitSha: merge_base})
    .then(mergeBaseFileSha => getContentsSha({server, owner, repo, filename, commitSha: base})
    .then(baseFileSha => 
      mergeBaseFileSha !== null 
        && baseFileSha !== null 
        && mergeBaseFileSha !== baseFileSha
    ))
