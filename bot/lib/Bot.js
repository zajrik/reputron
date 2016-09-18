require("../Globals");

/**
 * Extend the Discord.js Client class to provide a wrapper for the old
 * personality.js functionality and future extensions
 * @extends {Client}
 */
class Bot extends Client
{
	/**
	 * @param {string} name The name of the bot. Will preface Say method output
	 * @param {string} token The login token for the bot
	 * @returns {null}
	 */
	constructor(name, token)
	{
		super();

		this.name = name;
		this.token = token;

		// Create bot command registry
		this.commands = new CommandRegistry(this);

		// Create an action scheduler for the bot
		this.scheduler = new Scheduler(this);

		// Initialize a database for the bot
		this.db = new JsonDB("data-store", true, true);

		// Register commands
		this.commands.Register(new Command_AddRep());
		this.commands.Register(new Command_NegRep());
		this.commands.Register(new Command_Help());
		this.commands.Register(new Command_Uptime());
		this.commands.Register(new Command_Version());

		// Register admin commands
		this.commands.Register(new Command_Update());

		// Schedule tasks

		// Event handlers //////////////////////////////////////////////////////

		// Ready event
		this.on("ready", () =>
		{
			// Message the admin specified in settings.json the update
			// completed if restarting after an update
			try
			{
				var doUpdate = this.db.getData("/doUpdate");
				var restartTime = this.db.getData("/restartTime");
			}
			catch (e)
			{
				this.db.push("/doUpdate", false);
				var doUpdate = this.db.getData("/doUpdate");
				this.db.push("/restartTime", 1);
				var restartTime = this.db.getData("/restartTime");
			}
			if (doUpdate)
			{
				this.Say("Update was completed.");
				this.db.push("/doUpdate", false);

				var admin = this.fetchUser(settings.admin);
				admin.then( (admin) =>
				{
					admin.sendCode("css", `Update completed. (${(Time.now() - restartTime) / 1000} secs)`);
				});
			}

			this.user.setStatus("online", "Try help")
				.then(user => this.Say(
					`Status set to: ${user.status}, ${user.game.name}`))
				.catch(this.Say);

			this.Say(`Ready to go! ` +
				`Guilds: ${this.guilds.size.toString().cyan} | ` +
				`Channels: ${this.channels.size.toString().cyan} | ` +
				`Users: ${this.users.size.toString().cyan}`);

			// Set bot reconnectionMessageSuppress time 60 seconds behind
			// to ensure the first reconnection message occurs immediately
			this.reconnectionMessageSuppress = Time.now() - 60000;
		});

		// Reconnecting event
		this.on("reconnecting", () =>
		{
			// Send reconnecting message every 10 seconds during reconnection
			// process until bot successfully reconnects
			if (Time.Difference(Time.now(),
				this.reconnectionMessageSuppress).ms >= 10000)
			{
				this.reconnectionMessageSuppress = Time.now();
				this.Say("Reconnecting...".warn);
			}
		});

		// Disconnected event
		this.on("disconnected", (error, code) =>
		{
			this.Say("Disconnected: ".warn + error);
		});

		// Warn event
		this.on("warn", (w) =>
		{
		    this.Say(w.warn)
		});

		// Error event
		this.on("error", (e) =>
		{
		    this.Say(e.error);
		});
	}

	/**
	 * Log the bot into Discord
	 * @returns {null}
	 */
	Login()
	{
		this.login(this.token);
	}

	/**
	 * Write to the console, prefaced by @this.name
	 * @param {string} text The text to write to the console
	 * @returns {null}
	 */
	Say(text)
	{
		if (text)
			console.log(`${"@".say}${this.name.say}: ${text}`);
	}
}

module.exports = Bot;