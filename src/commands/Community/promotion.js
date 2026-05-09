import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('promotion')
    .setDescription('Post a Divine Abyss promotion report')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('member')
        .setDescription('The member being promoted')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('old_rank')
        .setDescription('The member’s previous rank')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addStringOption(option =>
      option
        .setName('new_rank')
        .setDescription('The member’s new rank')
        .setRequired(true)
        .setMaxLength(100)
    )
    .addRoleOption(option =>
      option
        .setName('role_to_add')
        .setDescription('Optional role to give the promoted member')
        .setRequired(false)
    )
    .addRoleOption(option =>
      option
        .setName('role_to_remove')
        .setDescription('Optional old role to remove from the promoted member')
        .setRequired(false)
    )
    .addUserOption(option =>
      option
        .setName('approved_by')
        .setDescription('The staff member who approved the promotion')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the promotion')
        .setRequired(false)
        .setMaxLength(900)
    ),

  async execute(interaction) {
    const memberUser = interaction.options.getUser('member');
    const oldRank = interaction.options.getString('old_rank');
    const newRank = interaction.options.getString('new_rank');
    const roleToAdd = interaction.options.getRole('role_to_add');
    const roleToRemove = interaction.options.getRole('role_to_remove');
    const approvedBy = interaction.options.getUser('approved_by') || interaction.user;
    const reason = interaction.options.getString('reason') || 'No reason provided.';

    const targetMember = await interaction.guild.members.fetch(memberUser.id).catch(() => null);
    const botMember = await interaction.guild.members.fetchMe().catch(() => null);

    if (!targetMember || !botMember) {
      return InteractionHelper.safeReply(interaction, {
        content: 'I could not find the member or bot profile in this server.',
        ephemeral: true
      });
    }

    const roleUpdates = [];

    const canManageRole = role => {
      if (!role) return null;

      if (role.id === interaction.guild.id) {
        return 'Cannot manage the @everyone role.';
      }

      if (role.managed) {
        return `Cannot manage ${role} because it is controlled by an integration or bot.`;
      }

      if (role.position >= botMember.roles.highest.position) {
        return `Cannot manage ${role}. Move the Abyssal Herald bot role above it.`;
      }

      if (
        targetMember.id !== botMember.id &&
        targetMember.roles.highest.position >= botMember.roles.highest.position
      ) {
        return `Cannot update ${targetMember}. Their highest role is equal to or above the bot’s highest role.`;
      }

      return null;
    };

    if (roleToAdd) {
      const addError = canManageRole(roleToAdd);

      if (addError) {
        roleUpdates.push(`❌ Add ${roleToAdd}: ${addError}`);
      } else if (targetMember.roles.cache.has(roleToAdd.id)) {
        roleUpdates.push(`⚠️ Add ${roleToAdd}: Member already has this role.`);
      } else {
        await targetMember.roles.add(roleToAdd, `Promotion approved by ${interaction.user.tag}: ${reason}`);
        roleUpdates.push(`✅ Added ${roleToAdd}`);
      }
    }

    if (roleToRemove) {
      const removeError = canManageRole(roleToRemove);

      if (removeError) {
        roleUpdates.push(`❌ Remove ${roleToRemove}: ${removeError}`);
      } else if (!targetMember.roles.cache.has(roleToRemove.id)) {
        roleUpdates.push(`⚠️ Remove ${roleToRemove}: Member does not have this role.`);
      } else {
        await targetMember.roles.remove(roleToRemove, `Promotion approved by ${interaction.user.tag}: ${reason}`);
        roleUpdates.push(`✅ Removed ${roleToRemove}`);
      }
    }

    if (!roleToAdd && !roleToRemove) {
      roleUpdates.push('No automatic role changes requested.');
    }

    const embed = createEmbed({
      title: '⬆️ Divine Abyss Promotion',
      description: 'A member has ascended within **The Divine Abyss**.',
      color: 'primary',
      fields: [
        {
          name: 'Member',
          value: `${memberUser}`,
          inline: true
        },
        {
          name: 'Approved By',
          value: `${approvedBy}`,
          inline: true
        },
        {
          name: 'Previous Rank',
          value: oldRank,
          inline: true
        },
        {
          name: 'New Rank',
          value: newRank,
          inline: true
        },
        {
          name: 'Role Update',
          value: roleUpdates.join('\n'),
          inline: false
        },
        {
          name: 'Reason',
          value: reason,
          inline: false
        }
      ],
      footer: {
        text: 'The Divine Abyss • Promotion Protocol'
      }
    });

    await InteractionHelper.safeReply(interaction, {
      embeds: [embed],
      allowedMentions: {
        parse: ['users']
      }
    });

    logger.info('Promotion command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      promotedMemberId: memberUser.id,
      approvedById: approvedBy.id,
      oldRank,
      newRank,
      roleAddedId: roleToAdd?.id ?? null,
      roleRemovedId: roleToRemove?.id ?? null
    });
  }
};
