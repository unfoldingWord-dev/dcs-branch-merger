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
export const checkMergeDefaultIntoUserBranch = ({
  server, owner, repo, userBranch, prDescription, tokenid, filename,
}) =>
  getPrJsonByUserBranch({server, owner, repo, userBranch, prBody: prDescription, tokenid})
  .then(({mergeable, head, base, merge_base, url}) => checkFilenameUpdateable({server, owner, repo, prJson: {base, merge_base}, filename})
  .then(fileNameUpdatable => 
      ({
        // narrow the context for mergeability to this single file, ignoring any others
        // Do note: the boolean for mergeable is in terms of the entire branch.
        // Therefore while the conflict may exist in a different file, out of an abundance
        // of caution we will not test for the provided file when conflicts exist anywhere
        mergeNeeded: mergeable && 
          (filename && fileNameUpdatable 
          || (head.sha !== base.sha && base.sha !== merge_base)
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
  )  
