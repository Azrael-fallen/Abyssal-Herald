import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('training')
    .setDescription('Display The Divine Abyss training message'),

  async execute(interaction) {
    const embed = createEmbed({
      title: '⚔️ The Divine Abyss Training',
      description:
        '**Training has begun.**\n\n' +
        'Stand ready, stay disciplined, and sharpen yourself beyond weakness.\n\n' +
        '**Protocol:**\n' +
        '• Listen to your instructor.\n' +
        '• Respect your fellow members.\n' +
        '• Stay focused during training.\n' +
        '• Improve with purpose.\n\n' +
        '**From Heaven’s Light, We Rule the Abyss.**',
      color: 'primary',
      footer: {
        text: 'The Divine Abyss • Training Protocol'
      }
    });

    await InteractionHelper.safeReply(interaction, {
      embeds: [embed]
    });

    logger.info('Training command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId
    });
  }
};
