const { DateTime } = require('luxon');
const { readFile, writeFile } = require('fs/promises');

const FILENAME = 'messages';
const DATE_FORMAT = "T' 'dd/MM/yy";
const NO_MESSAGES = [];
const HOUR_NOTIFY = {
  MIN: 6,
  MAX: 22,
};
const SERVICES_TO_MUTE = ['datasync'];

function isSilentHour() {
  const hour = DateTime.now().get('hour');
  return hour <= HOUR_NOTIFY.MIN && hour >= HOUR_NOTIFY.MAX;
}

function getFilePath(name) {
  const fileName = name || FILENAME;
  return `${__dirname}/${fileName}.json`;
}

function isEmpty(arr) {
  return arr.length === 0;
}

async function getLateMessages(message) {
  const { messages } = require(getFilePath());
  if (!isEmpty(messages)) {
    const messagesBundle = ['💤 Mensagens durante a noite!'];
    messages.forEach((message) => {
      messagesBundle.push(`- ${message}`);
    });
    await saveMessages(NO_MESSAGES);
    messagesBundle.push(`🌄 Essas foram as mensagens durante a noite`);
    messagesBundle.push(message);
    return messagesBundle.join('\n');
  }
  return message;
}

async function saveMessages(messages, path = getFilePath()) {
  await writeFile(path, JSON.stringify({ messages }));
}

function setLateMessage(message) {
  return `${message} às ${DateTime.now().toFormat(DATE_FORMAT)}`;
}

async function saveMessage(message, path) {
  const local = path || getFilePath();
  const { messages } = require(local);
  messages.push(setLateMessage(message));
  await saveMessages(messages, path);
}

async function getMessage(origin, message) {
  if (SERVICES_TO_MUTE.includes(origin)) {
    await saveMessage(message, getFilePath('log'));
    if (!isSilentHour()) {
      return await saveMessage(message);
    }
    return await getLateMessages(message);
  }
  return message;
}

module.exports = { getMessage, saveMessages, saveMessage };
