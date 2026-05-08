import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { logger } from '../../utils/logger.js';

const data = new SlashCommandBuilder()
  .setName('training')
  .setDescription('Post a Divine Abyss training attendance report')
  .addUserOption(option =>
    option
      .setName('host')
      .setDescription('The host of the training')
      .setRequired(true)
  )
  .addUserOption(option =>
    option
      .setName('cohost')
      .setDescription('The co-host of the training')
      .setRequired(false)
  );

for (let i = 1; i <= 15; i++) {
  data.addUserOption(option =>
    option
      .setName(`attendee_${i}`)
      .setDescription(`Training attendee ${i}`)
      .setRequired(false)
  );
}

export default {
  data,

  async execute(interaction) {
    const host = interaction.options.getUser('host');
    const cohost = interaction.options.getUser('cohost');

    const attendees = [];

    for (let i = 1; i <= 15; i++) {
      const user = interaction.options.getUser(`attendee_${i}`);

      if (user && !attendees.some(attendee => attendee.id === user.id)) {
        attendees.push(user);
      }
    }

    const attendeeList =
      attendees.length > 0
        ? attendees.map((user, index) => `**${index + 1}.** ${user}`).join('\n')
        : 'No attendees listed.';

    const embed = createEmbed({
      title: '⚔️ The Divine Abyss Training',
      description:
        '**Training has been completed.**\n\n' +
        'Discipline was tested. Strength was sharpened. The Abyss remembers those who stood present.',
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
          value: attendeeList,
          inline: false
        },
        {
          name: 'Attendance Count',
          value: `${attendees.length}`,
          inline: true
        }
      ],
      footer: {
        text: 'The Divine Abyss • Training Protocol'
      }
    });

    await InteractionHelper.safeReply(interaction, {
      embeds: [embed]
    });

    logger.info('Training attendance command executed', {
      userId: interaction.user.id,
      guildId: interaction.guildId,
      hostId: host.id,
      cohostId: cohost?.id ?? null,
      attendeeCount: attendees.length
    });
  }
};
