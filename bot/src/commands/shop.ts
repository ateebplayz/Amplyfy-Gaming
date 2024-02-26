import { InfoEmbed } from '../modules/embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } from 'discord.js';
import { footer } from '../modules/embed'
import { CommandOptions } from '../modules/types';
import { emojis } from '../modules/data';

export const data = new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Sends an embed with the shop menu')
export const options: CommandOptions = {
    cooldown: 10000,
    permissionLevel: 'all'
}

export async function execute(interaction:CommandInteraction) {
    await interaction.deferReply()
    const button_shop_clan = new ButtonBuilder().setCustomId('button_shop_clan').setEmoji(emojis.kingdom).setLabel('Clan Shop').setStyle(ButtonStyle.Secondary)
    const button_shop_cosmetics = new ButtonBuilder().setCustomId('button_shop_cosmetics').setEmoji(emojis.cosmetics).setLabel('Cosmetics Shop').setStyle(ButtonStyle.Secondary)
    const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(button_shop_clan, button_shop_cosmetics)
    const embed = new InfoEmbed(`Select a Shop`, `Please use the buttons below to select a shop.`)
    return interaction.editReply({embeds: [embed], components: [actionRow]})
}