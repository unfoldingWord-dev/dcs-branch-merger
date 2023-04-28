import { getPrJsonByUserBranch, checkFilenameUpdateable } from './common'

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
