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
