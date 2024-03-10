import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Interaction, ModalBuilder, ModalSubmitInteraction, StringSelectMenuInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js"
import { Product } from "../modules/types"
import { AMPLYFY_LOGO_URL, emojis, prices } from "../modules/data"
import { ErrorEmbed, InfoEmbed, SuccessEmbed } from "../modules/embed"
import { addBalance, fetchUser } from "../modules/db"
import { channels } from ".."
import { collections } from "../modules/mongo"

export const data = {
    customId: 'dropdown_shop_cosmetic',
    type: 'component'
}
export async function execute(interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({ephemeral: true})
    const value = interaction.values.join()
    let products = await collections.products.find().toArray()
    let product: Product = {
        id: "",
        name: "",
        description: "",
        price: 0,
        stock: 0,
        values: []
    }
    products.map((prod)=>{
        if(prod.id == value) product = prod
    })
    const embed = new InfoEmbed(
        `${product.name}`,
        `${product.description}`
    ).addFields({name: 'Price', value: `${emojis.snowflake} ${product.price}`,  inline: true}).addFields({name: 'Stock', value: `${product.stock}`, inline: true}).setFooter({text: product.id, iconURL: AMPLYFY_LOGO_URL})
    const buyButton = new ButtonBuilder().setCustomId('button_shop_cosmetic_purchase').setEmoji(emojis.snowflake).setLabel('Purchase').setStyle(ButtonStyle.Primary)
    if(product.stock <= 0) buyButton.setDisabled(true)
    const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents(buyButton)

    interaction.editReply({
        embeds: [embed],
        components: [actionRow]
    })
    return
}