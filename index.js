console.log("BOT STARTING...");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");

const apiId = 31581826; // <-- PUT YOUR API ID
const apiHash = "3e159192e5ad7e5052530bb69325994c"; // <-- PUT YOUR API HASH
const stringSession = new StringSession("");

const SOURCE_CHAT = -1002614601304; // without @
const DEST_CHAT = -1003424003343; // without @

// Map to link original message → copied message
const messageMap = new Map();

(async () => {
const client = new TelegramClient(stringSession, apiId, apiHash, {
connectionRetries: 5,
});

await client.start({
phoneNumber: async () => await input.text("Enter phone number: "),
password: async () => await input.text("2FA password (if any): "),
phoneCode: async () => await input.text("Code from Telegram: "),
onError: (err) => console.log(err),
});

console.log("✅ Logged in and running...");

// 🔥 NEW MESSAGE HANDLER
client.addEventHandler(async (event) => {
const msg = event.message;
if (!msg || !msg.text) return;

if (msg.text.includes("BUY") || msg.text.includes("SELL")) {
console.log("📩 Signal received");

const sent = await client.sendMessage(DEST_CHAT, {
message: msg.text,
});

messageMap.set(msg.id, sent.id);
console.log("➡ Copied message ID saved");
}
}, new NewMessage({ chats: [SOURCE_CHAT] }));


// ✨ EDIT HANDLER
client.addEventHandler(async (event) => {

const msg = event.message; // ✅ MUST be inside
if (!msg || !msg.text) return;

if (messageMap.has(msg.id)) {
console.log("✏️ Signal edited — updating");

const copiedMsgId = messageMap.get(msg.id);

await client.editMessage(DEST_CHAT, {
message: copiedMsgId,
text: msg.text,
});

console.log("✅ Copy updated");
}

}, new NewMessage({ chats: [SOURCE_CHAT], incoming: true, func: e => e.message.editDate }));

})();
