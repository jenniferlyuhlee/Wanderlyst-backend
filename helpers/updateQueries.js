"use strict";

const { BadRequestError } = require("../expressError");

/** Helper function for update queries
 * Builds SET clauses of SQL statements.
 * 
 * @param dataToUpdate {field1: newVal, field2: newVal,...}
 * @param jsToSql {firstName: "first_name", ...} - maps js data syntax to db columns
 * @returns {Object} {sqlSetCols, dataToUpdate}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql){
    const keys = Object.keys(dataToUpdate);
    if(keys.length===0) throw new BadRequestError("No data inputted");
    
    // get corresponding database column name based on js names in dict
    // create clause with parameterized queries
    const cols = keys.map((colName, i) =>
        `"${jsToSql[colName] || colName}"=$${i+1}`);

    return{
        setCols:cols.join(", "),
        values: Object.values(dataToUpdate)
    };
}

module.exports = {sqlForPartialUpdate}