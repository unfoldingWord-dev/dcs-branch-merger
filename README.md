# dcs-branch-merger
A package for merging branches with the DCS API.


Demo: https://unfoldingword.github.io/dcs-branch-merger/

To run locally:

1. clone it
2. install dependencies: `npm install`
3. run: `npm run start`
4. point browser to `localhost:6060`


You must supply values server, owner, repo, userName, userBranch, and tokenid.
Some sample values are hardcoded, but not the token.

To get an access token:

1. go to https://qa.door43.org/api/swagger#/user/userCreateToken
2. click the lock icon and enter username and password to QA DCS
3. then fill out the form and execute (I put cecil.new in both places)
4. curl and results are below.
5. the access token is the value for the sha1 attribute.

Curl:
<pre>
curl -X 'POST' \
  'https://qa.door43.org/api/v1/users/cecil.new/tokens' \
  -H 'accept: application/json' \
  -H 'authorization: Basic whatever=' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "cecil.new"
}'
</pre>

Response:
<pre>
{
  "id": 39181,
  "name": "cecil.new",
  "sha1": "long sha value here",
  "token_last_eight": "b4bab076"
}
</pre>

# To reset test repository

To reset, just delete it (make sure you're doing this on qa!), then go to + => New Migration => Gitea and just put https://git.door43.org/dcs-poc-org/en_tn as the URL, and change Owner to dcs-poc-org (you must be a member) and the repo name should be populated already (en_tn)