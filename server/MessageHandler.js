const db = require('./db');  // Import the database connection

// Function to send a message
exports.sendMessage = async (senderId, receiverId, content) => {
  try {
    const [rows, fields] = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, content, timestamp) VALUES (?, ?, ?, NOW())',
      [senderId, receiverId, content]
    );
    const message = { senderId, receiverId, content, timestamp: new Date() };
    return message;
  } catch (error) {
    throw new Error('Error sending message: ' + error.message);
  }
};

// Function to get messages between two users
exports.getMessages = async (user1, user2) => {
  try {
    const [rows, fields] = await db.execute(
      'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC',
      [user1, user2, user2, user1]
    );
    return rows;  // Return all the messages
  } catch (error) {
    throw new Error('Error fetching messages: ' + error.message);
  }
};

// Function to emit real-time message (WebSocket logic)
exports.emitMessage = (io, receiverId, message) => {
  io.emit(`message:${receiverId}`, message);  // Emit message to receiver
};
