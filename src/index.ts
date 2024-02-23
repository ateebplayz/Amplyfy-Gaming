import chalk from 'chalk'
import discord from 'discord.js'
import dotenv from 'dotenv'
import fs from 'node:fs'
import { Command, InteractionHandler, AmplyfyClient } from './modules/types'
import { CooldownHandler } from './modules/cooldowns'
import { CooldownErrorEmbed, ErrorEmbed, RunTimeErrorEmbed } from './modules/embed'
import { roleIds } from './modules/data'

dotenv.config()

export let channels: { logChannel: discord.Channel | undefined | null } = {
    logChannel: null,
}

export const client = new discord.Client({intents: [discord.GatewayIntentBits.Guilds, discord.GatewayIntentBits.MessageContent, discord.GatewayIntentBits.GuildMessages, discord.GatewayIntentBits.DirectMessages]}) as AmplyfyClient
client.commands = new discord.Collection<string, Command>()
client.interactions = new discord.Collection<string, InteractionHandler>()
client.cooldowns = new CooldownHandler()

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const timer = Date.now()
        const command = client.commands.get(interaction.commandName)
            || client.commands.find(cmd => cmd.options?.aliases && cmd.options.aliases.includes(interaction.commandName))

        if (!command) return console.log(`${chalk.red('NOT FOUND >> ')}Command ${interaction.commandName}`)

        try {
            if (command.options?.cooldown) {
                if (!client.cooldowns.isCooldown(interaction.user, command)) {
                    client.cooldowns.setCooldown(interaction.user, command)
                } else {
                    const cooldownData = client.cooldowns?.getCooldown(interaction.user, command)
                    if (cooldownData?.endsAt) {
                        const cooldownTimeRemaining = cooldownData.endsAt.getTime() - Date.now()
                        await interaction.reply({ ephemeral: true, embeds: [new CooldownErrorEmbed(command, cooldownTimeRemaining)] })
                        return
                    } else {
                        console.log(`${chalk.red('INVALID >>')} Cooldown for ${interaction.commandName}`)
                    }
                }
            }

            if (command.options?.permissionLevel) {
                const member = await interaction.guild?.members.fetch(interaction.user)
                switch (command.options.permissionLevel) {
                    case 'member':
                        break
                    case 'all':
                        break
                    case 'dev':
                        if(member) {
                            if(!(member.roles.cache.has(roleIds.developer))) {
                                const permError = new ErrorEmbed('You do not have permission to do this command!', 'You need to have the `Core-Team` role to execute this command.')
                                interaction.reply({embeds: [permError], ephemeral: true})
                                return
                            }
                        }
                        break
                    case 'mod':
                        if(member) {
                            if(!(member.roles.cache.has(roleIds.moderator))) {
                                if(member.permissions.has([discord.PermissionsBitField.Flags.Administrator])) break;
                                const permError = new ErrorEmbed('You do not have permission to do this command!', 'You need to have the `Moderator` role or `Administrator` permission to execute this command.')
                                interaction.reply({embeds: [permError], ephemeral: true})
                                return
                            }
                        }
                        break
                    case 'admin':
                        if(member) {
                            if(!(member.permissions.has([discord.PermissionsBitField.Flags.Administrator]))) {
                                const permError = new ErrorEmbed('You do not have permission to do this command!', 'You need to have the `Administrator` permission to execute this command.')
                                interaction.reply({embeds: [permError], ephemeral: true})
                                return
                            }
                        }
                        break
                }
            }
            await command.execute(interaction)
            console.log(`${chalk.green('EXECUTE >>')} Command ${command.data.name} ${Date.now() - timer}ms | ${interaction.user.id}`)
        } catch (e) {
            const errorId = '210ie90132ir9e032ur9032u9tru98ur9328ur8932ure9328ur932ur8932ur923ur8932u8x'
            console.log(`${chalk.red('EXECUTE ERROR >>')} Command ${command.data.name} ${Date.now() - timer}ms ${errorId}`)
            console.error(e)

            await interaction.reply({ ephemeral: true, embeds: [new RunTimeErrorEmbed(errorId)] }).catch(console.log)
        }
    } else if(interaction.isRepliable()) {
        const timer = Date.now()
        const localInteraction = client.interactions.get(interaction.customId)

        if (!localInteraction) {
            if(interaction.customId == 'EXCLUDING CUSTOM IDS HERE') {
                return console.log(`${chalk.green('EXECUTE >>')} Interaction ${interaction.customId} ${Date.now()-timer}ms | ${interaction.user.id}`)
            } else {
                return console.log(`${chalk.red('NOT FOUND >> ')}Interaction ${interaction.customId}`)
            }
        }

        try {
            await localInteraction.execute(interaction)
            console.log(`${chalk.green('EXECUTE >>')} Interaction ${localInteraction.data.customId} ${Date.now() - timer}ms | ${interaction.user.id}`)
        } catch (e) {
            const errorId = '210ie90132ir9e032ur9032u9tru98ur9328ur8932ure9328ur932ur8932ur923ur8932u8x'
            console.log(`${chalk.red('EXECUTE ERROR >>')} Interaction ${localInteraction.data.customId} ${Date.now() - timer}ms ${errorId}`)
            console.error(e)
            try {
                await interaction.reply({ ephemeral: true, embeds: [new RunTimeErrorEmbed(errorId)] }).catch(console.log)
            } catch {console.log}
        }
    }
})

client.once('ready', async (readyClient) => {
    const interactionFiles = fs.readdirSync('out/interactions').filter(file => file.endsWith('.js'))
    const commandFiles = fs.readdirSync('out/commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const command: Command = require(`./commands/${file}`);

        if(!command.data || !command.execute) {
            console.log(`${chalk.red('INVALID >>')} Command ${file}`)
            break
        }
        console.log(`${chalk.green('LOADED >>')} Command \t${command.data.name}\t${JSON.stringify(command.options)}`)
        client.commands.set(command.data.name, command);
    }
    for (const file of interactionFiles) {
        const localInteraction: InteractionHandler = require(`./interactions/${file}`);

        if(!localInteraction.data || !localInteraction.execute) {
            console.log(`${chalk.red('INVALID >>')} Interaction ${file}`)
            break
        }
        console.log(`${chalk.green('LOADED >>')} Interaction\t${localInteraction.data.customId}`)
        client.interactions.set(localInteraction.data.customId, localInteraction);
    }
    // channels.paidJob = await client.channels.cache.find(channel => channel.id === channelIds.paidJob)
    readyClient.user.setPresence({
        activities: [{
            name: 'Amplyfy Gaming',
            type: discord.ActivityType.Watching
        }],
        status: 'online',
    })
    console.log(chalk.bold(chalk.green('JHM Client is ready to go.\n\n')) + `${chalk.bold('Client ID')} : ${process.env.CLIENTID}\n${chalk.bold('Client Username')} : ${readyClient.user.username}`)
})

client.login(process.env.BOTTOKEN)