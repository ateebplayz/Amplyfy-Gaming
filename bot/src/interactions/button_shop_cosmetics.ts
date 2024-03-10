import { ActionRowBuilder, ButtonInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js"
import { InfoEmbed } from "../modules/embed"
import { emojis } from "../modules/data"
import { collections } from "../modules/mongo"

export const data = {
    customId: 'button_shop_cosmetics',
    type: 'component'
}
export async function execute(interaction: ButtonInteraction) {
    interaction.deferUpdate()
    let products: Array<StringSelectMenuOptionBuilder> = [];
    (await collections.products.find().toArray()).map((product)=>{
        products.push(new StringSelectMenuOptionBuilder()
            .setLabel(product.name)
            .setDescription(product.description)
            .setValue(product.id),)
    })
    const embed = new InfoEmbed(`Cosmetics Shop`, 
    `
        Welcome to the Cosmetics Shop. Below are our items available for purchase. Just select one in the dropdown below and you'll be redirected to purchase it.\n
    `
    )
    const dropdown = new StringSelectMenuBuilder().setCustomId('dropdown_shop_cosmetic').setMaxValues(1).setMinValues(1).setPlaceholder('Select a Product').addOptions(
        products
    )
    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(dropdown)
    if(interaction.message.editable) {
        interaction.message.edit({
            embeds: [embed],
            components: [actionRow]
        })
    }
    
    return
}