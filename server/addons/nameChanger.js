let nameChanger;
class NameChanger {
    constructor(z) {
        this.z = z;
        this.enabled = z.config.EnableNameChanger;
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
    async setPlayerNickname(player) {
        const newNickname = `[${player}] ${await this.getPlayerDisplayName(player)}`;
        await this.updatePlayerNickname(player, newNickname);
    }

    /**
     * Reseta o nickname do jogador no Discord.
     * @param {number} player - O ID do jogador no servidor.
     */
    async resetPlayerNickname(player) {
        await this.updatePlayerNickname(player, null);
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

            return member.nickname || member.user.username;
        } catch (error) {
            console.warn(`Erro ao obter nome do jogador ${player}:`, error);
            return `Jogador ${player}`;
        }
    }
}

// Eventos do servidor
onNet('QBCore:Server:OnPlayerLoaded', async () => {
    const player = global.source;
    await nameChanger.setPlayerNickname(player);
});

onNet('QBCore:Server:OnPlayerUnload', async () => {
    const player = global.source;
    await nameChanger.resetPlayerNickname(player);
});

on('playerDropped', async () => {
    const player = global.source;
    await nameChanger.resetPlayerNickname(player);
});

module.exports = NameChanger;
