const db = require('./db');


//TODO
const filteritem = async (req, res) => {
    //possible filter option
    //price as an array [0?1?2, low, high]  if 0 find items low >=  if 1 find item >= low if 2 find low <=? >= high
    //categories enum -> match item category
    //itemname -> match name
    //should only show items where instock is 1
    let con = await db.getConnection();
    const data = req.body;
    const categoryQuery = data.category != -1 ? `and category = ${data.category} `: "";
    const priceQuery = data.price.flag == 0 ? `and price <= ${data.price.low} ` : 
                       data.price.flag == 1 ? `and price >= ${data.price.low} ` :
                       data.price.flag == 2 ? `and price <= ${data.price.high} && price >= ${data.price.low} ` :
                       "";
    const itemnameQuery = data.itemname !== "" ? `and itemname like "%${data.itemname}%" ` : "";
    const defaultQuery = 'select from items where instock = 1 ';
    const query = defaultQuery + categoryQuery + priceQuery + itemnameQuery;
};


module.exports = {
    filteritem
};
