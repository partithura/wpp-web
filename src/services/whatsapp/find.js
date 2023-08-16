function getChatIdByName(chats, chatName) {
  const chat = chats.find((chat) => chat.name === chatName);
  return chat.id._serialized;
}

async function getChats(client) {
  return await client.getChats() || []
}

module.exports = { getChatIdByName, getChats };
