This demonstrates how to process parsing errors.

```js
import * as tsvparser from './uw-tsv-parser.js';

function Component() {
  const text  = 
`A\tB\tC
a1\tb1\tthis is a backslash "\\"
a1\tnot enough columns
a2\tb2\tc2
a3\tb3\tc3\ttoo many columns
`

  let results;
  let tableObject;
  tableObject = tsvparser.tsvStringToTable(text);
  const numrows = tableObject.data.length;
  const header = tableObject.header.join(",");
  results = `Number of rows is ${numrows}`;
  results += `\n\n... with header ${header}`;
  results += `\n\ncell 1,2 is:\n${tableObject.data[0][2]}`;
  results += `\n\nNumber of errors: ${tableObject.errors.length}`
  if ( tableObject.errors.length > 0 ) {
    const expectedColumns = tableObject.header.length;
    for (let i=0; i<tableObject.errors.length; i++) {
      let msg;
      let rownum = tableObject.errors[i][0] - 1; // adjust for data table without header row
      let colsfound = tableObject.errors[i][1];
      if ( colsfound > expectedColumns ) { msg = "Row is too long" }
      else { msg = "Row is too short" }
      results += `\n\n${msg}:`
      results += "\n" + tableObject.data[rownum].join(",");
    }
  }
  return (
  <>
  <pre>{results}</pre>
  </>
  )
}
;
<Component />
```