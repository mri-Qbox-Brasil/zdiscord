const { MessageActionRow, MessageSelectMenu, MessageButton } = require("discord.js");

module.exports = {
    name: "pd",
    description: "Busca e apaga personagens de um usuário",
    role: "admin",

    options: [
        {
            name: "usuario",
            description: "Usuário que terá o personagem apagado",
            type: "USER",
            required: true,
        },
    ],

    run: async (client, interaction) => {
        const user = interaction.options.getUser('usuario');

        client.utils.log.debug(`User: ${user.id}`);
        const matched = await global.exports.oxmysql.query_async(`
            SELECT
                players.citizenid,
                players.charinfo,
                players.name
            FROM players
            JOIN users ON ${GetResourceState("qbx_core") == "started" ? "players.userId = users.userId" : "users.license = players.license OR users.license2 = players.license"}
            WHERE users.discord = ?
        `, [`discord:${user.id}`]);

        if (!matched || matched.length === 0) {
            return interaction.reply({
                content: `❌ Nenhum personagem encontrado para: ${user.toString()}`,
            });
        }

        // Usuário tem múltiplos personagens
        const options = matched.map((char) => {
            const charinfo = JSON.parse(char.charinfo || '{}');
            return {
                label: `${charinfo.firstname} ${charinfo.lastname} (${char.citizenid})`,
                value: char.citizenid,
            };
        });


        const select = new MessageSelectMenu()
            .setCustomId(`select_char_${interaction.id}`)
            .setPlaceholder("Selecione o personagem para apagar")
            .addOptions(options);

        const row = new MessageActionRow().addComponents(select);

        await interaction.reply({
            content: `🎭 Este usuário possui **${matched.length} personagens**. Escolha qual deseja apagar:`,
            components: [row],
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.customId === `select_char_${interaction.id}` && i.user.id === interaction.user.id,
            time: 20000,
            max: 1,
        });

        collector.on("collect", async (i) => {
            await i.deferUpdate();
            const selected = matched.find(m => m.citizenid === i.values[0]);
            selected.discord = user.id; // necessário para verificar online depois
            await showDeleteConfirmation(interaction, selected, client, user.id);
        });

        collector.on("end", async (collected) => {
            if (collected.size === 0) {
                await interaction.editReply({
                    content: "⏱️ Tempo esgotado. Nenhuma ação foi executada.",
                    components: [],
                });
            }
        });
    },
};

async function showDeleteConfirmation(interaction, char, client, id) {
    const playerId = await client.utils.getPlayerFromDiscordId(id);
    const player = playerId ? client.QBCore.Functions.GetPlayer(parseInt(playerId)) : null;
    client.utils.log.debug(`PlayerId: ${char.citizenid} - ${player?.PlayerData.citizenid} - ${player?.PlayerData.citizenid == char.citizenid}`);
    const isOnline = player?.PlayerData.citizenid == char.citizenid;

    const charinfo = JSON.parse(char.charinfo || '{}');
    const warningMessage = isOnline
        ? `⚠️ **O personagem está online!** Deseja apagar \`${charinfo.firstname} ${charinfo.lastname}\` (\`${char.citizenid}\`)?\n> Ele será **kickado** do servidor antes da exclusão.`
        : `⚠️ Tem certeza que deseja apagar o personagem \`${charinfo.firstname} ${charinfo.lastname}\` (\`${char.citizenid}\`)?`;

    const confirmBtn = new MessageButton()
        .setCustomId(`confirm_delete_${char.citizenid}`)
        .setLabel("✅ Confirmar Exclusão")
        .setStyle("DANGER");

    const cancelBtn = new MessageButton()
        .setCustomId(`cancel_delete_${char.citizenid}`)
        .setLabel("❌ Cancelar")
        .setStyle("SECONDARY");

    const row = new MessageActionRow().addComponents(confirmBtn, cancelBtn);

    await interaction.editReply({
        content: warningMessage,
        components: [row],
    });

    const collector = interaction.channel.createMessageComponentCollector({
        filter: i =>
            (i.customId === `confirm_delete_${char.citizenid}` || i.customId === `cancel_delete_${char.citizenid}`) &&
            i.user.id === interaction.user.id,
        time: 15000,
        max: 1,
    });

    collector.on("collect", async (i) => {
        await i.deferUpdate();

        if (i.customId === `cancel_delete_${char.citizenid}`) {
            await interaction.editReply({
                content: `❌ Ação cancelada. O personagem \`${char.name}\` não foi apagado.`,
                components: [],
            });
            return;
        }

        if (isOnline && playerId) {
            DropPlayer(playerId, "Seu personagem foi deletado por um administrador.");
            await client.utils.sleep(1000);
        }

        await global.exports.oxmysql.query_async("DELETE FROM players WHERE citizenid = ?", [char.citizenid]);
        await global.exports.oxmysql.query_async("DELETE FROM playerskins WHERE citizenid = ?", [char.citizenid]);
        await global.exports.oxmysql.query_async("DELETE FROM player_outfits WHERE citizenid = ?", [char.citizenid]);
        await global.exports.oxmysql.query_async("DELETE FROM player_vehicles WHERE citizenid = ?", [char.citizenid]);

        // global.exports['fm-logs'].createLog({
        //     LogType: "ZDiscord",
        //     Message: `${char.name} (${char.citizenid}) foi apagado por ${interaction.member.displayName}`,
        //     Level: "info", // padrão é info
        //     Resource: "zdiscord",
        //     Metadata: {
        //         character: char.name,
        //         citizenid: char.citizenid,
        //         deletedBy: interaction.member.displayName,
        //         online: isOnline
        //     }
        // }, {
        //     Screenshot: false // ou false, conforme desejado
        // });

        await interaction.editReply({
            content: `✅ Personagem \`${charinfo.firstname} ${charinfo.lastname}\` (\`${char.citizenid}\`) foi apagado com sucesso.${isOnline ? " (ele estava online e foi kickado antes da exclusão)" : ""}`,
            components: [],
        });

        client.utils.log.info(`[${interaction.member.displayName}] apagou ${charinfo.firstname} ${charinfo.lastname} (${char.citizenid})${isOnline ? " (kickado)" : ""}`);
    });

    collector.on("end", async (collected) => {
        if (collected.size === 0) {
            await interaction.editReply({
                content: "⏱️ Tempo esgotado. Nenhuma ação foi executada.",
                components: [],
            });
        }
    });
}

onNet('QBCore:Server:PlayerLoaded', async (player) => {
    const playerId = player.PlayerData.source;
    const identifiers = getPlayerIdentifiers(playerId);

    let license = null;
    let license2 = null;
    let discord = null;
    let fivem = null;

    for (const id of identifiers) {
        if (id.startsWith('license:')) license = id;
        if (id.startsWith('license2:')) license2 = id;
        if (id.startsWith('discord:')) discord = id;
        if (id.startsWith('fivem:')) fivem = id;
    }

    if (!license2) return; // license2 é obrigatório como chave principal

    if (await hasUser(license2)) {

        global.exports.oxmysql.update_async(
            "UPDATE `users` SET  discord = IFNULL(?, discord), license = IFNULL(?, license), license2 = IFNULL(?, license2), fivem = IFNULL(?, fivem) WHERE userId in(select userId from players where license = ?)"
        , [discord, license, license2, fivem, license2]);
    } else {
        global.exports.oxmysql.insert_async(
            "INSERT INTO `users` (discord, license, license2, fivem) VALUES (IFNULL(?, discord), IFNULL(?, license), IFNULL(?, license2), IFNULL(?, fivem))"
        , [discord, license, license2, fivem]);
    }
});

async function hasUser(license2) {
    return global.exports.oxmysql.query_async("SELECT userId FROM users WHERE license2 = ?", [license2])
        .then(rows => rows.length > 0);
}
