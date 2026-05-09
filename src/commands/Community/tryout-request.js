import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tryout-request')
    .setDescription('Request a tryout for The Divine Abyss')
    .addStringOption(option =>
      option
        .setName('notes')
        .setDescription('Optional notes for staff')
        .setRequired(false)
    ),

  async execute(interaction) {
    const notes = interaction.options.getString('notes') || 'No notes provided.';

    const embed = createEmbed({
      title: '🕯️ Divine Abyss Tryout Request',
      description:
        'A member has requested a tryout for **The Divine Abyss**.',
      color: 'primary',
      fields: [
        {
          name: 'Requesting Member',
          value: `${interaction.user}`,
          inline: true
        },
        {
          name: 'Status',
          value: 'Pending staff review',
          inline: true
        },
        {
          name: 'Notes',
          value: notes,
          inline: false
        }
      ],
      footer: {
        text: 'The Divine Abyss • Tryout Request'
      }
    });

    await InteractionHelper.safeReply(interaction, {
      embeds: [embed],
      allowedMentions: {
        parse: ['users']
      }
    });

    logger.info('Tryout request command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
  }
};
