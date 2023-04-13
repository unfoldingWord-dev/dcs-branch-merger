import { getPrJsonByUserBranch, mergePullRequest } from './common'

export async function mergeUserIntoDefaultBranch({
  server, owner, repo, userBranch, tokenid
}) {
  console.log(server, owner, repo, userBranch, tokenid)
  let returnObject = {
    mergeNeeded: false,
    conflict: false,
    success: false,
    userBranchDeleted: false,
    error: false,
    message: "",
  };
  let prJson = {}
  try {
    prJson = await getPrJsonByUserBranch({ server, owner, repo, userBranch, tokenid })
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
  returnObject.conflict = !mergeable
  console.log(mergeable, headSha, baseSha, mergeBase)
  returnObject.mergeNeeded = mergeable && (headSha !== baseSha && headSha !== mergeBase)
  if (!mergeable) {
    return returnObject
  } else if (!returnObject.mergeNeeded) {
    returnObject.message = "no merge needed"
    returnObject.success = true
    return returnObject
  }

  try {
    // Since the PR is for user branch into default branch, we simply update the PR
    const res = await mergePullRequest({ server, owner, repo, userBranch, prNum: prJson.number, tokenid })
    switch (res.status) {
      case 200:
        returnObject.mergeNeeded = false
        returnObject.success = true
        returnObject.userBranchDeleted = true
        break
      default:
        returnObject.error = true;
        const res_json = await res.json()
        returnObject.message = res_json.message;
    }
  } catch (e) {
    returnObject.error = true
    returnObject.message = e.message
  }
  return returnObject;
}

