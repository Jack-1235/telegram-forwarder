const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");

const apiId = 31581826;
const apiHash = "3e159192e5ad7e5052530bb69325994c";

(async () => {
const client = new TelegramClient(new StringSession("1BAAOMTQ5LjE1NC4xNjcuOTEAUIH2vLewdbRoDQ734df/DiWSe2CVlbcFF15YpJx2ttrwHVsL8ORHZONo1RlGv6R0reeX2tdvpNuLwKWdjiWWapd9DjNYDgGOQnNlkfd7iUAeAcaG64SgBvZZ+ta56VxDxOKZbABhKa+zhUUskNiaMIuARNXaYDA0Cm4gpBNVASA+Y7OW4g8FnkA2p2xUVvCzWiF720LUQvZtzsvSRNO2B8WaOIibDnVjSSRBNEPZtyHs1AxbqQ/+gxVIbqI61b2Qu2yMati2SE6+Q3PIAAIEPKw/uZiZ92Y8xyHYhNdhBQJje4mlK+dPWXZfkwm+Of8/RoFcwufP0BRrrCmG2dx/18k="), apiId, apiHash, {
connectionRetries: 5,
});

await client.start({
phoneNumber: async () => await input.text("Phone number: "),
password: async () => await input.text("2FA password (if any): "),
phoneCode: async () => await input.text("Code from Telegram: "),
onError: (err) => console.log(err),
});

console.log("\nYOUR NEW STRING SESSION:\n");
console.log(client.session.save());
})();
