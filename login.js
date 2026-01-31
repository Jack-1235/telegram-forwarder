const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";

(async () => {
const client = new TelegramClient(new StringSession(""), apiId, apiHash, {
connectionRetries: 5,
});

await client.start({
phoneNumber: async () => await input.text("Enter your phone number: "),
password: async () => await input.text("Enter 2FA password (if any): "),
phoneCode: async () => await input.text("Enter the code you received: "),
onError: (err) => console.log(err),
});

console.log("\n\n🔥 NEW SESSION STRING:\n");
console.log(client.session.save());
})();