/**
@typedef {number} Natural
A positive integer greater than or equal to zero

@typedef {Natural} RunCount

@callback Predicate
@param {any} the unwrapped value returned by a Computation.
@returns {boolean}

@callback Computation
@param {RunCount} the number of times the computation has been _previously_ called
@returns {Promise<any>} literally anything 
*/

/**
@function
@description Calls the given computation repeatedly as long as the
predicate is true or the max number or retries has been reached.
@param {object} arg
@param {RunCount} arg.maxRecheckCount
@param {Predicate} arg.predicate
@param {Computation} arg.computation
@returns {Promise<any>} the result of calling computation
*/
export const runRecheckWhen = async ({maxRecheckCount, predicate, computation}) => {
  let runCount = 0;
  do {
    result = await computation(runCount)
    runCount++;
  } while (runCount <= maxRecheckCount && predicate(result))

  return result
}

/**
@todo maybe we should introduce jest for the lib here?
*/
const test = () => {  
  const saveCount = (n) => Promise.resolve(n)

  //running with a predicate that is always true should produce a count o
  Promise.all
  ([ runRecheckWhen({maxRecheckCount: 2, predicate : () => false, computation : saveCount})
    .then(runCount => console.assert(runCount == 0, `recheck min failed: ${runCount} should be 1`))

  , runRecheckWhen({maxRecheckCount : 2, predicate : () => true, computation : saveCount })
    .then(runCount => console.assert(runCount == 2, `recheck max failed: ${runCount} should be 2`))

  , runRecheckWhen({maxRecheckCount : 3, predicate : (n) => n === 0, computation : saveCount })
    .then(runCount => console.assert(runCount == 1, `recheck failed: ${runCount} should be 1`))
  ])
}  
