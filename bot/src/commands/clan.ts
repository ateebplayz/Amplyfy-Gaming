import { ErrorEmbed, InfoEmbed, SuccessEmbed } from '../modules/embed'
import { SlashCommandBuilder } from '@discordjs/builders'
import { APIEmbedField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, CommandInteraction, Interaction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js'
import { footer } from '../modules/embed'
import { CommandOptions } from '../modules/types'
import { collections } from '../modules/mongo'
import { addUserToClan, createClan, deleteClan, depositClan, existClan, fetchClan, fetchUser, handlePermissionChange, inviteUserToClan, removeUserFromClan, updateClanDetails, useKey } from '../modules/db'
import { emojis, guildId } from '../modules/data'
import { client } from '..'
import { getClanUpgradeAmount } from '../modules/f'

export const data = new SlashCommandBuilder()
    .setName('clan')
    .setDescription('Clan Details')
    .addSubcommand((subcommand)=>subcommand.setDescription('Create a Clan').setName('create'))
    .addSubcommand((subcommand)=>subcommand.setDescription('Deposit Ice Cubes to your Clan.').setName('deposit').addNumberOption(opt => opt.setDescription('Amount of Ice Cubes to deposit').setName('amount').setRequired(true).setMinValue(1)))
    .addSubcommand((subcommand)=>subcommand.setDescription('View information about your clan').setName('info'))
    .addSubcommand((subcommand)=>subcommand.setDescription('Invite a user to your clan').setName('invite').addUserOption(option=>option.setDescription('The user you want to invite').setName('user').setRequired(true)))
    .addSubcommand((subcommand)=>subcommand.setDescription('Join a clan using a unique 16 character long ID.').setName('join').addStringOption(option=>option.setDescription("The Unique Key you were DM'ed").setMaxLength(16).setMinLength(16).setName('key').setRequired(true)))
    .addSubcommand((subcommand)=>subcommand.setDescription('Edit your clans details').setName('edit'))
    .addSubcommand((subcommand)=>subcommand.setDescription('Leave your clan').setName('leave'))
    .addSubcommand((subcommand)=>subcommand.setDescription('Give a user in your clan a certain role').setName('manage').addStringOption(opt=>opt.setChoices({name: 'member', value: 'member'}, {name: 'coleader', value: 'coleader'}).setRequired(true).setName('type').setDescription('The type of role you wish to assign this member')).addUserOption(opt=>opt.setDescription('The user to edit').setName('user').setRequired(true)))
    .addSubcommand((subcommand)=>subcommand.setDescription('Abandon your clan. THIS ACTION IS IRREVERSIBLE.').setName('abandon'))
    .addSubcommand((subcommand)=>subcommand.setDescription('Upgrade your clan max space').setName('upgrade'))
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
                if(user.clanId !== '') {
                    const embed = new ErrorEmbed(`Already in Clan`, "You're already in a clan. Please use the `/clan leave` command or delete your old clan.")
                    return mI.editReply({embeds: [embed]})
                } else {
                    if(user.balance.iceCubes >= 10) {
                        const clanName = mI.fields.getField('text_input_clan_name').value
                        if(await (existClan("name", clanName))) {
                            const embed = new ErrorEmbed(`Clan Exists`, `There's already a clan with this name. Please try another name.`)
                            return mI.editReply({embeds: [embed]})
                        }
                        createClan(interaction.user.id, clanName, mI.fields.getField('text_input_clan_desc').value)
                        const embed = new SuccessEmbed(`Clan Created`, `Thank you for creating a clan. Welcome aboard!`)
                        mI.editReply({embeds: [embed]})
                    } else {
                        const embed = new ErrorEmbed(`Insufficient Balance`, `You need ${10-user.balance.iceCubes}x ${emojis.ice_cube} more to create a clan!`)
                        mI.editReply({embeds: [embed]})
                    }
                }
            }
        })
    } else if (sub == 'deposit') {
        await interaction.deferReply()
        const user = await fetchUser(interaction.user.id)
        const amount = (interaction as ChatInputCommandInteraction).options.getNumber('amount', true)
        if(user.balance.iceCubes >= amount) {
            if(user.clanId !== '') {
                console.log(user.clanId)
                depositClan(amount, interaction.user.id)
                const embed = new SuccessEmbed(`Successfully Deposited`, `Your clan has been successfully credited with ${amount}x ${emojis.ice_cube}.`)
                interaction.editReply({embeds: [embed]})
                return
            } else {
                const embed = new ErrorEmbed(`No clan found`, `You have not joined any clan! Please join one in order to deposit ice cubes to the clan.`)
                interaction.editReply({embeds: [embed]})
                return
            }
        } else {
            const embed = new ErrorEmbed(`Insufficient Balance`, `You need ${amount - user.balance.iceCubes}x ${emojis.ice_cube} more to make this deposit.`)
            interaction.editReply({embeds: [embed]})
            return
        }
    } else if (sub == 'info') {
        await interaction.deferReply({ephemeral: true})
        const user = await fetchUser(interaction.user.id)
        if(user.clanId !== '') {
            const clan = await fetchClan(user.clanId)
            if(clan) {
                const index = clan.Users.findIndex(item => item.user === interaction.user.id)
                const embed = new InfoEmbed(`${clan.name}`, `${clan.description}`).addFields(
                    {
                        name: 'Clan ID',
                        value: `${clan.clanId}`,
                        inline: true
                    },
                    {
                        name: 'Clan Leader',
                        value: `<@!${clan.leaderId}>`,
                        inline: true,
                    },
                    {
                        name: 'Clan Members',
                        value: `${clan.Users.length}`,
                        inline: true,
                    },
                    {
                        name: 'Clan Level',
                        value: `${clan.maxUser < 25 ? 'Igloo' : clan.maxUser >= 25 && clan.maxUser < 50 ? 'Iceberg' : clan.maxUser >= 50 && clan.maxUser < 100 ? 'Ice Fortress' : 'Ice Kingdom'}`,
                        inline: true,
                    },
                    {
                        name: 'Clan Balance',
                        value: `${clan.balance}`,
                        inline: true,
                    },
                    {
                        name: 'Your Status',
                        value: `${clan.Users[index].permissionLevel == 0 ? 'Member' : clan.Users[index].permissionLevel == 1 ? 'Co-Leader' : 'Leader'}`,
                        inline: true,
                    },
                )
                interaction.editReply({embeds: [embed]})
                return
            } else {
                const embed = new ErrorEmbed(`Abandoned Clan`, "It's most likely the clan was deleted by administrators and is now an abandoned clan. You may leave it by the `/clan leave` command.")
                interaction.editReply({embeds: [embed]})
            }
        } else {
            const embed = new ErrorEmbed(`No clan found`, `You have not joined any clan! Please join one in order to deposit ice cubes to the clan.`)
            interaction.editReply({embeds: [embed]})
            return
        }
    } else if (sub == 'edit') {
        const user = await fetchUser(interaction.user.id)
        const clan = await fetchClan(user.clanId)
        if(clan) {
            if(clan.leaderId == user.userId) {
                const modal = new ModalBuilder().setCustomId('modal_clan_update').setTitle('Edit Your Clan')
                const text_input_desc = new TextInputBuilder().setCustomId('text_input_clan_desc').setLabel("Your clan's new Description").setMaxLength(250).setPlaceholder('My amazing clan').setRequired(true).setStyle(TextInputStyle.Short).setMinLength(50).setValue(clan.description)
                const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(text_input_desc)
                modal.addComponents( actionRow2)
                await interaction.showModal(modal)
                const filter = (f: ModalSubmitInteraction) => f.customId === 'modal_clan_update'
                await interaction.awaitModalSubmit({filter: filter, time: 6000_00}).then(async (mI)=>{
                    await mI.deferReply({ephemeral: true})
                    if(user) {
                        updateClanDetails(user.clanId, mI.fields.getField('text_input_clan_desc').value)
                        const embed = new SuccessEmbed(`Clan Updated`, `Your clan details have been successfully updated!`)
                        mI.editReply({embeds: [embed]})
                        return
                    }
                })
            } else {
                const embed = new ErrorEmbed(`Not Owner`, `Only the owner of this clan can edit the clan details.`)
                interaction.reply({embeds: [embed]})
            }
        } else {
            const embed = new ErrorEmbed(`No clan found`, `You have not joined any clan! Please join one in order to deposit ice cubes to the clan.`)
            interaction.reply({embeds: [embed]})
        }
    } else if (sub == 'invite') {
        await interaction.deferReply({ephemeral: true})
        const user = (interaction as ChatInputCommandInteraction).options.getUser('user', true)
        const userDoc = await fetchUser(interaction.user.id)
        const user2Doc = await fetchUser(user.id)
        const clanDoc = await fetchClan(userDoc.clanId)
        if(user.bot) return interaction.editReply(`You can't invite a bot to your clan!`)
        if(user.id == interaction.user.id) return interaction.editReply(`You can't invite yourself to your own clan`)
        if(!(user2Doc.clanId == '')) return interaction.editReply(`This person is already in a clan. Please ask them to leave their current clan.`)
        if(clanDoc == null || userDoc.clanId == '') {
            const embed = new ErrorEmbed(`No clan found`, `You have not joined any clan! Please join one in order to deposit ice cubes to the clan.`)
            interaction.editReply({embeds: [embed]})
            return
        } else {
                if(clanDoc.leaderId == interaction.user.id) {
                const key = inviteUserToClan(clanDoc.clanId, user.id)
                const embed = new InfoEmbed(`Clan Invitation`, "You have been invited to **" + clanDoc.name + "**. Below is your invitation key. You can join the clan via the `/clan join` command and inputting this key.").addFields({name: 'Invitation Key', value: `||${key}||`})
                user.send({embeds: [embed]})
                const embed2 = new SuccessEmbed(`Invite Sent`, `You have successfully invited ${user.tag} to your clan. Cancel this invite anytime by the ` + "`/clan cancelinvite`" + ' command and entering the user.')
                interaction.editReply({embeds: [embed2]})
                return
            } else {
                const embed = new ErrorEmbed(`Not Owner`, `Only the owner of this clan can invite any new members.`)
                interaction.editReply({embeds: [embed]})
                return
            }
        }
    } else if (sub == 'join') {
        await interaction.deferReply({ephemeral: true})
        const key = (interaction as ChatInputCommandInteraction).options.getString('key', true)
        const user = await fetchUser(interaction.user.id)
        if(user.clanId == '') {
            const keyValid = await useKey(key, interaction.user.id)
            if(keyValid.used) {
                addUserToClan(interaction.user.id, keyValid.clanId)
                const embed = new SuccessEmbed(`Clan Joined`, `You have successfully joined the clan. You have access to all their channels. Enjoy.`)
                return interaction.editReply({embeds: [embed]})
            } else {
                const embed = new ErrorEmbed(`Invalid Key`, `This key doesn't exist in our system. This can be due to you not being the original reciever, it being expired, or just it being a fake key.`)
                return interaction.editReply({embeds: [embed]})
            }
        } else {
            const embed = new ErrorEmbed(`Already in Clan`, "You're already part of a clan. Please leave that clan before joining another one. You may use the `/clan leave` command.")
            interaction.editReply({embeds: [embed]})
            return
        }
    } else if (sub == 'leave') {
        await interaction.deferReply({ephemeral: true})
        const user = await fetchUser(interaction.user.id)
        if(user.clanId == '') {
            const embed = new ErrorEmbed(`Not in a Clan`, "You can't leave a clan you aren't a part of!")
            interaction.editReply({embeds: [embed]})
            return
        } else {
            const clan = await fetchClan(user.clanId)
            if(clan) {
                if(clan.leaderId == user.userId) {
                    const embed = new ErrorEmbed(`Abandon Clan`, `You cannot leave this clan as you are the leader. Please use the ` + "`/clan abandon`" + ` command instead to delete the clan.`)
                    return interaction.editReply({embeds: [embed]})
                } else {
                    removeUserFromClan(interaction.user.id, user.clanId)
                }
            }
            const embed = new SuccessEmbed(`Clan Left`, `You have successfully left the clan. You no longer have access to all their channels.`)
            return interaction.editReply({embeds: [embed]})
        }
    } else if (sub == 'manage') {
        await interaction.deferReply({ephemeral: true})
        const userOpt = (interaction as ChatInputCommandInteraction).options.getUser('user', true)
        const typeOpt = (interaction as ChatInputCommandInteraction).options.getString('type', true)
        const userToAdd = await fetchUser(userOpt.id)
        const user = await fetchUser(interaction.user.id)
        if(user) {
            const clan = await fetchClan(user.clanId)
            if(clan) {
                if(clan.leaderId == interaction.user.id) {
                    if(userToAdd.userId == clan.leaderId) {
                        const embed = new SuccessEmbed(`Unable to change Status`, `You cannot change your own status. You must abandon your clan if you wish to do so.`)
                        return interaction.editReply({embeds: [embed]})
                    } else {
                        if(userToAdd.clanId == clan.clanId) {
                            switch(typeOpt) {
                                case 'member':
                                    const index = clan.Users.findIndex(item => item.user === userToAdd.userId)
                                    if(clan.Users[index].permissionLevel == 0) {
                                        const embed = new ErrorEmbed(`Already a Member`, `This user is already a member.`)
                                        interaction.editReply({embeds: [embed]})
                                        return
                                    } else {
                                        handlePermissionChange('member', userToAdd.userId, clan.clanId)
                                        const embed = new SuccessEmbed(`Successfully changed Status`, `This user is now a Member of your Clan.`)
                                        interaction.editReply({embeds: [embed]})
                                        return
                                    }
                                case 'coleader':
                                    const index2 = clan.Users.findIndex(item => item.user === userToAdd.userId)
                                    if(clan.Users[index2].permissionLevel == 1) {
                                        const embed = new ErrorEmbed(`Already a Co-Leader`, `This user is already a Co-Leader.`)
                                        interaction.editReply({embeds: [embed]})
                                        return
                                    } else {
                                        handlePermissionChange('coleader', userToAdd.userId, clan.clanId)
                                        const embed = new SuccessEmbed(`Successfully changed Status`, `This user is now a Co-Leader of your Clan.`)
                                        interaction.editReply({embeds: [embed]})
                                        return
                                    }
                            }
                        } else {
                            const embed = new ErrorEmbed(`Not in your Clan`, `This user is not in your clan! You cannot modify their permissions.`)
                            interaction.editReply({embeds: [embed]})
                            return
                        }
                    }
                } else {
                    const embed = new ErrorEmbed(`Not Owner`, `Only the owner of this clan can manage the clan.`)
                    interaction.editReply({embeds: [embed]})
                    return
                }
            } else {
                const embed = new ErrorEmbed(`No clan found`, `You have not joined any clan! Please join one in order to deposit ice cubes to the clan.`)
                interaction.editReply({embeds: [embed]})
                return
            }
        }
    } else if (sub == 'abandon') {
        await interaction.deferReply({ephemeral: true})
        const user = await fetchUser(interaction.user.id)
        const clan = await fetchClan(user.clanId)
        if(clan) {
            if(clan.leaderId == interaction.user.id) {
                deleteClan(clan.clanId)
                const embed = new SuccessEmbed(`Deleted Clan`, `Sad to see you go.`)
                interaction.editReply({embeds: [embed]})
                return
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
    } else if (sub == 'upgrade') {
        await interaction.deferReply({ephemeral: true})
        const user = await fetchUser(interaction.user.id)
        const clan = await fetchClan(user.clanId)
        if(clan) {
            const index = clan.Users.findIndex(item => item.user === interaction.user.id)
            if(clan.Users[index].permissionLevel == 1 || clan.Users[index].permissionLevel == 3) {
                const embed = new InfoEmbed(`Clan Upgrade Shop`, `It costs ${getClanUpgradeAmount(clan.maxUser)}x ${emojis.ice_cube} to upgrade 5 player spaces`).addFields({name: 'Clan Balance', value: `${clan.balance}x ${emojis.ice_cube}`}, {name: 'Clan Maximum Users', value: `${clan.maxUser} Maximum`})
                const upgradeBtn = new ButtonBuilder().setCustomId('button_clan_upgrade').setEmoji(emojis.ice_cube).setLabel('Upgrade').setStyle(ButtonStyle.Primary)
                const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(upgradeBtn)

                interaction.editReply({embeds: [embed], components: [actionRow]})
                return
            } else {
                const embed = new ErrorEmbed(`Not Authorized`, `Only the Leader or Co-Leader of this clan can upgrade the clan.`)
                interaction.editReply({embeds: [embed]})
                return
            }
        } else {
            const embed = new ErrorEmbed(`No clan found`, `You have not joined any clan! Please join one in order to deposit ice cubes to the clan.`)
            interaction.editReply({embeds: [embed]})
            return
        }
    }
    return
}