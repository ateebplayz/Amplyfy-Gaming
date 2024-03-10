import { InfoEmbed, KeyEmbed, KeyMainEmbed } from '../modules/embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction } from 'discord.js';
import { footer } from '../modules/embed'
import { CommandOptions } from '../modules/types';
import { collections } from '../modules/mongo';
import { fetchUser } from '../modules/db';

export const data = new SlashCommandBuilder()
    .setName('purchases')
    .setDescription('Replies with all your purchases, along with the keys!')
export const options: CommandOptions = {
    cooldown: 10000,
    permissionLevel: 'all'
}

export async function execute(interaction:CommandInteraction) {
    await interaction.deferReply()
    const user = await fetchUser(interaction.user.id)
    let firstPart = []
    let secondPart = []
    let thirdPart = []
    let fourthPart = []
    let fifthPart = []
    if(user) {
        for (let i = 0; i < user.items.length; i += 25) {
            const part = user.items.slice(i, i + 25)
            switch (Math.floor(i / 25)) {
                case 0:
                    firstPart.push(...part)
                    break
                case 1:
                    secondPart.push(...part)
                    break
                case 2:
                    thirdPart.push(...part)
                    break
                case 3:
                    fourthPart.push(...part)
                    break
                case 4:
                    fifthPart.push(...part)
                    break
                default:
                    break
            }
        }
    }
    const mainEmbed = new KeyMainEmbed(`Your Keys`, `All your purchases with their keys are down below.`)
    let embeds = [mainEmbed]
    if(firstPart.length > 0) {
        let embed = new KeyEmbed()
        firstPart.map((part) => {
            embed.addFields({name: part.product.name, value: `||${part.value}||`, inline: true} as APIEmbedField)
        })
        embeds.push(embed)
    }
    if(secondPart.length > 0) {
        let embed = new KeyEmbed()
        secondPart.map((part) => {
            embed.addFields({name: part.product.name, value: `||${part.value}||`, inline: true} as APIEmbedField)
        })
        embeds.push(embed)
    }
    if(thirdPart.length > 0) {
        let embed = new KeyEmbed()
        thirdPart.map((part) => {
            embed.addFields({name: part.product.name, value: `||${part.value}||`, inline: true} as APIEmbedField)
        })
        embeds.push(embed)
    }
    if(fourthPart.length > 0) {
        let embed = new KeyEmbed()
        fourthPart.map((part) => {
            embed.addFields({name: part.product.name, value: `||${part.value}||`, inline: true} as APIEmbedField)
        })
        embeds.push(embed)
    }
    if(fifthPart.length > 0) {
        let embed = new KeyEmbed()
        fifthPart.map((part) => {
            embed.addFields({name: part.product.name, value: `||${part.value}||`, inline: true} as APIEmbedField)
        })
        embeds.push(embed)
    }
    return interaction.editReply({embeds: embeds})
}