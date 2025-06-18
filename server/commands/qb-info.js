module.exports = {
    name: "info",
    description: "Exibe informações dos personagens de um usuário",
    role: "mod",

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

        const characters = await global.exports.oxmysql.query_async(`
            SELECT
                *
            FROM players
            JOIN users ON users.userId = players.userId
            WHERE users.discord = ?
        `, [`discord:${user.id}`]);

        if (!characters || characters.length === 0) {
            return interaction.reply({
                content: `❌ Nenhum personagem encontrado para: ${user.toString()}`,
            });
        }

        const embeds = [];
        for (const char of characters) {
            let playerData = char;
            let charinfo = JSON.parse(char.charinfo || '{}');
            let money = JSON.parse(char.money || '{}');
            let job = JSON.parse(char.job || '{}');
            let gang = JSON.parse(char.gang || '{}');

            const playerId = await client.utils.getPlayerFromDiscordId(user.id);
            const player = playerId ? client.QBCore.Functions.GetPlayer(parseInt(playerId)) : null;
            const isOnline = player?.PlayerData.citizenid == char.citizenid;

            const charName = `${charinfo.firstname} ${charinfo.lastname}`;
            const embed = {
                title: `[${playerId}] ${charName} ${isOnline ? "(🟢 Online)" : "(🔴 Offline)"}`,
                fields: [
                    { name: "CID", value: playerData.citizenid || "(vazio)", inline: true },
                    { name: "Telefone", value: charinfo.phone || "(vazio)", inline: true },
                    { name: "Nasc.", value: charinfo.birthdate || "(vazio)", inline: true },
                    { name: "Sexo", value: String(charinfo.gender) || "(vazio)", inline: true },
                    { name: "Nacionalidade", value: charinfo.nationality || "(vazio)", inline: true },
                    { name: "Trabalho", value: `${job.label} (${job.grade.name})`, inline: true },
                    { name: "Gangue", value: `${gang.label} (${gang.grade.name})`, inline: true },
                    { name: "Dinheiro", value: `$${money.cash}`, inline: true },
                    { name: "Banco", value: `$${money.bank}`, inline: true },
                    // Adicione mais campos conforme necessário
                ],
                color: 0x3498db,
            };

            embeds.push(embed);
        }

        await interaction.reply({ embeds, ephemeral: false });
    },
};
