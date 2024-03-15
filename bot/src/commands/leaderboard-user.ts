import { SlashCommandBuilder } from '@discordjs/builders'
import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js'
import { getTopClans } from '../modules/db'
import { InfoEmbed } from '../modules/embed'
import { emojis } from '../modules/data'

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Displays the top 10 with the most balance.')
    .addStringOption(opt=>opt
        .setChoices({name: 'clans', value: 'clans'})
        .setDescription('Choose a category')
        .setName('category')
        .setRequired(true)    
    )

export async function execute(interaction: CommandInteraction) {
    const opt = (interaction as ChatInputCommandInteraction).options.getString('category', true)
    if(opt == 'clans') {
        try {
            await interaction.deferReply()
            const topClans = await getTopClans()
            let desc = ``
            if(topClans)
            topClans.forEach((clan, index) => {
                desc += `${index == 0 ? ':first_place:' : index == 1 ? ':second_place:' : index == 2 ? ':second_place:' : '**${index + 1}**'} | **${clan.name}** | ${clan.balance}x ${emojis.ice_cube}\n`
            })
            const embed = new InfoEmbed('Top Clans by Balance', desc == `` ? 'None Found' : desc)
            await interaction.editReply({ embeds: [embed] })
        } catch (error) {
            console.error('Error executing leaderboard-users command:', error)
            await interaction.editReply('An error occurred while fetching top users.')
        }
    } else console.log(opt)
}
