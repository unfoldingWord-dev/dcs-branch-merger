/**
@todo document the params here
*/
export const runRecheckWhen = async ({maxRecheckCount, predicate, computation}) => {
  let runCount = 0;
  do {
    result = await computation(runCount)
    runCount++;
  } while (runCount <= maxRecheckCount && predicate(result))

  return {result, runCount}
}

/**
@todo maybe we should introduce jest for the lib here?
*/
const test = () => {  
  //running with a predicate that is always true should produce a count o
  Promise.all
  ([ runRecheckWhen({maxRecheckCount: 2, predicate : () => false, computation : () => Promise.resolve()})
    .then(({runCount}) => console.assert(runCount == 1, `recheck min failed: ${runCount} should be 1`))

  , runRecheckWhen({maxRecheckCount : 2, predicate : () => true, computation : () => Promise.resolve()})
    .then(({runCount}) => console.assert(runCount == 3, `recheck max failed: ${runCount} should be 2`))

  , runRecheckWhen({maxRecheckCount : 3, predicate : (n) => n === 0, computation : (n) => Promise.resolve(n)})
    .then(({runCount}) => console.assert(runCount == 2, `recheck failed: ${runCount} should be 1`))
  ])
} 
