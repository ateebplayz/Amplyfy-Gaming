import { ActionRowBuilder, ButtonInteraction, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, TextInputStyle } from "discord.js"
import { channels } from ".."
import { prices, emojis } from "../modules/data"
import { fetchUser, addBalance, reduceBalance } from "../modules/db"
import { SuccessEmbed, InfoEmbed, ErrorEmbed } from "../modules/embed"

export const data = {
    customId: 'button_shop_clan_purchase',
    type: 'component'
}
export async function execute(interaction: ButtonInteraction) {
    const value = interaction.message.embeds[0].footer?.text || 'x'
    let ProductDetails = {
        id: 'N/A',
        name: "N/A",
        description: "N/A",
        price: 0,
        priceEmoji: "",
        emoji: 'N/A'
    }
    switch (value) {
        case 'Ice Cube':
            ProductDetails.id = 'Ice Cube'
            ProductDetails.name = 'Ice Cube'
            ProductDetails.description = 'The default Clan Currency used for actions related to Clans'
            ProductDetails.price = prices.iceCube
            ProductDetails.emoji = emojis.ice_cube
            ProductDetails.priceEmoji = emojis.snowflake
    }
    if(interaction.isRepliable()) {
        const modal = new ModalBuilder().setCustomId('modal_shop_clan_purchase').setTitle(`Purchase ${ProductDetails.name}`)
        const amountText = new TextInputBuilder().setCustomId('text_shop_clan_purchase').setLabel('Amount').setMaxLength(100).setMinLength(1).setPlaceholder('The amount of ' + ProductDetails.name + ' you want to purchase').setRequired(true).setStyle(TextInputStyle.Short)

        const actionRow = new ActionRowBuilder<TextInputBuilder>().setComponents(amountText)
        modal.addComponents(actionRow)

        await interaction.showModal(modal)
        const filter = (f: ModalSubmitInteraction) => f.customId === 'modal_shop_clan_purchase'
        await interaction.awaitModalSubmit({filter: filter, time: 6000_00}).then(async (mI)=>{
            await mI.deferReply({ephemeral: true})
            const amount = parseInt(mI.fields.getField('text_shop_clan_purchase').value)
            if(!amount || isNaN(amount)) return mI.editReply(`You have entered an invalid amount of ${ProductDetails.name} to purchase!`)
            const price = amount * ProductDetails.price
            const user = await fetchUser(mI.user.id)
            let embed;
            if(user.balance.snowflakes >= price) {
                embed = new SuccessEmbed(`Successful Purchase`, `You have successfully purchase ${amount}x ${ProductDetails.emoji} for ${price}x ${ProductDetails.priceEmoji}. Thank you for your purchase`);
                const logEmbed = new InfoEmbed(`New Purchase`, `**User Id** : ${mI.user.id}\n**User Tag** : ${mI.user.tag}`).addFields({name: 'Item Purchased', value: `${ProductDetails.emoji} x ${amount}`, inline: true}, {name: 'Balance Used', value: `${ProductDetails.priceEmoji} x ${price}`,  inline: true});
                try {
                    (channels.logChannel as TextChannel).send({embeds: [logEmbed]})
                } catch {console.log}
                await addBalance(mI.user.id, 'ice', amount)
                await reduceBalance(mI.user.id, 'snowflake', price)
            } else {
                embed = new ErrorEmbed(`Insufficient Funds`, `You do not have enough funds to make this purchase. You need ${price - user.balance.snowflakes}x ${ProductDetails.priceEmoji} more!`)
            }
            mI.editReply({embeds: [embed]})
        })
    }
}