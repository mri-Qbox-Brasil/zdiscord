let nameChanger;

class NameChanger {
    constructor(z) {
        this.z = z;
        if (!z.config.EnableDiscordBot) {
            this.enabled = false;
            return;
        }
        this.enabled = z.config.NameChanger.Enabled;
        this.showRPNames = z.config.NameChanger.ShowRPNames;
        this.completeName = z.config.NameChanger.CompleteName;
        this.showCitizenID = z.config.NameChanger.ShowCitizenID;
        nameChanger = this;

        z.utils.log.info(`${this.constructor.name} Enabled: ${this.enabled}`);
    }

    async updatePlayerNickname(player, newNickname) {
        try {
            const discordID = this.z.utils.getPlayerDiscordId(player);
            if (!discordID) {
                this.z.utils.log.warn(`Discord ID não encontrado para o jogador ${player}`);
                return;
            }

            const guildId = this.z.config.DiscordGuildId;
            const guild = await this.z.bot.guilds.fetch(guildId);
            const member = await guild.members.fetch(discordID);

            await member.setNickname(newNickname);
            this.z.utils.log.info(`Nickname de ${player} alterado para ${newNickname || "original"}`);
        } catch (error) {
            this.z.utils.log.error(`Erro ao alterar o nickname do jogador ${player}:`, error);
        }
    }

    async setPlayerNickname(player, playerData) {
        try {
            this.z.utils.log.info(`Definindo nickname para jogador ${player}`);
            const newNickname = `[${player}] ${(this.showRPNames
                ? await this.getPlayerRPName(player, playerData)
                : await this.getPlayerDisplayName(player))}`;
            this.z.utils.log.info(`Nickname de ${player} será definido para ${newNickname}`);
            await this.updatePlayerNickname(player, newNickname);
            this.z.utils.log.info(`Nickname de ${player} definido com sucesso!`);
        } catch (error) {
            this.z.utils.log.error(`Erro ao definir nickname do jogador ${player}:`, error);
        }
    }

    async resetPlayerNickname(player) {
        try {
            this.z.utils.log.info(`Resetando nickname para jogador ${player}`);
            await this.updatePlayerNickname(player, null);
            this.z.utils.log.info(`Nickname de ${player} resetado com sucesso!`);
        } catch (error) {
            this.z.utils.log.error(`Erro ao resetar nickname do jogador ${player}:`, error);
        }
    }

    async getPlayerDisplayName(player) {
        try {
            const discordID = this.z.utils.getPlayerDiscordId(player);
            if (!discordID) return `Jogador ${player}`;

            const guildId = this.z.config.DiscordGuildId;
            const guild = await this.z.bot.guilds.fetch(guildId);
            const member = await guild.members.fetch(discordID);

            const newNickname = member.nickname || member.user.global_name || member.user.username;
            this.z.utils.log.info(`Nome do jogador ${player}: ${newNickname}`);
            return newNickname;
        } catch (error) {
            this.z.utils.log.error(`Erro ao obter nome do jogador ${player}:`, error);
            return `Jogador ${player}`;
        }
    }

    async getPlayerRPName(player, playerData = null) {
        try {
            if (!playerData) {
                this.z.utils.log.error(`Player data não encontrado para o jogador ${player}`);
                return `Jogador ${player}`;
            }

            let newNickname;
            if (this.showCitizenID) {
                newNickname = playerData.citizenid;
            } else {
                newNickname = playerData.charinfo.firstname;
                if (this.completeName)
                    newNickname += " " + playerData.charinfo.lastname;
            }

            this.z.utils.log.info(`Nome do char do jogador ${player}: ${newNickname}`);
            return newNickname;
        } catch (error) {
            this.z.utils.log.error(`Erro ao obter nome do char do jogador ${player}:`, error);
            return `Jogador ${player}`;
        }
    }
}

// Eventos

onNet('QBCore:Server:OnPlayerLoaded', async () => {
    if (!nameChanger.enabled) return;

    const player = global.source;
    const coreObj = global.exports['qbx_core'];

    if (!coreObj) {
        nameChanger.z.utils.log.error(`core module not found`);
        return;
    }

    const playerEntity = coreObj.GetPlayer(player);
    if (!playerEntity) {
        nameChanger.z.utils.log.error(`Player entity não encontrada para o jogador ${player}`);
        return;
    }

    await nameChanger.setPlayerNickname(player, playerEntity.PlayerData);
});

onNet('QBCore:Server:OnPlayerUnload', async () => {
    if (!nameChanger.enabled) return;

    const player = global.source;
    await nameChanger.resetPlayerNickname(player);
});

on('playerDropped', async () => {
    if (!nameChanger.enabled) return;

    const player = global.source;
    await nameChanger.resetPlayerNickname(player);
});

on('onResourceStart', async (resName) => {
    if (resName !== GetCurrentResourceName()) return;
    if (!nameChanger.enabled) return;

    const coreObj = global.exports['qbx_core'];
    if (!coreObj) {
        nameChanger.z.utils.log.error("core module not found");
        return;
    }

    const players = coreObj.GetQBPlayers();
    const total = Object.keys(players).length;

    nameChanger.z.utils.log.info(`Recurso iniciado. Verificando ${total} jogadores conectados.`);

    for (const [id, playerData] of Object.entries(players)) {
        const player = parseInt(id);
        const playerEntity = coreObj.GetPlayer(player);

        if (!playerEntity) {
            nameChanger.z.utils.log.warn(`Entidade do jogador ${player} não encontrada.`);
            continue;
        }

        try {
            await nameChanger.setPlayerNickname(player, playerEntity.PlayerData);
        } catch (error) {
            nameChanger.z.utils.log.error(`Erro ao redefinir nickname do jogador ${player} no onResourceStart`, error);
        }
    }
});

module.exports = NameChanger;
