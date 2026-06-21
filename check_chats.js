require('dotenv').config();
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION || "");

(async () => {
const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
await client.connect();
console.log("✅ Logged in successfully!");

console.log("\n--- YOUR JOINED CHANNELS ---");
const dialogs = await client.getDialogs({});

dialogs.forEach(dialog => {
if (dialog.isChannel || dialog.isGroup) {
// We format the ID to show the -100 prefix for you
const formattedId = dialog.id.toString().startsWith("-") ? dialog.id : `-100${dialog.id}`;
console.log(`NAME: ${dialog.title}`);
console.log(`ID: ${formattedId}`);
console.log(`-----------------------------`);
}
});

console.log("\nCheck the list above. If your Source or Target channels are NOT listed, you must join them with this account first.");
process.exit();
})();

