const db = require('./db');
const jwt = require('jsonwebtoken');
const jwt_token = process.env.JWTOKEN;
const sgMail = require('@sendgrid/mail');

const sendEmail = async (email, subject, text) => {
    sgMail.setApiKey(process.env.SGMAIL);
    //skip unit test email
    if (email[0].email == "user@a.com" || email[0].email == "user2@a.com" || email[0].email == "admin@a.com"){
        return;
    }
    const msg = {
        to: email,
        from: 'noreply@tradelink.com',
        subject: subject,
        text: text,
    };
    try {
        await sgMail.send(msg);
        console.log('Email sent successfully');
    }
    catch (error) {
        console.log("in send eamil");
        console.error('Error sending email:', error);
    }  
}

const generateReceipt = ({ itemName, price }) => {
    const taxRate = 0.0625;
    const taxAmount = price * taxRate;
    const total = price + taxAmount;
  
    return `
    -------------------------------
               TRADELINK
           Purchase Receipt
    -------------------------------
    Item        : ${itemName}
    Amount      : $${price}
    Tax (6.25%) : $${taxAmount}
    -------------------------------
    Total       : $${total}
  
    -------------------------------
       Thank you for your purchase!
  This Email was Sent from an Automated System - Please Do Not Reply
    `;
  };
  
const sendEmailToUsers = async (buyerEmail, sellerEmail, itemName, amount) => {
    const subjectBuyer = `Purchase Confirmation for ${itemName}`;
    const textBuyer = `Dear Buyer,\n\nThank you for your purchase of ${itemName}.\n\nHere is your receipt:\n${generateReceipt({ itemName, price: amount })}\n\nBest regards,\nTradeLink Team`;
    const subjectSeller = `Sale Notification for ${itemName}`;
    const textSeller = `Dear Seller,\n\nYour item ${itemName} has been sold.\n\nBest regards,\nTradeLink Team`;
    try {
        await sendEmail(buyerEmail, subjectBuyer, textBuyer);
        await sendEmail(sellerEmail, subjectSeller, textSeller);
    }
    catch (error) {
        console.error('Error sending email to users:', error);
    }
}

const transaction = async (req , res) => {
    let con;
    try {
        const { item_id, uid } = req.body;
        if (!uid || !item_id) {
            return res.status(400).send("Missing uid or item_id");
        }
        
        con = await db.getConnection();
        // Fetch price and sellerID from items table
        const [item] = await con.query(
            "SELECT price, uid FROM items WHERE item_id = ?",
            [item_id]
        );
        
        if (!item) {
            return res.status(404).send("Item not found");
        }

        const amount = item.price;
        const sellerID = item.uid;

        if (sellerID === uid) {
            return res.status(400).send("Seller cannot buy their own item");
        }
        // Insert transaction into Transactions table
        await con.query(
            "INSERT INTO Transactions (sellerID, buyerID, itemID, Amount) VALUES (?, ?, ?, ?)",
            [sellerID, uid, item_id, amount]
        );
        
        //Unlist the item once its added to Transactions
        //const query = "UPDATE items SET instock = ?  WHERE item_id = ?";
        //const result = await con.query(query, [0,item_id]);

       
        //Send email to seller and buyer
        const buyer = await con.query("SELECT email FROM ulogin WHERE uid = ?", [uid]);
        const seller = await con.query("SELECT email FROM ulogin WHERE uid = ?", [sellerID]);
        console.log("sending email");
        sendEmailToUsers(buyer, seller, item_id, amount);
                  

        /*if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }*/

        res.status(201).send("Transaction recorded successfully");

    } catch (error) {
        console.error("Transaction error:", error);
        res.status(500).send("Internal server error");
    }
    finally{
        con.release();
    }

};


const earnings = async (req,res) => {
    const { uid } = req.params;
    let con;

    try {
        con = await db.getConnection();
        const user_Transactions = await con.query('SELECT * from Transactions WHERE sellerID=?',[uid]);

        //Get total amount
        const totalResult = await con.query('SELECT SUM(amount) AS total FROM Transactions WHERE sellerID = ?', [uid]);
        const total = totalResult[0].total || 0;
        
        //Get total purschases
        const purchasesResult = await con.query('SELECT COUNT(*) AS purchases FROM Transactions WHERE sellerID = ?', [uid]);
        const purchases = purchasesResult[0].purchases;
        res.status(200).json({
            total,
            purchases,
            transactions: user_Transactions
        });

    } catch (err) {
        console.error("Error in earnings:", err);
        res.status(500).json({ error: "Failed to fetch earnings data." });
        } finally {
            if (con) con.release();
        }
}

// save a user cardInfo
const saveCardInfo = async (req, res) => {
    const token = req.cookies.tradelink;
    if(!token){
        console.log("no token");
        return res.status(401).json({message: "no token"})
    }
    let con;
    try{
        const decoded = jwt.verify(token, jwt_token);
        const uid = decoded.uid; //uid for the table
        const data = req.body;
        //Map query column and value to prevent sql injection attck
        const columns = Object.keys(data).join(', ');
        const value = [uid, ...Object.values(data)];
        const question = value.map(() => '?').join(', ');            
        //Check to see if card is already in DB
        let query = `select * from cardInfo where uid=? and cardnum=? and cardExp=? and cardCVC=? and cardName=?`;
        con = await db.getConnection();
        var result = await con.query(query, value);
        if (result.length === 0){
            query = `insert into cardInfo (uid, ${columns}) values (${question})`;
            //insert info into table
            var result = await con.query(query, value);
            return res.status(200).json({ message: 'Card Saved'});
        }
        return res.status(200).json({message: "Card already in DB, skipping save"});
     } catch (err) {
         console.log("issue saving card info: ", err);
         res.send(500).json({message: "saving card info failed"});
     } finally {
         con.release();
     }
};

module.exports = {
 transaction,
 earnings,
 saveCardInfo
}
