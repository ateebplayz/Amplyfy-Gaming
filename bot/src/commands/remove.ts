import { InfoEmbed } from '../modules/embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, CommandInteraction, TextChannel } from 'discord.js';
import { CommandOptions } from '../modules/types';
import { reduceBalance } from '../modules/db';
import { emojis } from '../modules/data';
import { channels } from '..';

export const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove users items, Administrator Only!')
    .addUserOption(option => option
        .setDescription('The user to add to')
        .setName('user')
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName('type')
        .setDescription('The type of item you want to remove')
        .setChoices({name: 'Snowflakes', value: 'Snowflakes'}, {name: 'Ice Cubes', value: 'Ice Cubes'})
        .setRequired(true)
    )
    .addNumberOption(option => option
        .setDescription('Amount of Items to remove')
        .setName('amount')
        .setRequired(true)
    )
export const options: CommandOptions = {
    cooldown: 10000,
    permissionLevel: 'admin'
}

export async function execute(interaction:CommandInteraction) {
    await interaction.deferReply({ephemeral: true})
    const user = (interaction as ChatInputCommandInteraction).options.getUser('user', true)
    const type = (interaction as ChatInputCommandInteraction).options.getString('type', true)
    const amount = (interaction as ChatInputCommandInteraction).options.getNumber('amount', true)

    let emoji = ``
    switch (type) {
        case 'Snowflakes':
            emoji = emojis.snowflake
            await reduceBalance(user.id, 'snowflake', amount)
            break
        case 'Ice Cubes':
            emoji = emojis.ice_cube
            await reduceBalance(user.id, 'ice', amount)
            break
    }
    const logEmbed = new InfoEmbed(`New Reduction`, `**Editor** : ${interaction.user.id}\n**User Added to** : ${user.id}`).addFields({name: 'Items Reduced', value: `${amount}x ${emoji}`});
    (channels.logChannel as TextChannel).send({embeds: [logEmbed]})
    interaction.editReply(`Succesfully removed ${amount}x ${emoji} from <@!${user.id}>`)
}