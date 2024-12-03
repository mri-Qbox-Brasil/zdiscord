let nameChanger;
class NameChanger {
    constructor(z) {
        this.z = z;
        this.enabled = z.config.NameChanger.Enabled;
        this.showRPNames = z.config.NameChanger.ShowRPNames;
        this.completeName = z.config.NameChanger.CompleteName;
        this.showCitizenID = z.config.NameChanger.ShowCitizenID;
        nameChanger = this;
        console.log(`${this.constructor.name} Enabled: ${this.enabled}`);
    }

    /**
     * Altera o nickname de um jogador no Discord.
     * @param {number} player - O ID do jogador no servidor.
     * @param {string|null} newNickname - O novo nickname ou null para resetar.
     */
    async updatePlayerNickname(player, newNickname) {
        try {
            const discordID = this.z.utils.getPlayerDiscordId(player);
            if (!discordID) {
                console.warn(`Discord ID não encontrado para o jogador ${player}`);
                return;
            }

            const guildId = this.z.config.DiscordGuildId;
            const guild = await this.z.bot.guilds.fetch(guildId);
            const member = await guild.members.fetch(discordID);

            // Atualiza o nickname no Discord
            await member.setNickname(newNickname);
            console.log(`Nickname alterado para ${newNickname || "original"} com sucesso!`);
        } catch (error) {
            console.error(`Erro ao alterar o nickname do jogador ${player}:`, error);
        }
    }

    /**
     * Define o nickname de um jogador no formato "[ID] Nome".
     * @param {number} player - O ID do jogador no servidor.
     */
    async setPlayerNickname(player, playerData) {
        console.log(`Definindo nickname para jogador ${player}`);
        const newNickname = `[${player}] ${(this.showRPNames ? await this.getPlayerRPName(player, playerData) : await this.getPlayerDisplayName(player))}`;
        console.log(`Nickname de ${player} será definido para ${newNickname}`);
        this.updatePlayerNickname(player, newNickname).then(() => console.log(`Nickname de ${player} definido com sucesso!`));
    }

    /**
     * Reseta o nickname do jogador no Discord.
     * @param {number} player - O ID do jogador no servidor.
     */
    async resetPlayerNickname(player) {
        console.log(`Resetando nickname para jogador ${player}`);
        this.updatePlayerNickname(player, null).then(() => console.log(`Nickname de ${player} resetado com sucesso!`));
    }

    /**
     * Retorna o nome exibido do jogador.
     * @param {number} player - O ID do jogador no servidor.
     * @returns {Promise<string>} Nome do jogador.
     */
    async getPlayerDisplayName(player) {
        try {
            const discordID = this.z.utils.getPlayerDiscordId(player);
            if (!discordID) return `Jogador ${player}`;

            const guildId = this.z.config.DiscordGuildId;
            const guild = await this.z.bot.guilds.fetch(guildId);
            const member = await guild.members.fetch(discordID);

            const newNickname = member.nickname || member.user.global_name || member.user.username;
            console.log(`Nome do jogador ${player}: ${newNickname}`);
            return newNickname;
        } catch (error) {
            console.error(`Erro ao obter nome do jogador ${player}:`, error);
            return `Jogador ${player}`;
        }
    }

    /**
     * Retorna o nome do char do jogador.
     * @param {number} player - O ID do jogador no servidor.
     * @returns {Promise<string>} Nome do char do jogador.
     */
    async getPlayerRPName(player, playerData = null) {
        try {
            if (!playerData) {
                console.error(`Player data not found for player ${player}`);
                return `Jogador ${player}`;
            }
            let newNickname;
            if (this.showCitizenID)
                newNickname = playerData.citizenid;
            else {
                newNickname = playerData.charinfo.firstname;
                if (this.completeName)
                    newNickname += " " + playerData.charinfo.lastname;
            }
            console.log(`Nome do char do jogador ${player}: ${newNickname}`);
            return newNickname
        } catch (error) {
            console.error(`Erro ao obter nome do char do jogador ${player}:`, error);
            return `Jogador ${player}`;
        }
    }
}

// Eventos do servidor
onNet('QBCore:Server:OnPlayerLoaded', async () => {
    if (!nameChanger.enabled) return;
    const player = global.source;
    const coreObj = global.exports['qbx_core'];
    if (!coreObj) {
        console.error(`core module not found`);
        return;
    }
    let playerEntity = coreObj.GetPlayer(player);
    if (!playerEntity) {
        console.error(`Player entity not found for player ${player}`);
        return;
    }
    nameChanger.setPlayerNickname(player, playerEntity.PlayerData);
});

onNet('QBCore:Server:OnPlayerUnload', async () => {
    if (!nameChanger.enabled) return;
    const player = global.source;
    nameChanger.resetPlayerNickname(player);
});

on('playerDropped', async () => {
    if (!nameChanger.enabled) return;
    const player = global.source;
    nameChanger.resetPlayerNickname(player);
});

module.exports = NameChanger;
