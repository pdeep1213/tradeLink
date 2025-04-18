  const db = require('./db');  // Import the database connection

  // Function to send a message
  exports.sendMessage = async (sender_id, receiver_id, content) => {
    try {
      
      const con = await db.getConnection().catch(err => {
        console.error("DB Connection Error:", err);
        return null;
      });
      const rows = await con.query(
        'INSERT INTO Messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())',
        [sender_id, receiver_id, content]
      );
      con.release();
      const message = { sender_id, receiver_id, content, timestamp: new Date() };
      return message;
    } catch (error) {
      throw new Error('Error sending message: ' + error.message);
    }
  };

  // Function to get messages between two users
  exports.getMessages = async (user1, user2) => {
    try {
      const con = await db.getConnection().catch(err => {
        console.error("DB Connection Error:", err);
        return null;
      });


      const rows = await con.query(
        'SELECT * FROM Messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC',
        [user1, user2, user2, user1]
      );
      await con.release();
      return rows;  // Return all the messages
    } catch (error) {
      console.log(error);
      throw new Error('Error fetching messages: ' + error.message);
    }
  };

  // Function to emit real-time message (WebSocket logic)
  exports.emitMessage = (io, receiver_id, message) => {
        io.emit(`message:${receiver_id}`, message);
      // Emit message to receiver
  };

  //Function to get all user conversations
  exports.getChats = async (sender_id) => {
    try {
      const con = await db.getConnection();

      const rows = await con.query(
        `SELECT DISTINCT 
          u.uid, 
          u.username,
          EXISTS (
              SELECT 1 
              FROM Messages m2 
              WHERE m2.receiver_id = ?
                AND m2.sender_id = u.uid
                AND m2.is_read = 0
          ) AS has_unread_messages
      FROM ulogin u
      JOIN Messages m ON u.uid = m.sender_id OR u.uid = m.receiver_id
      WHERE (m.sender_id = ? OR m.receiver_id = ?)
        AND u.uid != ? `,
        [sender_id,sender_id,sender_id, sender_id]
      );

      con.release();
      return rows;
    } catch(error) {
      throw new Error ('Error fetching chats: ' + error.message);
    }
  }

  //Function to update that a message was read
  exports.updateStatus = async (receiver_id, sender_id) => {
    console.log("In update")
    try {
      const con = await db.getConnection();
      const query = `
        UPDATE Messages
        SET status = 'read', is_read = TRUE
        WHERE receiver_id = ? AND sender_id = ? AND status != 'read'
      `;
      const responde = await con.query(query, [receiver_id, sender_id]);
      await con.release();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };
  
