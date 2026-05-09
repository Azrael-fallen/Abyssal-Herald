import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('training')
    .setDescription('Post a Divine Abyss training report')
    .addUserOption(option =>
      option
        .setName('host')
        .setDescription('Training host')
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName('cohost')
        .setDescription('Training co-host')
        .setRequired(false)
    )
    .addStringOption(option =>
      option
        .setName('attendees')
        .setDescription('Members who attended training')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('notes')
        .setDescription('Training notes')
        .setRequired(false)
    ),

  async execute(interaction) {
    const host = interaction.options.getUser('host');
    const cohost = interaction.options.getUser('cohost');
    const attendees = interaction.options.getString('attendees');
    const notes = interaction.options.getString('notes') || 'No notes provided.';

    const embed = createEmbed({
      title: '⚔️ Divine Abyss Training Report',
      description: 'A training session has been completed under The Divine Abyss.',
      color: 'primary',
      fields: [
        {
          name: 'Host',
          value: `${host}`,
          inline: true
        },
        {
          name: 'Co-Host',
          value: cohost ? `${cohost}` : 'None',
          inline: true
        },
        {
          name: 'Members Attended',
          value: attendees,
          inline: false
        },
        {
          name: 'Notes',
          value: notes,
          inline: false
        }
      ],
      footer: {
        text: 'The Divine Abyss • Training Protocol'
      }
    });

    await InteractionHelper.safeReply(interaction, {
      embeds: [embed],
      allowedMentions: {
        parse: ['users']
      }
    });

    logger.info('Training command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      hostId: host.id,
      cohostId: cohost?.id ?? null
    });
  }
};
