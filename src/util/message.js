const { DateTime } = require('luxon');
const { readFile, writeFile } = require('fs/promises');

const FILENAME = 'messages.json';
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

function getFilePath() {
  return `${__dirname}/${FILENAME}`;
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

async function saveMessages(messages) {
  return await writeFile(getFilePath(), JSON.stringify({ messages }));
}

function setLateMessage(message) {
  return `${message} às ${DateTime.now().toFormat(DATE_FORMAT)}`;
}

async function saveMessage(message) {
  const { messages } = require('./messages.json');
  messages.push(setLateMessage(message));
  await saveMessages(messages);
}

async function getMessage(origin, message) {
  if (SERVICES_TO_MUTE.includes(origin)) {
    if (isSilentHour()) return await saveMessage(message);
    return await getLateMessages(message);
  }
  return message;
}

module.exports = { getMessage };
