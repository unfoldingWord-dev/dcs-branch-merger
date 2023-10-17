import { getPrJsonByUserBranch, checkFilenameUpdateable } from './common'

/**
@typedef {string} GitURL 
An HTTPS URL to a git server
*/

/**
@typedef {string} PRUrl
This is the value of the `url` key from the response of creating a new PR
@see {@link https://qa.door43.org/api/swagger#/repository/repoCreatePullRequest} 
*/


/**
@typedef {object} FileResource
@property {GitURL} server the git server to make requests to
@property {string} owner the owner of the repository
@property {string} repo the repository name
@property {string} userBranch the branch to create the PR with
@property {string} prDescription the title/description for the pull request
@property {string} tokenid the authentication token for the gitea API
@property {string} filename The branch for the PR may contain multiple files - each of which may contain merge conflicts. The 
*/

/**
@typedef {object} PRMergeStatus
@property {boolean} mergeNeeded
@property {boolean} conflict
@property {boolean} error
@property {string} message
@property {PRUrl} pullRequest
*/

/**
@function
@description Checks to see if a branch is mergable into its base. 
__NOTE__: Currently to perform this check we are internally creating
a PR between the `userBranch` and its base if one doesn't already
exist.
@param {FileResource} FileResource
@return PRMergeStatus
@see {@link getPrJsonByUserBranch}
*/ 
export async function checkMergeDefaultIntoUserBranch({
  server, owner, repo, userBranch, prDescription, tokenid, filename,
}) {
  console.log(server, owner, repo, userBranch, tokenid)
  let returnObject = {
    mergeNeeded: false,
    conflict: false, 
    error: false,
    message: "",
    pullRequest: "",
  };
  let prJson = {}
  try {
    prJson = await getPrJsonByUserBranch( {server, owner, repo, userBranch, prBody: prDescription, tokenid} )
  } catch (e) {
    returnObject.error = true
    returnObject.message = e.message
    return returnObject
  }
  console.log("prJson:", prJson)
  const mergeable = prJson.mergeable
  const headSha = prJson.head.sha
  const baseSha = prJson.base.sha
  const mergeBase = prJson.merge_base
  const pullRequest = prJson.url
  returnObject.conflict = ! mergeable
  returnObject.mergeNeeded = mergeable && (headSha !== baseSha && baseSha !== mergeBase)
  returnObject.pullRequest = pullRequest
  if ( mergeable && filename ) {
    // narrow the context for mergeability to this single file, ignoring any others
    // Do note: the boolean for mergeable is in terms of the entire branch.
    // Therefore while the conflict may exist in a different file, out of an abundance
    // of caution we will not test for the provided file when conflicts exist anywhere
    returnObject.mergeNeeded = await checkFilenameUpdateable({server, owner, repo, prJson, filename})
  }
  console.log(mergeable, headSha, baseSha, mergeBase, returnObject.mergeNeeded)
  return returnObject
}
