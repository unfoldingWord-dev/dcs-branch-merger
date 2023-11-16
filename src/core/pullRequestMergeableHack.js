/** 
__WARNING__: 

the following is a hack and may produce more bugs. If there is a
bug with mergeable related logic this may be a good place to check.


# Explain problem origins:

The gateway-edit app is consuming information from the Gitea API
to determine whether to enable/disable buttons that allow the user
to pull/push their user branch to/from master. Part of this logic
relies on the `mergeable` field from the Pull Request JSON. The
following is an excerpt of the Go code that computed the `mergeable` 
field:

```go
mergeable = 
       pr.Status != PullRequestStatusChecking 
    && pr.Status != PullRequestStatusConflict 
    && pr.Status != PullRequestStatusError 
    //title of issue is work in progress
    && !pr.IsWorkInProgress()
```

The `mergeable` is a boolean value that we were using to determine
if a PR was ready to be merged (which, we assumed, is used to
enable/disable the button on the Gitea webpage).

We've discovered that this value is not stable and may change with
continuous polling. For example the following polling code shows
how the mergeable field "randomly" changes to "false":

```bash
while true; do
  curl -s "https://qa.door43.org/api/v1/repos/unfoldingWord/en_tq/pulls/<pr-number>"\
  | jq '.mergeable'
done

==>

true
true
false
false
true
```

This is due to nature of mergeable being more than just indicating
whether the PR has conflicts or not.

# Proposed Solution
  
## Thread PR Status and Conflict Files Throughout App

This would be a more robust solution as client apps would
be able to consolidate information into one place, howerver
would require changes to the following code repos:
  - dcs-branch-merger
  - translation-helps-rcl
  - gateway-edit

## (Selected) Write a Poll To Remove The CHECKING Status

As seen above the mergeable relies on the `PullRequestChecking` status,
which, when `true`, is what - we think - is causing the `mergeable` field
to become `false` intermitently. A "quick hack" solution is to continue
to poll the server for when a more "stable" status is returned. 

This option requires the following repo changes:

  - gitea Go-lang API: Include `status` as part of the API for the
  Pull Request GET request where `status` has the following values:
      * "CONFLICT"
      * "CHECKING"
      * "MERGEABLE"
      * "MANUALLY_MERGED"
      * "ERROR"
      * "EMPTY"
      * "ANCESTOR"

  - dcs-branch-merger: Polling code to format the file

### Potential Bugs
  
- The original problem persists: 
  - a good first step would be to increment the maxRecheckCount,
  we might not be waiting long enough.

  - if this doesn't work verify that the status API hasn't been
  updated. "CHECKING" may be the wrong value here.

  - if this still doesn't work then try adding other statuses to
  the while statement below as other statuses may be giving incorrect
  `mergeable` values.

- slow network: because we're making back-to-back API calls we may
flood the network with API calls. In this case add a time delay
in between calls.


*/
import { getPrJsonByUserBranch } from './common'
import { runRecheckWhen } from './runRecheck'

export const getPrJsonWithNonCheckingStatus = (x) =>
  runRecheckWhen
    ({ maxRecheckCount : 5
    , predicate : prHasInvalidMergeableStatus
    , computation : () => getPrJsonByUserBranch(x)
    })
  .then(({result}) => result)  

const prHasInvalidMergeableStatus = ({status}) => status === "CHECKING" 