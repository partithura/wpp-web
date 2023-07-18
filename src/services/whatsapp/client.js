const { Client, LocalAuth } = require('whatsapp-web.js');
const { generate } = require('qrcode-terminal');

const { catchMsg } = require('../../util');
const { getMessage } = require('../../util/message');
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
      console.log({ qr });
      generate(qr, { small: true });
    })
    .on('error', (err) => console.log({ err }))
    .on('message', catchMsg)
    .on('ready', async () => {
      console.log('ready'); // TODO: adicionar o logger

      if (GROUP_TO_SEND)
        chatId = getChatIdByName(await client.getChats(), GROUP_TO_SEND);
      if (GROUP_TO_SEND_ERROR)
        chatIdToSendError = getChatIdByName(
          await getChats(client),
          GROUP_TO_SEND_ERROR
        );
    });

  await client.initialize();
  return {
    sendMessage: async (phone, message, origin) => {
      try {
        const receiver = parseNumber(phone) || chatId;
        const messageToSend = message;
        console.log({ receiver, message });

        if (messageToSend) {
          const errorMarkers = ['❌', '⚠️'];
          if (errorMarkers.includes(messageToSend[0])) {
            const some = await client.sendMessage(
              chatIdToSendError,
              messageToSend
            );
            // console.log(some);
          }
          const some = await client.sendMessage(receiver, messageToSend);
          // console.log(some);

          return {
            statusText: some.ack,
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
