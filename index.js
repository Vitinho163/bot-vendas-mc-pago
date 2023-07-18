const Discord = require("discord.js");
const qr = require('qrcode');
const config = require("./config.json");
const fs = require('fs');
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// SDK do Mercado Pago
const mercadopago = require('mercadopago');

// credenciais
mercadopago.configure({
  access_token: config.access_token,
});

const client = new Discord.Client({
  intents: 32767,
  partials: [
    'CHANNEL',
    'MESSAGE',
    'USER',
    'GUILD_MEMBER',
    'REACTION'
  ]
});

module.exports = client;

client.on('interactionCreate', (interaction) => {
  if (interaction.type === Discord.InteractionType.ApplicationCommand) {
    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.reply(`Error`);
    interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);
    cmd.run(client, interaction);
  }
});

async function generateQRCode(text, user) {
  return new Promise((resolve, reject) => {
    qr.toFile(`qrcode${user.id}.png`, text, (err) => {
      if (err) {
        console.error("Erro ao gerar o QR Code:", err);
        reject(err);
      } else {
        resolve(`qrcode${user.id}.png`);
      }
    });
  });
}

async function checkPayment(paymentId, user, interaction, paymentCheckInterval, product, cityname, cityrg, availableTimes) {
  try {
    const response = await mercadopago.payment.get(paymentId);

    if (response.body.status === 'approved') {
      // Pagamento aprovado

      //apaga a imagem qrcode
      const qrCodePath = `qrcode${user.id}.png`;
      if (fs.existsSync(qrCodePath)) {
        fs.unlinkSync(qrCodePath);
      }

      // Envie uma mensagem no canal de confirmação
      const confirmationChannel = interaction.guild.channels.cache.find(channel => channel.name === 'ʟᴏɢs-compras'); // Substitua 'Nome do Canal' pelo nome do canal desejado

      const confirmationEmbed = new Discord.EmbedBuilder()
        .setTitle('Pagamento Confirmado')
        .setDescription(`O pagamento do usuário ${user.username} foi confirmado.
          Produto comprado: ${product.description}\nNome na cidade: ${cityname}\nRG na cidade: ${cityrg}\nDisponibilidade para receber: ${availableTimes}`)
        .setColor('#00FF00'); // Defina a cor da embed de confirmação

      await confirmationChannel.send({ embeds: [confirmationEmbed] });

      // Envie uma mensagem na DM do usuário que comprou informando a aprovação da compra
      const userDM = await user.createDM();
      const dmEmbed = new Discord.EmbedBuilder()
      .setTitle('Compra Aprovada')
      .setDescription(`Sua compra do produto ${product.description} foi aprovada. Obrigado por sua compra!
      Seu produto será entregue dentro da disponibilidade que você informou.`)
      .setColor('#00FF00'); // Defina a cor da embed da DM
      
      await userDM.send({ embeds: [dmEmbed] });
      clearInterval(paymentCheckInterval); // Limpar o intervalo de verificação

      // Atualizar o estoque do produto e remover se necessário
      if(product.stock != "N/A") {
        product.stock -= 1;
        convert = '"' + product.stock + '"'

        const produtosData = JSON.parse(fs.readFileSync('produtos.json', 'utf8'));
        produtosData[product.name].stock = product.stock;
        fs.writeFileSync('produtos.json', JSON.stringify(produtosData, null, 2));

          // Obtém a mensagem que contém a embed a ser alterada
          const message = await interaction.channel.messages.fetch(product.announcementId);

          // Modifica os campos da embed conforme necessário
          let embed = new Discord.EmbedBuilder()
          .setTitle(product.name)
          .setDescription(product.description)
          .addFields(
            { name: "Valor", value: `${product.value}`, inline: true },
            { name: "Estoque", value: `${product.stock || "N/A"}`, inline: true }
          )
          .setImage("https://cdn.discordapp.com/attachments/1115315816913711135/1129553149435334756/BMR.png")
          .setThumbnail(product.image);

          // Envia a mensagem atualizada com a embed modificada
          await message.edit({ embeds: [embed] });
  
        if (product.stock === 0) {
          const channel = interaction.guild.channels.cache.get(product.channel);
          const announcementId = product.announcementId;

          const message = await channel.messages.fetch(announcementId);
          await message.delete();

          const produtosData = JSON.parse(fs.readFileSync('produtos.json', 'utf8'));
          delete produtosData[product.name];
          fs.writeFileSync('produtos.json', JSON.stringify(produtosData, null, 2));
        }
      }

    } else if (response.body.status === 'cancelled') {
      // Pagamento cancelado
      console.log('Pagamento cancelado.');

      //apaga a imagem qrcode
      const qrCodePath = `qrcode${user.id}.png`;
      if (fs.existsSync(qrCodePath)) {
        fs.unlinkSync(qrCodePath);
      }

      clearInterval(paymentCheckInterval); // Limpar o intervalo de verificação
    }
  } catch (error) {
    console.log(error);
  }
}

function createPayment(user, product, value, interaction, cityname, cityrg, availableTimes ) {
  // Crie um objeto de pagamento
  let payment = {
    transaction_amount: value,
    payment_method_id: 'pix',
    description: product.description,
    payer: {
      email: 'comprador@teste.com',
    },
  };

  mercadopago.payment.create(payment)
    .then(async function (response) {

      let intervalId = setInterval(() => {
        checkPayment(response.body.id, user, interaction, intervalId, product, cityname, cityrg, availableTimes);
      }, 30000); // Verificar o status do pagamento a cada 30 segundos


      const qrCodeURL = await generateQRCode(response.body.point_of_interaction.transaction_data.qr_code, user);

      let embed = new Discord.EmbedBuilder()
        .setDescription(`${user}, efetue o do produto ${product.description} pagamento utilizando o QR Code Pix ou Pix Copia e Cola abaixo:`)
        .addFields(
          { name: "Pix Copia e Cola", value: "```" + response.body.point_of_interaction.transaction_data.qr_code + "```", inline: true },
        )
        .setImage(`attachment://qrcode${user.id}.png`);

      const qrcodeChannel = await interaction.guild.channels.create({
        name: 'Qr code ' + user,
        type: Discord.ChannelType.GuildText,
      });

      qrcodeChannel.send({ embeds: [embed], files: [{ attachment: qrCodeURL, name: `qrcode${user.id}.png` }] });

      setTimeout(() => {
        qrcodeChannel.delete();
        //apaga a imagem qrcode
        const qrCodePath = `qrcode${user.id}.png`;
        if (fs.existsSync(qrCodePath)) {
          fs.unlinkSync(qrCodePath);
        }

      }, 120000); // Remover o canal do QR Code após 2 minutos
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = createPayment;

client.on('ready', () => {
  console.log(`🔥 Estou online em ${client.user.username}!`);
});


//
client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("cargo_b")) {

      const productId = interaction.customId.substring(7);

      // Create the modal
      const modal = new ModalBuilder()
        .setCustomId(`purchaseModal${productId}`) // Adiciona o ID do produto ao ID do modal
        .setTitle("Informações para compra");

      // Create the text input components
      const cityNameInput = new TextInputBuilder()
        .setCustomId("cityNameInput")
        .setLabel("Qual seu nome na cidade?")
        .setStyle(TextInputStyle.Short);

      const rgInput = new TextInputBuilder()
        .setCustomId("rgInput")
        .setLabel("Qual seu RG na cidade?")
        .setStyle(TextInputStyle.Short);

      const availableTimesInput = new TextInputBuilder()
        .setCustomId("availableTimesInput")
        .setLabel("Disponibilidade para receber produto")
        .setStyle(TextInputStyle.Paragraph);

      const firstActionRow = new ActionRowBuilder().addComponents(cityNameInput);
      const secondActionRow = new ActionRowBuilder().addComponents(rgInput);
      const thirdActionRow = new ActionRowBuilder().addComponents(availableTimesInput);

      // Add inputs to the modal
      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

      // Show the modal to the user
      await interaction.showModal(modal);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("purchaseModal")) {
      const cityName = interaction.fields.getTextInputValue("cityNameInput");
      const rg = interaction.fields.getTextInputValue("rgInput");
      const availableTimes = interaction.fields.getTextInputValue("availableTimesInput");

      const productId = interaction.customId.substring(13); // Remove o prefixo "purchaseModal" para obter o ID do produto
      const produtosData = JSON.parse(fs.readFileSync('produtos.json', 'utf8'));
      const product = produtosData[productId];
      let user = interaction.user;

      console.log(`> createpayment` + String(product.description))
      createPayment(user,  product, Number(product.value), interaction, cityName, rg, availableTimes);
    }
  }
});


client.slashCommands = new Discord.Collection();
client.prefix_commands = new Discord.Collection();

["index.js", "prefix.js"].forEach((file) => {
  require(`./handler/${file}`)(client, config);
});

client.login(config.token);
