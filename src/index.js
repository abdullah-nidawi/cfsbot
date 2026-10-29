require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const path = require("path");
const { CommandHandler } = require("djs-commander");
const mongoose = require("mongoose");
const withCommandErrorHandling = require("./utils/withCommandErrorHandling");

//env imports
const TOKEN = process.env.BOT_TOKEN;
const MGDB = process.env.MGDB_URI;
const testServer = process.env.TEST_SERVER_ID;
const missingEnv = ["BOT_TOKEN", "MGDB_URI"].filter((key) => !process.env[key]);

if (missingEnv.length) {
	throw new Error(`Missing required environment variable(s): ${missingEnv.join(", ")}`);
}

//init client obj
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

module.exports = client;
client.on("error", (error) => console.error("Discord client error:", error));
mongoose.connection.on("error", (error) => console.error("MongoDB connection error:", error));

//init cmdHandler
const commandHandler = new CommandHandler({
	client,
	commandsPath: path.join(__dirname, "commands"),
	eventsPath: path.join(__dirname, "events"),
	validationsPath: path.join(__dirname, "validations"),
	...(testServer ? { testServer } : {}),
});

// djs-commander invokes command handlers without a catch boundary.
for (const command of commandHandler.commands) {
	command.run = withCommandErrorHandling(command.name, command.run);
}

process.on("unhandledRejection", (error) => console.error("Unhandled asynchronous error:", error));

async function start() {
	mongoose.set("strictQuery", false);
	try {
		await mongoose.connect(MGDB);
		console.log("Connected to DB ✅");
		await client.login(TOKEN);
	} catch (error) {
		console.error("Bot startup failed:", error);
		client.destroy();
		await mongoose.disconnect().catch(() => {});
		process.exitCode = 1;
	}
}

start();
