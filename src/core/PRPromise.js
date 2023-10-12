import { apiPath } from "./constants"

// Functor
export const map = (fn, pr) => r => pr(r).then(a => fn(a))

// Applicative
export const pure = (a) => (_) => Promise.resolve(a)

// Monad
export const then = (pr, ...fns) => r => 
  fns.reduce((accPr, f) => accPr.then(b => f(b)(r)), pr(r))

// Alternative
export const empty = () => Promise.reject()

export const or = (pr1, pr2) => (r) =>
  pr1(r).catch(() => pr2(r))

//(a -> f b) -> (b -> f c) -> a -> f c
export const chain = (f,g) => (a) => then(f(a), g)

//(a -> f (b + null)) -> List a -> f b := (r, a) => Promise<b>
export const forEveryFirst = (f) => (xs) => { 
  const rejectOnNull = (a) => a === null ? empty : pure(a)

  return xs.reduce
  ( (p, x) => or(p, then(f(x), rejectOnNull))
  , empty
  )
}

export const when = (f, a) => (r) => 
  f(r) ? Promise.resolve(a) : Promise.reject() 

export const extendConfig = (c, p) => (r) => p({...r, ...c})

export const repoGetJSON = (path) => ({server, owner, repo}) => 
  fetch(`${server}/${apiPath}/repos/${owner}/${repo}/${path}`)
  .then(r => r.json())

