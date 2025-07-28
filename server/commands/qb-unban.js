module.exports = {
    name: "unban",
    description: "Remove o banimento de um usuário pelo Discord",
    role: "admin",

    options: [
        {
            name: "usuario",
            description: "Usuário do Discord",
            type: "USER",
            required: true,
        },
    ],

    run: async (client, interaction) => {
        const user = interaction.options.getUser("usuario");

        const bans = await global.exports.oxmysql.query_async(`
            SELECT id, name, reason, expire
            FROM bans
            WHERE discord = ?
            ORDER BY id DESC
            LIMIT 1
        `, [`discord:${user.id}`]);

        if (!bans || bans.length === 0) {
            return interaction.reply({
                content: `❌ Nenhum banimento encontrado para: ${user.tag}`,
                ephemeral: true,
            });
        }

        const ban = bans[0];

        await global.exports.oxmysql.query_async(`DELETE FROM bans WHERE id = ?`, [ban.id]);

        emit("qb-log:server:CreateLog", "bans", "Ban Removido", "green", `${user.tag} teve o ban removido por ${interaction.member.displayName}`, true);

        client.utils.log.info(`[${interaction.member.displayName}] removeu o ban de ${user.tag}`);

        return interaction.reply({
            content: `✅ Banimento de **${ban.name}** (${user.tag}) removido com sucesso.`,
            ephemeral: false,
        });
    },
};
