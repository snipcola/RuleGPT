const { OpenAIApi, Configuration } = require('openai');

const { Events } = require('discord.js');
const { addWarning, createServerConfig, getWarnings } = require('../lib/serverConfigs.js');

module.exports = {
    name: Events.MessageCreate,
    async execute (message) {
        const config = await createServerConfig(message.guild.id);
        const warnings = await getWarnings(message.guild.id, message.author.id);

        if (message.author.bot || message.guild.ownerId === message.author.id || !config.apiKey) return;

        const openai = new OpenAIApi(new Configuration({ apiKey: config.apiKey || null }));

        try {
            const completion = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo-0613',
                messages: [
                    { role: 'system', content: 'Ensure the message does not break any of the provided rules; use a function and decide based on severity and warnings; if no rules are broken, do not use a function, even if the user has accumulated warnings; if there are no rules, don\'t do anything.' },
                    { role: 'user', content: `Message: "${message.content}"\nWarnings: ${warnings.length}\nRules: ${config.rules ? `"${config.rules}"` : 'No rules provided.'}` }
                ],
                functions: [
                    {
                        name: 'warn',
                        description: 'Warn',
                        parameters: {
                            type: 'object',
                            properties: {
                                reason: {
                                    type: 'string',
                                    description: 'Reason'
                                },
                                rule_broken: {
                                    type: 'string',
                                    description: 'Rule broken'
                                },
                                delete_message: {
                                    type: 'boolean',
                                    description: 'Delete message?'
                                }
                            },
                            required: ['reason', 'rule_broken', 'delete_message']
                        }
                    },
                    {
                        name: 'timeout',
                        description: 'Timeout',
                        parameters: {
                            type: 'object',
                            properties: {
                                time: {
                                    type: 'number',
                                    description: 'Time (ms)'
                                },
                                reason: {
                                    type: 'string',
                                    description: 'Reason'
                                },
                                rule_broken: {
                                    type: 'string',
                                    description: 'Rule broken'
                                },
                                delete_message: {
                                    type: 'boolean',
                                    description: 'Delete message?'
                                }
                            },
                            required: ['time', 'reason', 'rule_broken', 'delete_message']
                        }
                    },
                    {
                        name: 'kick',
                        description: 'Kick',
                        parameters: {
                            type: 'object',
                            properties: {
                                reason: {
                                    type: 'string',
                                    description: 'Reason'
                                },
                                rule_broken: {
                                    type: 'string',
                                    description: 'Rule broken'
                                },
                                delete_message: {
                                    type: 'boolean',
                                    description: 'Delete message?'
                                }
                            },
                            required: ['reason', 'rule_broken', 'delete_message']
                        }
                    },
                    {
                        name: 'ban',
                        description: 'Ban',
                        parameters: {
                            type: 'object',
                            properties: {
                                delete_messages: {
                                    type: 'boolean',
                                    description: 'Delete all messages?'
                                },
                                reason: {
                                    type: 'string',
                                    description: 'Reason'
                                },
                                rule_broken: {
                                    type: 'string',
                                    description: 'Rule broken'
                                },
                                delete_message: {
                                    type: 'boolean',
                                    description: 'Delete message?'
                                }
                            },
                            required: ['delete_messages', 'reason', 'rule_broken', 'delete_message']
                        }
                    }
                ],
                function_call: 'auto'
            }, { timeout: 30000 });

            const response = completion.data.choices[0].message;

            console.log(completion);

            async function warn ({ reason, rule_broken, delete_message }) {
                const addedWarning = await addWarning(message.guild.id, message.author.id, reason);
                if (!addedWarning) return;

                await message.reply(`⚠️ <@${message.author.id}> has been given a warning.\n\nReason: **${reason}**\nRule Broken: **${rule_broken}**\nMessage Deleted: **${delete_message ? 'Yes' : 'No'}**`);
                if (delete_message) await message.delete();
            };

            async function timeout ({ member, time, reason, rule_broken, delete_message }) {
                await member.timeout(time, reason);
                await message.reply(`⚠️ <@${message.author.id}> has been timed out for **${(time / 1000) / 60}** minutes.\n\nReason: **${reason}**\nRule Broken: **${rule_broken}**\nMessage Deleted: **${delete_message ? 'Yes' : 'No'}**`);
                if (delete_message) await message.delete();
            };

            async function kick ({ member, reason, rule_broken, delete_message }) {
                await member.kick(reason);
                await message.reply(`⚠️ <@${message.author.id}> has been kicked.\n\nReason: **${reason}**\nRule Broken: **${rule_broken}**\nMessage Deleted: **${delete_message ? 'Yes' : 'No'}**`);
                if (delete_message) await message.delete();
            };

            async function ban ({ member, delete_messages, reason, rule_broken, delete_message }) {
                await member.ban({ deleteMessageSeconds: delete_messages ? 60 * 60 * 24 * 7 : 0, reason });
                await message.channel.send(`⚠️ <@${message.author.id}> has been banned${delete_messages ? ' and their messages from the last 7 days have been deleted' : ''}.\n\nReason: **${reason}**\nRule Broken: **${rule_broken}**\nMessage Deleted: **${delete_message ? 'Yes' : 'No'}**`);
                if (delete_message) await message.delete();
            };

            const functions = { warn, timeout, kick, ban };

            if (response.function_call?.name) {
                const name = response.function_call.name;
                const args = JSON.parse(response.function_call.arguments);
                const member = await message.guild.members.fetch(message.author.id);

                try { if (functions[name]) await functions[name]({ member, ...args }); }
                catch { };
            };
        } catch {};
    }
};