const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";

(async () => {
const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });

await client.start({
phoneNumber: async () => await input.text("Number: "),
password: async () => await input.text("2FA Password (if any): "),
phoneCode: async () => await input.text("Code: "),
onError: console.log,
});

console.log("\n🔥 COPY THIS STRING:");
console.log(client.session.save());
})();