/**
@module
@description This module defines an API for performing API requests that depend on
gitea request info such as the server, apiPath, owner, repo, etc.

@see {@link PRPromise}
*/
import { apiPath } from "./constants"

/**
@typedef {<R,A>(r : R) => Promise<A>} PRPromise<R,A>


The PRPromise API encapsulates expressions that can make API requests
to gitea and provides ways to combine theses expressions.

All gitea requests require some kind of readonly config (server,
repo, owner, etc) that is "prop drilled". This API does the
"prop-drilling" for us so users don't have to pass variables around
- including within async code.

This API accomplishes this by conceptually defining the PRPromise type:

//R is the type of the readonly config (R for "readonly") 
//A is the type of data produced by PRPromise computations
type PRPromise<R,A> = (r : R) => Promise<A>

for example, a value of type 

```
PRPromise<{server : string, repo : string}, IssueNumber>
``` 
is an expression that has `{server : string, repo : string}` as
readonly config and produces, asynchronously, an `IssueNumber`.

NOTE: Other forms of PRPromise<R,A> include:

```
<R,A> function(r : R) : Promise<A>
<R,A> async function(r : R) : A 
```

*/

/**
@function
@description Map over the result of a PRPromise
@param {<A>(a : A) => B} fn
@param {pr : PRPromise<R,A>)} pr
@returns {PRPromise<B>}
*/
export const map = (fn, pr) => r => pr(r).then(a => fn(a))

/**
@function
@description Create a PRPromsise from a value
@param {A} a
@returns {PRPromise<R,A>}
*/
export const pure = (a) => (_) => Promise.resolve(a)

/**
@function
@description Like Promise.then but for PRPromise. Note this function
allows for multiple then functions to be used that are then chained
together. For example:

```
then(x, f, g) <==> then(x, y => then(f(y), g)) <==> then(x, chain(f,g))
```
@param {(pr : PRPromise<R,A0>} pr 
@param {<An,An1>(a : An) => PRPromise<R,An1>} fns 
@returns {PRPromise<R,An1>}
*/
export const then = (pr, ...fns) => r => 
  fns.reduce((accPr, f) => accPr.then(b => f(b)(r)), pr(r))

/**
@function
@description Create a PRPromise that fails for no reason (internally
calls `Promise.reject()`)
@returns {PRPromise<R,A>}
*/
export const empty = () => Promise.reject()

/**
@function
@description Combine 2 PRPromises with or-like logic. That if the first one fails use the second one.
@param {PRPromise<R,A>} pr1
@param {PRPromise<R,A>} pr2
*/
export const or = (pr1, pr2) => (r) =>
  pr1(r).catch(() => pr2(r))

/**
@function
@description Chain two functions that return PRPromises together. This is primarily for convenience.
You can accomplish the same thing using `a => then(f(a), g)`
@param {<R,A,B>(a : A) => PRPromise<R,B>} f
@param {<R,B,C>(b : B) => PRPromise<R,C>} g
*/
export const chain = (f,g) => (a) => then(f(a), g)

/**
@function
@description Iterates over the given
@param {<R,A,B>(a : A) => PRPromise<R,B | null>} f
@param {Array<A>} xs
@returns {PRPromise<R,B>} the first PRPromise that produces a non-null value
*/
export const forEveryFirst = (f, xs) => { 
  const rejectOnNull = (a) => a === null ? empty : pure(a)

  return xs.reduce
  ( (p, x) => or(p, then(f(x), rejectOnNull))
  , empty
  )
}

/**
@function
@description When the given predicate on the readonly config returns true produce the
given value
@param {<R>(r : R) => boolean} f
@param {A} a
@returns {PRPromise<R,A>}
*/
export const when = (f, a) => (r) => 
  f(r) ? pure(a)(r) : empty(r)

/**
@function
@description
@param {Object} c object to extend the PRPromise config with
@parm {PRPromise<Object,A>}
@result {PRPromise<Object,A>}
*/
export const extendConfig = (c, p) => (r) => p({...r, ...c})

/**
@typedef {string} URLPath
The path for an HTTP url
*/

/**
@function
@description GET JSON from the repository for a file at a
@param {URLPath}
@returns {PRPromise<RepoInfo, JSON>}
*/
export const repoGetJSON = (path) => ({server, owner, repo}) => 
  fetch(`${server}/${apiPath}/repos/${owner}/${repo}/${path}`)
  .then(r => r.json())

