import { getPrJsonByUserBranch } from './common'

export async function checkMergeUserIntoDefaultBranch({
  server, owner, repo, userBranch, tokenid,
}) {
  let returnObject = {
    mergeNeeded: false,
    conflict: false, 
    error: false,
    message: "",
  };
  let prJson = {}
  try {
    prJson = await getPrJsonByUserBranch( {server, owner, repo, userBranch, tokenid} )
  } catch (e) {
    returnObject.error = true
    returnObject.message = e.message
    return returnObject
  }
  console.log("prJson:", prJson)
  const mergeable = prJson.mergeable
  const headSha = prJson.head.sha
  const baseSha = prJson.base.sha
  const mergeBase = prJson.mergeBase
  returnObject.conflict = ! mergeable
  returnObject.mergeNeeded = mergeable && (headSha !== baseSha && baseSha !== mergeBase)
  return returnObject
}
