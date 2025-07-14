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

            let license = null;
            let license2 = null;
            let discord = null;
            let fivem = null;
            let identifiers = [];
            if (isOnline) {
                identifiers = getPlayerIdentifiers(playerId);
            } else {
                let ids = await global.exports.oxmysql.query_async(`
                    SELECT * FROM users WHERE userId in (
                        SELECT userId FROM players WHERE citizenid = ?
                    )
                `, [char.citizenid]);
                if (ids && ids.length > 0) {
                    identifiers[0] = ids[0].discord;
                    identifiers[1] = ids[0].license;
                    identifiers[2] = ids[0].license2;
                    identifiers[3] = ids[0].fivem;
                }
            }

            for (const id of identifiers) {
                if (!id) continue;
                if (id.startsWith('license:')) license = id;
                if (id.startsWith('license2:')) license2 = id;
                if (id.startsWith('discord:')) discord = id;
                if (id.startsWith('fivem:')) fivem = id;
            }

            const charName = `${charinfo.firstname} ${charinfo.lastname}`;

            // Moedas (dinâmico)
            const moneyFields = Object.entries(money).map(([currency, amount]) => ({
                name: `💰 ${currency.charAt(0).toUpperCase() + currency.slice(1)}`,
                value: `$${amount}`,
                inline: true,
            }));


            const embed = {
                title: `${isOnline ? "[" + playerId + "]" : ""} ${charName} ${isOnline ? "(🟢 Online)" : "(🔴 Offline)"}`,
                fields: [
                    { name: "CID", value: playerData.citizenid || "(vazio)", inline: true },
                    { name: "Telefone", value: charinfo.phone || "(vazio)", inline: true },
                    { name: "Nasc.", value: charinfo.birthdate || "(vazio)", inline: true },
                    { name: "Sexo", value: String(charinfo.gender) || "(vazio)", inline: true },
                    { name: "Nacionalidade", value: charinfo.nationality || "(vazio)", inline: true },
                    { name: "Trabalho", value: `${job.label} (${job.grade.name})`, inline: true },
                    { name: "Gangue", value: `${gang.label} (${gang.grade.name})`, inline: true },
                    { name: "Vip", value: charinfo.vip || "Nenhum", inline: true },
                    ...moneyFields,
                    {
                        name: "Identificadores",
                        value: [
                            `\`\`License:\`\` ${license || "(vazio)"}`,
                            `\`\`License2:\`\` ${license2 || "(vazio)"}`,
                            `\`\`Discord:\`\` ${discord || "(vazio)"}`,
                            `\`\`Fivem:\`\` ${fivem || "(vazio)"}`,
                        ].join("\n"),
                        inline: false,
                    },
                ],
                color: 0x3498db,
            };

            embeds.push(embed);
        }

        await interaction.reply({ embeds, ephemeral: false });
    },
};
