const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const { catchMsg } = require('../../util');
const { getChatIdByName, getChats } = require('./find');
const GROUP_TO_SEND = process.env.GROUP_TO_SEND;
const GROUP_TO_SEND_ERROR = process.env.GROUP_TO_SEND_ERROR;

function parseNumber(number) {
  if (!number) {
    return null;
  }
  return `${number}`.replace('+', '') + '@c.us';
}

/**
 * @typedef {{
 * _events: object
 * _eventsCount: number
 * _maxListeners?: number
 * options: OptionsClient
 * authStrategy: object
 * }} WhatsAppClient
 */
/**
 * @typedef {{
 * authStrategy: object
 * puppeteer: object
 * authTimeoutMs: number
 * qrMaxRetries: number
 * takeoverOnConflict: boolean
 * takeoverTimeoutMs: number
 * userAgent: string
 * ffmpegPath: string
 * bypassCSP: boolean
 * }} OptionsClient
 */

/**
 * Constrói um cliente WhatsApp e monitora os eventos para sua configuração
 * @param {string} clientId
 * @returns {Promise<WhatsAppClient>}
 */
async function buildClient(clientId) {
  let chatId = '';
  let chatIdToSendError = '';
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId,
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  })
    .on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    })
    .on('auth_failure', console.log)
    .on('error', (err) => console.log({ err }))
    .on('message', catchMsg)
    .on('ready', async () => {
      const chats = await getChats(client)
      const content = `🤖 Bot WhatsApp Online! ✅\nCliente:*${clientId}*`
      console.log({ content })

      if (GROUP_TO_SEND){
        chatId = getChatIdByName(chats, GROUP_TO_SEND);
        client.sendMessage(chatId, content);
      }
      if (GROUP_TO_SEND_ERROR){
        chatIdToSendError = getChatIdByName(chats,
        GROUP_TO_SEND_ERROR
        );
      }
    });

  await client.initialize();
  return {
    sendMessage: async (phone, message, origin) => {
      try {
        const receiver = parseNumber(phone) || chatId;
        const messageToSend = message;

        if (messageToSend) {
          const errorMarkers = ['❌', '⚠️'];
          if (errorMarkers.includes(messageToSend[0])) {
            await client.sendMessage(
              chatIdToSendError,
              messageToSend
            );
          }
          const { ack } = await client.sendMessage(receiver, messageToSend);

          return {
            statusText: ack,
          };
        }
      } catch ({ message }) {
        console.log({ errorMessage: message });
        return {
          statusText: -1,
          error: message,
        };
      }
    },
  };
}

module.exports = { buildClient };
