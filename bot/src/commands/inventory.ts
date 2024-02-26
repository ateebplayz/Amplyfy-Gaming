import { InfoEmbed } from '../modules/embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } from 'discord.js';
import { footer } from '../modules/embed'
import { BotUser, CommandOptions } from '../modules/types';
import { fetchClan, fetchUser } from '../modules/db';
import { emojis } from '../modules/data';

export const data = new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Check out your inventory!')
export const options: CommandOptions = {
    cooldown: 10000,
    permissionLevel: 'all'
}

export async function execute(interaction:CommandInteraction) {
    await interaction.deferReply()
    const embed = new InfoEmbed(`${interaction.user.tag} Inventory`, `Here is the inventory of <@!${interaction.user.id}>`).setThumbnail(interaction.user.avatarURL())
    const user = await fetchUser(interaction.user.id)
    const clan = await fetchClan(user.clanId)
    if(!clan) {
        embed.addFields({name: 'Clan', value: 'None Joined', inline: true})
    } else {
        embed.addFields({name: 'Clan', value: clan.name, inline: true})
    }
    embed.addFields({
        name: `User Balance`,
        value: `${user.balance.snowflakes}x ${emojis.snowflake}\n${user.balance.iceCubes}x ${emojis.ice_cube}`
    })
    return interaction.editReply({embeds: [embed]})
}