import { ActionRowBuilder, ButtonInteraction, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js"
import { channels } from ".."
import { prices, emojis } from "../modules/data"
import { fetchUser, addBalance, reduceBalance, purchaseProduct } from "../modules/db"
import { SuccessEmbed, InfoEmbed, ErrorEmbed } from "../modules/embed"
import { collections } from "../modules/mongo"
import { Product } from "../modules/types"

export const data = {
    customId: 'button_shop_cosmetic_purchase',
    type: 'component'
}
export async function execute(interaction: ButtonInteraction) {
    await interaction.deferReply()
    const value = interaction.message.embeds[0].footer?.text || 'x'
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
    const user = await fetchUser(interaction.user.id)
    let embed;
    if(user.balance.snowflakes >= product.price) {
        if(product.stock <= 0 || product.values.length <= 0) {
            embed = new ErrorEmbed(`Out of Stock`, `The item **${product.name}** is out of stock. Please wait for it to be back in stock again.`)
        } else {
            embed = new SuccessEmbed(`Successful Purchase`, `You have successfully purchased a **${product.name}** for ${product.price}x ${emojis.snowflake}. Thank you for your purchase`);
            const logEmbed = new InfoEmbed(`New Purchase`, `**User Id** : ${interaction.user.id}\n**User Tag** : ${interaction.user.tag}`).addFields({name: 'Item Purchased', value: `${product.name}`, inline: true}, {name: 'Balance Used', value: `${emojis.snowflake} x ${product.price}`,  inline: true});
            try {
                (channels.logChannel as TextChannel).send({embeds: [logEmbed]})
            } catch {console.log}
            purchaseProduct(interaction.user.id, product)
        }
    } else {
        embed = new ErrorEmbed(`Insufficient Funds`, `You do not have enough funds to make this purchase. You need ${product.price - user.balance.snowflakes}x ${emojis.snowflake} more!`)
    }
    interaction.editReply({embeds: [embed]})
}