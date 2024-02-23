import discord from 'discord.js'
import { CooldownHandler } from './cooldowns'

export interface CommandOptions {
    /**
     * All users/
     * existing members(players)/
     * develoeprs are allowed to run
     */
    permissionLevel?: 'all' | 'member' | 'dev' | 'admin' | 'mod'
    cooldown?: number
    aliases?: Array<string>
}

export interface Command {
    data: discord.RESTPostAPIApplicationCommandsJSONBody
    options?: CommandOptions
    execute: (interaction: discord.Interaction) => Promise<void>
}

export interface CommandCooldown {
    user: discord.User,
    endsAt: Date
}

export interface InteractionHandler {
    data: InteractionHandlerData
    execute: (interaction: discord.Interaction) => Promise<void>
}

interface InteractionHandlerData {
    customId: string,
    type: "autocomplete" | "component"
}
export interface AmplyfyClient extends discord.Client  {
    commands: discord.Collection<string, Command>,
    interactions: discord.Collection<string, InteractionHandler>,
    cooldowns: CooldownHandler,
}