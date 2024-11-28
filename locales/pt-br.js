/* pt-br - Brazilian Portuguese Translation by gfive
 Translation strings used by the bot
 Strings wrapped in { } will be auto-replaced with updated values
 Globals: {servername}, {invite}, (all from config) and {playercount} (current connected players)
*/
const locale = {
    // Includes {name} + Globals
    checkingWhitelist: "Olá {name}, estamos verificando o estado da sua whitelist...",
    discordNotOpen: "Seu Discord precisa estar aberto antes de iniciar o FiveM (reinicie ambos se o problema persistir).",
    fatalError: "Foi encontrado um erro ao verificar o estado da sua whitelist, por favor, tente novamente mais tarde ou entre em contato com o suporte no Discord se o problema continuar.",
    notInDiscordServer: "Você não está presente no Discord {servername}, por favor entre no servidor através deste link: {invite}",
    notWhitelisted: "Você não tem o cargo necessário no Discord {servername} para entrar no servidor. Tem certeza de que está na whitelist?",
    kickedWithoutReason: "Você foi expulso por um membro da Staff.",
    announcement: "ANÚNCIO",
    directMessage: "STAFF",
    staffchat: "STAFFCHAT",
};

module.exports = locale;
