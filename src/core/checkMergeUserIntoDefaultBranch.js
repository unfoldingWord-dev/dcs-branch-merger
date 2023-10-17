import { getPrJsonByUserBranch } from './common'

export async function checkMergeUserIntoDefaultBranch({
  server, owner, repo, userBranch, prDescription, tokenid,
}) {
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
  const mergeable = prJson.mergeable
  const headSha = prJson.head.sha
  const baseSha = prJson.base.sha
  const mergeBase = prJson.merge_base
  const pullRequest = prJson.url
  returnObject.conflict = ! mergeable
  returnObject.mergeNeeded = mergeable && (headSha !== baseSha && headSha !== mergeBase)
  returnObject.pullRequest = pullRequest
  return returnObject
}
