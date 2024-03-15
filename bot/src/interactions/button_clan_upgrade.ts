import { ButtonInteraction } from "discord.js"
import { fetchClan, fetchUser, upgradeClan } from "../modules/db"
import { getClanLevel, getClanUpgradeAmount } from "../modules/f"
import { emojis } from "../modules/data"
import { ErrorEmbed, SuccessEmbed } from "../modules/embed"

export const data = {
    customId: 'button_clan_upgrade',
    type: 'component'
}
export async function execute(interaction: ButtonInteraction) {
    await interaction.deferReply({ephemeral:true})
    const user = await fetchUser(interaction.user.id)
    const clan = await fetchClan(user.clanId)
    if(clan) {
        if(user.userId == clan.leaderId) {
            if(clan.maxUser <= 145) {
                if(clan.balance >= getClanUpgradeAmount(clan.maxUser)) {
                    const x = await upgradeClan(5, clan)
                    const embed = new SuccessEmbed(`Upgraded Successfully`, `Successfully upgraded your clan by spending ${getClanUpgradeAmount(clan.maxUser)}x ${emojis.ice_cube}`)
                    if(x) {
                        const embed2 = new SuccessEmbed(`New Level achieved`, `Congratulations! Your clan has achieved a new level. It is now a ${getClanLevel(clan.maxUser + 5)}`)
                        interaction.editReply({embeds: [embed, embed2]})
                    } else {
                        interaction.editReply({embeds: [embed]})
                    }
                } else {
                    const embed = new ErrorEmbed(`Insufficient Balance`, `You do not have enough balance in the clan. You need ${getClanUpgradeAmount(clan.maxUser) - clan.balance}x ${emojis.ice_cube} more.`)
                    interaction.editReply({embeds: [embed]})
                    return
                }
            } else {
                const embed = new ErrorEmbed(`Max Level Achieved`, `Your clan has already achieved the maximum level possible. You cannot upgrade it more!`)
                interaction.editReply({embeds: [embed]})
                return
            }
        } else {
            const embed = new ErrorEmbed(`Not Owner`, `Only the owner of this clan can abandon the clan.`)
            interaction.editReply({embeds: [embed]})
            return
        }
    } else {
        const embed = new ErrorEmbed(`No clan found`, `You have not joined any clan! Please join one in order to deposit ice cubes to the clan.`)
        interaction.editReply({embeds: [embed]})
        return
    }
    return
}