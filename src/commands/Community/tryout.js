import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tryout')
    .setDescription('Post a Divine Abyss tryout request')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false)
    .addUserOption(option =>
      option
        .setName('host')
        .setDescription('Tryout host')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('members')
        .setDescription('Members requesting to try out')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('notes')
        .setDescription('Tryout notes')
        .setRequired(false)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser('host');
    const members = interaction.options.getString('members');
    const notes = interaction.options.getString('notes') || 'No notes provided.';

    const embed = createEmbed({
      title: '🕯️ Divine Abyss Tryout Request',
      description: 'A tryout request has been opened for The Divine Abyss.',
      color: 'primary',
      fields: [
        {
          name: 'Tryout Host',
          value: `${host}`,
          inline: true
        },
        {
          name: 'Members Requesting Tryout',
          value: members,
          inline: false
        },
        {
          name: 'Notes',
          value: notes,
          inline: false
        }
      ],
      footer: {
        text: 'The Divine Abyss • Tryout Protocol'
      }
    });

    await InteractionHelper.safeReply(interaction, {
      embeds: [embed],
      allowedMentions: {
        parse: ['users']
      }
    });

    logger.info('Tryout command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      hostId: host.id
    });
  }
};
