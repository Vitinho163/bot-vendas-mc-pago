const Discord = require("discord.js");
const fs = require('fs');

module.exports = {
  name: "venda", // Coloque o nome do comando
  description: "Anuncie seu produto para venda", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: "nome",
      description: "Digite o nome do produto",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "descricao",
      description: "Digite a descrição do seu produto",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "valor",
      description: "Insira o valor do produto.",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "imagem",
      description: "Coloque a url da imagem de seu produto",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "canal",
      description: "Mencione o canal que você deseja anunciar",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: true,
    },
    {
      name: "estoque",
      description: "Seu produto tem quantos estoques? PS: Pode deixar sem",
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
      interaction.reply({ content: `Você não possui permissão para utilizar este comando.`, ephemeral: true });
      return;
    }

    let name = interaction.options.getString("nome");
    let description = interaction.options.getString("descricao");
    let value = interaction.options.getString("valor");
    let stock = interaction.options.getString("estoque");
    let image = interaction.options.getString("imagem");
    let channel = interaction.options.getChannel("canal");

    let embed = new Discord.EmbedBuilder()
      .setTitle(name)
      .setDescription(description)
      .addFields(
        { name: "Valor", value: `${value}`, inline: true },
        { name: "Estoque", value: `${stock || "N/A"}`, inline: true }
      )
      .setImage("https://cdn.discordapp.com/attachments/1115315816913711135/1129553149435334756/BMR.png") // substitua pela imagem da sua loja
      .setThumbnail(image);

    let botao = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setCustomId("cargo_b" + name)
        .setLabel("🛒 Clique Aqui!")
        .setStyle(Discord.ButtonStyle.Secondary)
    );

  channel.send({ embeds: [embed], components: [botao] })
  .then((message) => {
    const announcementId = message.id;
    interaction.reply(`✅ Seu anúncio foi enviado em ${channel} com sucesso.`);
    // Armazene os dados do produto no arquivo JSON
    const produto = {
      name: name,
      description: description,
      value: value,
      stock: stock || "N/A",
      image: image,
      channel: channel.id,
      announcementId: announcementId,
    };
    const produtosData = JSON.parse(fs.readFileSync('produtos.json', 'utf8'));
    produtosData[name] = produto;
    fs.writeFileSync('produtos.json', JSON.stringify(produtosData, null, 2));
  })
    .catch((e) => {
      console.error(e);
      interaction.reply(`❌ Algo deu errado.`);
    });
 }
}
