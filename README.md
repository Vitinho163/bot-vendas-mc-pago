# Bot de Vendas com integração ao Mercado Pago

Este é um bot desenvolvido em Node.js com a biblioteca Discord.js v14, que permite a realização de vendas em um servidor de MTA (Multi Theft Auto) no Discord, com integração ao Mercado Pago para processamento de pagamentos. O bot possui comandos em slashCommands para anunciar e gerenciar produtos, além de automatizar o processo de compra.

## Funcionalidades

O bot oferece as seguintes funcionalidades:

- Anunciar um produto para venda no servidor através do comando `/venda`.
- Excluir um produto anunciado através do comando `/delproduct`.
- Gerenciar o estoque de produtos com limite de compra.
- Automatizar o processo de compra, integrando com o Mercado Pago.

## Requisitos

- Node.js (versão recomendada: 14.x ou superior)
- NPM (Node Package Manager)

## Bibliotecas Utilizadas

- Discord.js v14: Biblioteca para interagir com a API do Discord na versão 14.
- fs: Biblioteca nativa do Node.js para manipulação de arquivos.
- qrcode: Biblioteca para gerar códigos QR.
- sdk mercado pago: Biblioteca do Mercado Pago para integração de pagamentos.

## Configuração

1. Clone o repositório do GitHub em seu diretório de preferência:
```
git clone https://github.com/seu-usuario/seu-repositorio.git
```

2. Navegue até o diretório do projeto:
```bash
cd seu-repositorio
```

3. Instale as dependências necessárias utilizando o NPM:
```bash
npm install
```

4. Renomeie o arquivo `config.example.json` para `config.json`.
```bash
mv config.example.json config.json
```

5. Abra o arquivo `config.json` e preencha os seguintes campos:

```json
{
  "token": "tokenBot", 
  "prefix": "!",
  "access_token": "AccessTokenMercadoPago"
}
```

- token: Token do seu bot do Discord. Você pode obter esse token no Painel de Desenvolvedor do Discord.
- prefix: Prefixo dos comandos do bot. (caso precise adicionar comandos em prefixo)
- access_token: Token de acesso do Mercado Pago. Você pode obter esse token no Painel de Desenvolvedor do Mercado Pago.

## Utilização

Após configurar corretamente o bot, você pode iniciar o bot executando o seguinte comando:

```bash
node .
```

Certifique-se de que o bot esteja online no servidor do Discord.

## Instruções de Uso

1. **Anunciando um produto para venda:**

```
/venda (nome do produto), (descrição), (valor), (imagem do produto), (canal a ser anunciado o produto), (quantidade de estoque do produto)
```

- ``nome do produto:`` Nome do produto que está sendo anunciado.
- ``descrição:`` Descrição detalhada do produto.
- ``valor:`` Valor do produto.
- ``imagem do produto:`` URL da imagem do produto.
- ``canal a ser anunciado o produto:`` Nome do canal no Discord onde o produto será anunciado.
- ``se o produto tem estoque ou não:`` Indica a quantidade de estoque do produto ou deixe vazio.


2. **Excluindo um produto anunciado:**

```
/delproduct (nome do produto)
```

- ``nome do produto:`` Nome do produto que será excluído.


3. **Comprando um produto:**
Quando um produto é anunciado e possui estoque, o usuário pode clicar no botão "Comprar". Em seguida, será solicitado ao usuário as seguintes informações:

- Qual seu nome na cidade?
- Qual seu RG na cidade?
- Disponibilidade para receber o produto

Após o usuário fornecer essas informações, o bot criará um canal com o usuário e enviará uma mensagem contendo um código QR e instruções de pagamento.

4. **Aprovação da compra:**

Quando uma compra é aprovada pelo Mercado Pago, o bot enviará uma mensagem em um canal específico para os Staffs/proprietários informando a compra. Além disso, o bot enviará uma mensagem para o usuário via DM informando que a compra foi aprovada e que o produto será entregue conforme a disponibilidade informada.

## Screenshots

Aqui estão algumas screenshots do bot em funcionamento:

![Anuncio enviado](https://imgur.com/Gba61r0.png)

![Informações da compra](https://imgur.com/J6x1JPw.png)

![Log Staff](https://imgur.com/I0cVvdK.png)

![DM User](https://imgur.com/C2S7jw5.png)

## Autor

O bot foi desenvolvido por [@Vitinho163](https://github.com/Vitinho163). Para entrar em contato, você pode me encontrar no Discord como @andersonrewstei.

## Documentação do Mercado Pago

Para mais informações sobre a integração com o Mercado Pago, consulte a documentação oficial em: https://www.mercadopago.com.br/developers/pt/docs