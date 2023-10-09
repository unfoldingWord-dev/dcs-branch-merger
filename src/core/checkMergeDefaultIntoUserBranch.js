import { getPrJsonByUserBranch, checkFilenameUpdateable } from './common'

export const checkMergeDefaultIntoUserBranch = ({
  server, owner, repo, userBranch, prDescription, tokenid, filename,
}) => {
  getPrJsonByUserBranch( {server, owner, repo, userBranch, prBody: prDescription, tokenid} )
  .then(({mergeable, head, base, merge_base, url}) => checkFilenameUpdateable({server, owner, repo, prJson, filename})
  .then(fileNameUpdatable => 
      ({
        // narrow the context for mergeability to this single file, ignoring any others
        // Do note: the boolean for mergeable is in terms of the entire branch.
        // Therefore while the conflict may exist in a different file, out of an abundance
        // of caution we will not test for the provided file when conflicts exist anywhere
        mergeNeeded: mergeable && 
          (filename && fileNameUpdatable 
          || (head.sha !== base.sha && base.sha !== merge_base),
          ),
        conflict: !mergeable, 
        error: false,
        message: "",
        pullRequest: url
      })   
    ))
  .catch(e =>
    //TODO: it would be safer to return  a sum type of the happy path object 
    //and { error : true, message : string} this prevents users of this API
    //from using invalid states. E.g mergeNeeded is false when, technically,
    //we don't know whether mergeNeeded is true or false because an error occured. 
    //undefined/null could be used, however that creates more bugs (users have to
    //liter their code with null/undefined checks).
    ({
        // narrow the context for mergeability to this single file, ignoring any others
        // Do note: the boolean for mergeable is in terms of the entire branch.
        // Therefore while the conflict may exist in a different file, out of an abundance
        // of caution we will not test for the provided file when conflicts exist anywhere
        mergeNeeded: false,
        conflict: false, 
        error: true,
        message: e.message,
        pullRequest: ""
    })   

