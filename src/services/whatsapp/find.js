function getChatIdByName(chats, chatName) {
  const chat = chats.find((chat) => chat.name === chatName);
  return chat.id._serialized;
}

module.exports = { getChatIdByName };
