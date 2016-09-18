/**
 * Class containing regex for detecting a chat command and
 * an action that will be executed the the chat command is
 * called. Commands are to be registered using a Bot's
 * CommandRegistry
 */
class Command
{
	/**
	 * @param {regex} command activation chat command regex to match
	 *                        Capture groups can be used in the command for
	 *                        parsing the command message
	 * @param {method} action action that will be executed
	 *                        Action must receive the message object as well as
	 *                        the Promise resolve and reject methods when created
	 * @param {string} desc   helptext description of command
	 * @param {string} usage  helptext usage of command
	 * @param {string} help   helptext additional information about command
	 * @param {string} alias  helptext optional alias, does not need to be defined
	 *                        or passed to super at class creation
	 */
	constructor(command, action, desc, usage, help, alias)
	{
		this.command = command;
		this.action = action;
		this.desc = desc;
		this.usage = usage;
		this.help = help;
		this.alias = alias;
	}

	/**
	 * Assign the bot instance to the command
	 * @param {Bot} bot Discord.js client instance
	 * @returns {null}
	 */
	Register(bot)
	{
		this.bot = bot;
	}

	/**
	 * Return a promise with the action to be executed
	 * @param {object} message message object passed by parent caller
	 * @returns {Promise}
	 */
	DoAction(message)
	{
		this.async = new Promise( (resolve, reject) =>
		{
			this.action(message, resolve, reject);
		});

		return this.async;
	}
}

 module.exports = Command;