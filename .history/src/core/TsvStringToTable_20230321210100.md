This is the "happy path", namely, a normal compliant file/string 
is converted to a 2D array.

```js
import * as tsvparser from './uw-tsv-parser.js';

function Component() {
  const text  = 
`A\tB\tC
a1\tb1\tc1.a\\n\\n\\t\\tc1.b
a2\tb2\tc2
`

  let results;
  let tableObject;
  try {
    tableObject = tsvparser.tsvStringToTable(text);
    const numrows = tableObject.data.length;
    const header = tableObject.header.join(",");
    results = `Number of rows is ${numrows}`;
    results += `\n\n... with header ${header}`;
    results += `\n\ncell 1,2 is:\n${tableObject.data[0][2]}`;
  } catch (err) {
    results = err;
  }
  ;
  return (
  <>
  <pre>{results}</pre>
  </>
  )
}
;

<Component />
```