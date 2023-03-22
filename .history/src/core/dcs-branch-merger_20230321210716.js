

/* Lossless Conversions are:
   \n for newline,
   \t for tab,
   \r for carriage return,
   \\ for backslash.
*/

function decode(incomingString) {
  let newValue = incomingString;
  newValue = newValue.replaceAll("\\n", '\n');
  newValue = newValue.replaceAll("\\t", '\t');
  newValue = newValue.replaceAll("\\r", '\r');
  newValue = newValue.replaceAll("\\\\", '\\');
  return newValue;
}

function encode(incomingString) {
  let newValue = incomingString;
  // process any backslash encoding first
  // otherwise it will find backslashes of the other encodings.
  newValue = newValue.replaceAll('\\',`\\\\`);
  newValue = newValue.replaceAll('\n',`\\n`);
  newValue = newValue.replaceAll('\t',`\\t`);
  newValue = newValue.replaceAll('\r',`\\r`);
  return newValue;
}


/*
Returns: 
`{data: dvalue, errors: evalue}`
where dvalue is a string and errors is an array of integer triplets, where:
	- the first integer is the row number
	- the second integer is the actual number of columns 
    when it does not match the number in the header, 
    which is the expected number; 
    if the number of columns do match the value will be zero.
	- the third integer is the column number (zero based) 
    in the row where the value is not a string;
    if this is not the error on the row, then the value will be -1;
*/
export function tableToTsvString(incomingTable) {
  let data = "";
  let errors = [];
  // copy array in case incoming is deep frozen or a const
  // deep copy: var newArray = currentArray.map(arr => arr.slice());
  let _incomingTable = incomingTable.map(row => row.slice());
  const expectedNumberOfColumns = _incomingTable[0].length;
  for (let i=0; i<_incomingTable.length; i++) {
    if ( _incomingTable[i].length !== expectedNumberOfColumns ) {
      const rownum = i;
      const numcols = _incomingTable[i].length;
      const colnum = -1;
      errors.push([rownum,numcols,colnum]);
    }
    for (let j=0; j<_incomingTable[i].length; j++) {
      if ( typeof(_incomingTable[i][j]) === 'string') {
        _incomingTable[i][j] = encode(_incomingTable[i][j]);
      } else {
        const rownum = i;
        const numcols = 0;
        const colnum = j;
        errors.push([rownum,numcols,colnum]);
        // leave data as-is, do not encode
      }
    }
    data += _incomingTable[i].join('\t') + '\n';
  }

  const tsvObject = {data: data, errors: errors};
  return tsvObject;
}

/*
Returns: 
`{header: hvalue, data: dvalue, errors: evalue}`
where:
- header: is the header row
- data: is the data rows
- errors is a list of errors, which are pairs of integers:
  - the first integer is the row number
  - the second integer is the actual number of columns found
*/
export function tsvStringToTable(content) {
  // remove leading whithespace
  // remove trailing newlines if present
  // remove any CR characters
  // then split on new line
  const rows = content.trimStart().replace(/\n+$/, '').replaceAll('\r','').split('\n');
  let expectedNumberOfColumns = -1;
  let errors = [];
  let header = [];
  let table = [];
  for (let i=0; i<rows.length; i++) {
    let columns = rows[i].split('\t');
    if ( i === 0 ) {
      // record the number of columns
      expectedNumberOfColumns = columns.length;
      header = columns;
      continue;
      // the header receives no further processing
    }

    // validate number of columns
    if ( columns.length !== expectedNumberOfColumns ) {
      // first integer is row number; second is number of columns found
      let error = [];
      error.push(i);
      error.push(columns.length);
      errors.push(error);
    }

    // process lossless conversions
    for (let j=0; j<columns.length; j++) {
      columns[j] = decode(columns[j]);
    }

    // add to output table
    table.push(columns);
  }
  const tableObject = {header: header, data: table, errors: errors};
  return tableObject;
}
