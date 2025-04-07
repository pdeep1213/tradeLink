const db = require('./db');


//TODO
const filteritem = async (req, res) => {
    let con = await db.getConnection();
    const data = req.body;

    // Filter by category if provided
    const categoryQuery = data.category !== -1 ? `AND category = ${data.category} ` : "";

    // Filter by price range
    const priceQuery = data.price.flag === 0 
        ? `AND price <= ${data.price.low} ` 
        : data.price.flag === 1 
        ? `AND price >= ${data.price.low} ` 
        : data.price.flag === 2 
        ? `AND price <= ${data.price.high} AND price >= ${data.price.low} ` 
        : "";

    // Filter by item name
    const itemnameQuery = data.itemname !== "" ? `AND itemname LIKE "%${data.itemname}%" ` : "";

    // Filter by county_code if provided
    const countyCodeQuery = data.county_code ? `AND county_code = ${data.county_code} ` : "";

    // Filter by township if provided
    const townshipQuery = data.township ? `AND township LIKE "%${data.township}%" ` : "";

    // Default query, only considering items in stock
    const defaultQuery = 'SELECT * FROM items WHERE instock = 1 ';
    
    // Combine all conditions into the final query
    const query = defaultQuery + categoryQuery + priceQuery + itemnameQuery + countyCodeQuery + townshipQuery;

    try {
        // Execute the query
        const [rows] = await con.execute(query);

        // Return filtered items as response
        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while filtering items.'
        });
    } finally {
        con.release();  // Always release the connection
    }
};


const filterLocation = async (req, res) => {
    try {
        const { county_code, township } = req.query;  // Get county_code and township from the query params

        // Start with the base query
        let query = 'SELECT * FROM items WHERE 1=1';  // Assume "items" is the table name
        let params = [];  // Array to hold query parameters

        // If county_code is provided, add it to the query
        if (county_code) {
            query += ' AND county_code = ?';
            params.push(county_code);  // Add county_code to the params array
        }

        // If township is provided, add it to the query
        if (township) {
            query += ' AND township = ?';
            params.push(township);  // Add township to the params array
        }

        // Execute the query with the parameters
        const [rows] = await db.execute(query, params);  // Assuming `db.execute` is your query execution method

        // Return the filtered items
        res.json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while filtering locations.'
        });
    }
};
module.exports = {
    filteritem,
    filterLocation
};
