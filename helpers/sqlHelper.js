"use strict";

const { BadRequestError } = require("../config/expressError");

/** Helper function for update queries
 * Builds SET clauses of SQL statements.
 * 
 * @param {Object} dataToUpdate {field1: newVal, field2: newVal,...}
 * @param {Object} jsToSql {firstName: "first_name", ...} - maps js data syntax to db columns
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


/** Helper function for insert queries
 * Builds TAG INSERT-VALUES clause from array
 * 
 * @param {Integer} itinId 
 * @param {Array} tagsId [id, id, id]
 * @returns {Object} {values: [itinId, tagId, tagId], placeholders }
 *      where placeholders is the value placeholder string "($1, $2), (1, $3)..."
 */
function buildTagsValuesClause(itinId, tagIds){
    if(tagIds.length === 0) throw new BadRequestError(`Must add atleast 1 tag`);
    const values = [itinId];
    // push tag ids to values array
    const placeholders = tagIds.map((id, i) => {
        values.push(id);
        return `($1, $${i+2})`;
    }).join(", ");
    
    return { values, placeholders }
}


/** Helper function for insert queries
 * Builds PLACE INSERT-VALUES clause from array
 * 
 * @param {Integer} itinId 
 * @param {Array} places [{place}, {place}, {place}]
 * @returns {Object} {values: [itinId, tagId, tagId], placeholders }
 *      where placeholders is the value placeholder string "($1, $2), (1, $3)..."
 */
function buildPlacesValuesClause(itinId, places){
    if(places.length === 0) throw new BadRequestError(`Must add atleast 1 place`);
    const values = [itinId];
    // push places data to values array
    const placeholders = places.map((p, i) => {
        const baseI = i*7+2;
        values.push(p.name, p.address, p.lat, p.lng, p.seq, p.description, p.image);
        return `($1, $${baseI}, $${baseI+1}, $${baseI+2}, $${baseI+3}, $${baseI+4}, $${baseI+5}, $${baseI+6})`;
    }).join(", ");

    return {values, placeholders}
};

module.exports = { sqlForPartialUpdate, 
                buildTagsValuesClause,
                buildPlacesValuesClause}