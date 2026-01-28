console.log("BOT STARTING...");
console.log("BOT STARTING...");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const input = require("input");

const apiId = 31581826; // <-- PUT YOUR API ID
const apiHash = "3e159192e5ad7e5052530bb69325994c"; // <-- PUT YOUR API HASH
const stringSession = new StringSession("");

const SOURCE_CHAT = -1002201450581; // without @
const DEST_CHAT = -1003424003343; // without @

// Map to link original message → copied message
const messageMap = new Map();

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5
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

if (event.chatId.toString() !== SOURCE_CHAT.toString()) return;
const msg = event.message;

// Ignore empty messages
if (!msg) return;
    // Ignore empty messages

    const text = (msg.text || "").toLowerCase();

    // Block obvious scam words
    if (
        text.includes("connect your wallet") ||
        text.includes("claiming") ||
        text.includes("migrating") ||
        text.includes("validate") ||
        text.includes("rectify") ||
        text.includes("rewards") ||
        (text.includes("t.me/") && text.includes("bot"))
    ) {
        console.log("🚫 Scam message blocked");
        return;
    }

    // ONLY react to source chat
    if (event.chatId.toString() !== SOURCE_CHAT.toString()) return;

    console.log("📥 Message from SOURCE detected");

    // Send text OR media
    const sent = await client.sendMessage(DEST_CHAT, {
        message: msg.text || "",
        file: msg.media || undefined
    });

    console.log("✅ Message forwarded");
    // Save for edit tracking
    messageMap.set(msg.id, sent.id);
}, new NewMessage({ chats: [SOURCE_CHAT], incoming: true }));


// ✨ EDIT HANDLER
client.addEventHandler(async (event) => {

    const msg = event.message;
    if (!msg || !msg.text) return;

    // Check if this message was forwarded before
    if (messageMap.has(msg.id)) {

        console.log("✏️ Signal edited — updating");

        const copiedMsgId = messageMap.get(msg.id);

        await client.editMessage(DEST_CHAT, {
            message: copiedMsgId,
            text: msg.text,
        });

        console.log("✅ Copy updated");
    } // closes: if (messageMap.has(msg.id))

}, new NewMessage({
    chats: [SOURCE_CHAT],
    incoming: true,
    func: (e) => e.message.editDate // 🔥 THIS LINE IS THE KEY
}));
}) ();