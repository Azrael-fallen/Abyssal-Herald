import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

const data = new SlashCommandBuilder()
  .setName('tryout')
  .setDescription('Post a Divine Abyss tryout request report')
  .addUserOption(option =>
    option
      .setName('host')
      .setDescription('The tryout host')
      .setRequired(true)
  );

for (let i = 1; i <= 24; i++) {
  data.addUserOption(option =>
    option
      .setName(`member_${i}`)
      .setDescription(`Member requesting tryout ${i}`)
      .setRequired(false)
  );
}

export default {
  data,

  async execute(interaction) {
    const host = interaction.options.getUser('host');

    const members = [];

    for (let i = 1; i <= 24; i++) {
      const user = interaction.options.getUser(`member_${i}`);

      if (user && !members.some(member => member.id === user.id)) {
        members.push(user);
      }
    }

    const memberList =
      members.length > 0
        ? members.map((user, index) => `**${index + 1}.** ${user}`).join('\n')
        : 'No members listed.';

    const embed = createEmbed({
      title: '🕯️ The Divine Abyss Tryout',
      description:
        '**A tryout request has been opened.**\n\n' +
        'Those who seek entry must stand before the Abyss and prove they are worthy.',
      color: 'primary',
      fields: [
        {
          name: 'Tryout Host',
          value: `${host}`,
          inline: true
        },
        {
          name: 'Members Requesting Tryout',
          value: memberList,
          inline: false
        },
        {
          name: 'Request Count',
          value: `${members.length}`,
          inline: true
        }
      ],
      footer: {
        text: 'The Divine Abyss • Tryout Protocol'
      }
    });

    await InteractionHelper.safeReply(interaction, {
      embeds: [embed]
    });

    logger.info('Tryout command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      hostId: host.id,
      requestCount: members.length
    });
  }
};
