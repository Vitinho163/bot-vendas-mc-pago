const Discord = require("discord.js");
const fs = require('fs');

module.exports = {
  name: "delproduct",
  description: "Deleta uma produto criado",
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "nome",
      description: "Digite o nome do produto",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
      interaction.reply({ content: "Você não possui permissão para utilizar este comando.", ephemeral: true });
      return;
    }

    const nomeProduto = interaction.options.getString("nome");

    const produtosData = JSON.parse(fs.readFileSync('produtos.json', 'utf8'));

    if (!produtosData[nomeProduto]) {
      interaction.reply({ content: "Produto não encontrado.", ephemeral: true });
      return;
    }

    const produto = produtosData[nomeProduto];
    const channel = interaction.guild.channels.cache.get(produto.channel);
    const announcementId = produto.announcementId;

    if (!channel) {
      interaction.reply({ content: "Canal do anúncio não encontrado.", ephemeral: true });
      return;
    }

    try {
      const message = await channel.messages.fetch(announcementId);
      await message.delete();

      delete produtosData[nomeProduto];
      fs.writeFileSync('produtos.json', JSON.stringify(produtosData, null, 2));

      interaction.reply({ content: "Anúncio deletado com sucesso.", ephemeral: true });
    } catch (error) {
      console.error(error);
      interaction.reply({ content: "Ocorreu um erro ao deletar o anúncio.", ephemeral: true });
    }
  }
};
