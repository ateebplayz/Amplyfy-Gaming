import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Interaction, ModalBuilder, ModalSubmitInteraction, StringSelectMenuInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js"
import { Product } from "../modules/types"
import { AMPLYFY_LOGO_URL, emojis, prices } from "../modules/data"
import { ErrorEmbed, InfoEmbed, SuccessEmbed } from "../modules/embed"
import { addBalance, fetchUser } from "../modules/db"
import { channels } from ".."

export const data = {
    customId: 'dropdown_shop_clan',
    type: 'component'
}
export async function execute(interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({ephemeral: true})
    const value = interaction.values.join()
    let ProductDetails = {
        id: 'N/A',
        name: "N/A",
        description: "N/A",
        price: 0,
        priceEmoji: "",
        emoji: 'N/A'
    }
    switch (value) {
        case 'dropvalue_shop_ice':
            ProductDetails.id = 'Ice Cube'
            ProductDetails.name = 'Ice Cube'
            ProductDetails.description = 'The default Clan Currency used for actions related to Clans'
            ProductDetails.price = prices.iceCube
            ProductDetails.emoji = emojis.ice_cube
            ProductDetails.priceEmoji = emojis.snowflake
    }
    const embed = new InfoEmbed(
        `${ProductDetails.emoji} Ice Cube`,
        `${ProductDetails.description}`
    ).addFields({name: 'Price', value: `${ProductDetails.priceEmoji} ${ProductDetails.price}`}).setFooter({text: ProductDetails.id, iconURL: AMPLYFY_LOGO_URL})
    const buyButton = new ButtonBuilder().setCustomId('button_shop_clan_purchase').setEmoji(ProductDetails.priceEmoji).setLabel('Purchase').setStyle(ButtonStyle.Primary)
    const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(buyButton)

    interaction.editReply({
        embeds: [embed],
        components: [actionRow]
    })
    return
}