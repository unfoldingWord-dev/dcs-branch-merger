The first demo shows how to process errors.
The second demo shows an example of using the errors to produce 
English error messages.

Returns: 
`{data: dvalue, errors: evalue}`
where dvalue is a string and errors is an array of integer triplets:
- the first integer is the row number
- the second integer is the actual number of columns 
  when it does not match the number in the header, 
  which is the expected number; 
  if the number of columns do match the value will be zero.
- the third integer is the column number (zero based) 
  in the row where the value is not a string;
  if this is not the error on the row, then the value will be -1;


```js
import * as tsvparser from './uw-tsv-parser.js';

function Component() {
  const table = [
    ["A","B","C"],
    ["a1","b1","c1","d"],
    ["a2","b2",["one","two"],"d","e"],
    ["a2","b2",{x:1, y:2}],
  ]

  const tsvObject = tsvparser.tableToTsvString(table);
  const results = tsvObject.data.replaceAll('\t',',');
  const errors  = JSON.stringify(tsvObject.errors,null,4);
  
  return (
  <>
  <p>Table as CSV</p>
  <pre>{results}</pre>
  <p>Error Listing</p>
  <pre>{errors}</pre>
  </>
  )
}
;

<Component />
```


This shows how to use the error data to produce messages
to show a user.

```js
import * as tsvparser from './uw-tsv-parser.js';

function Component() {
  const table = [
    ["A","B","C"],
    ["a1","b1","c1","d"],
    ["a2","b2",["one","two"],"d","e"],
    ["a3","b3",false],
    ["a4","too short"],
  ]

  const tsvObject = tsvparser.tableToTsvString(table);
  const results = tsvObject.data.replaceAll('\t',',');
  const errors  = tsvObject.errors;
  let messages = "";
  for (let i=0; i<errors.length; i++) {
    const rownum = errors[i][0];
    messages += `Error #${i+1} is on row ${rownum}: `;
    numcols = errors[i][1];
    if ( numcols !== 0 ) {
      let emsg;
      if ( numcols > table[0].length ) {
        emsg = `Row is too long. Expected ${table[0].length}, found ${numcols}`;
      } else {
        emsg = `Row is too short. Expected ${table[0].length}, found ${numcols}`;
      }
      messages += emsg + '\n';
    }
    const typeErrorCol = errors[i][2];
    if ( typeErrorCol !== -1 ) {
      messages += `Value not a string in column ${typeErrorCol}; value type is ${typeof(table[rownum][typeErrorCol])}\n`
    }
  }
  
  return (
  <>
  <p>Table as CSV</p>
  <pre>{results}</pre>
  <p>Error Listing</p>
  <pre>{messages}</pre>
  </>
  )
}
;

<Component />
```