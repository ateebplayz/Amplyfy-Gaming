import { ErrorEmbed, InfoEmbed, SuccessEmbed } from '../modules/embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, CommandInteraction, Interaction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import { footer } from '../modules/embed'
import { CommandOptions } from '../modules/types';
import { collections } from '../modules/mongo';
import { createClan, existClan, fetchUser } from '../modules/db';
import { emojis, guildId } from '../modules/data';
import { client } from '..';

export const data = new SlashCommandBuilder()
    .setName('clan')
    .setDescription('Clan Details')
    .addSubcommand((subcommand)=>subcommand.setDescription('Create a Clan').setName('create'))
export const options: CommandOptions = {
    cooldown: 10000,
    permissionLevel: 'all'
}

export async function execute(interaction:CommandInteraction) {
    let sub = (interaction as ChatInputCommandInteraction).options.getSubcommand(true)
    if(sub == 'create') {
        const modal = new ModalBuilder().setCustomId('modal_clan_create').setTitle('Create A Clan')
        const text_input_name = new TextInputBuilder().setCustomId('text_input_clan_name').setLabel('Clan Name').setMaxLength(50).setPlaceholder('Rick Gamers').setRequired(true).setStyle(TextInputStyle.Short).setMinLength(5)
        const text_input_desc = new TextInputBuilder().setCustomId('text_input_clan_desc').setLabel('Clan Description').setMaxLength(250).setPlaceholder('My amazing clan').setRequired(true).setStyle(TextInputStyle.Short).setMinLength(50)
        const actionRow1 = new ActionRowBuilder<TextInputBuilder>().addComponents(text_input_name)
        const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(text_input_desc)
        modal.addComponents(actionRow1, actionRow2)
        await interaction.showModal(modal)
        const filter = (f: ModalSubmitInteraction) => f.customId === 'modal_clan_create'
        await interaction.awaitModalSubmit({filter: filter, time: 6000_00}).then(async (mI)=>{
            await mI.deferReply({ephemeral: true})
            const user = await fetchUser(interaction.user.id)
            if(user) {
                if(user.balance.iceCubes >= 10) {
                    if(await (existClan("name", mI.fields.getField('text_input_clan_name').value))) {
                        const embed = new ErrorEmbed(`Clan Exists`, `Theres already a clan with this name. Please try another name.`)
                        return mI.editReply({embeds: [embed]})
                    }
                    createClan(interaction.user.id, mI.fields.getField('text_input_clan_name').value, mI.fields.getField('text_input_clan_name').value)
                    const embed = new SuccessEmbed(`Clan Created`, `Thank you for creating a clan. Welcome aboard!`)
                    mI.editReply({embeds: [embed]})
                } else {
                    const embed = new ErrorEmbed(`Insufficient Balance`, `You need ${10-user.balance.iceCubes}x ${emojis.ice_cube} more to create a clan!`)
                    mI.editReply({embeds: [embed]})
                }
            }
        })
    }
}