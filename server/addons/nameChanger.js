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
                return false;
            }

            const guildId = this.z.config.DiscordGuildId;
            const guild = await this.z.bot.guilds.fetch(guildId).catch((err) => {
                this.z.utils.log.error(`Erro ao buscar guild (${guildId}) para o jogador ${player}:`, err?.stack || err);
                return null;
            });
            if (!guild) return false;

            const member = await guild.members.fetch(discordID).catch((err) => {
                this.z.utils.log.warn(`Membro Discord (${discordID}) não encontrado na guild para o jogador ${player}:`, err?.stack || err);
                return null;
            });
            if (!member) return false;

            // Normalizar e truncar nickname (Discord permite até 32 chars)
            let nicknameToSet = newNickname == null ? null : String(newNickname);
            if (nicknameToSet && nicknameToSet.length > 32) {
                const original = nicknameToSet;
                nicknameToSet = nicknameToSet.slice(0, 32);
                this.z.utils.log.warn(`Nickname para ${player} truncado de ${original.length} para 32 chars: "${nicknameToSet}"`);
            }

            // Obter membro do bot na guild
            const botId = this.z.bot.user && this.z.bot.user.id;
            let botMember = null;
            try {
                botMember = guild.members.cache.get(botId) || await guild.members.fetch(botId);
            } catch (err) {
                // ignore, será tratado abaixo
            }
            if (!botMember) {
                this.z.utils.log.error(`Bot não é membro da guild ${guildId}. Não é possível alterar nicknames.`);
                return false;
            }

            // Checar hierarquia de cargos: bot precisa ter cargo acima do membro alvo
            const botHighest = botMember.roles && botMember.roles.highest ? botMember.roles.highest.position : 0;
            const memberHighest = member.roles && member.roles.highest ? member.roles.highest.position : 0;
            if (botHighest <= memberHighest) {
                this.z.utils.log.error(`Não é possível alterar nickname de ${player}: papel do bot não é alto o suficiente (bot: ${botHighest} <= membro: ${memberHighest}).`);
                return false;
            }

            // Tentativa de checar permissão (tenta ambos formatos de string caso da versão da lib)
            let hasManageNickPerm = false;
            try {
                if (botMember.permissions && typeof botMember.permissions.has === "function")
                    hasManageNickPerm = botMember.permissions.has("ManageNicknames") || botMember.permissions.has("MANAGE_NICKNAMES");
            } catch (err) {
                // se falhar, apenas continue e deixe a tentativa de setNickname produzir erro mais detalhado
            }
            if (!hasManageNickPerm) {
                this.z.utils.log.error(`Bot parece não ter permissão de MANAGE_NICKNAMES na guild ${guildId}.`);
                return false;
            }

            // Tentar setar nickname e logar erro detalhado se falhar
            try {
                await member.setNickname(nicknameToSet);
                this.z.utils.log.info(`Nickname de ${player} alterado para ${nicknameToSet || "original"}`);
                return true;
            } catch (error) {
                this.z.utils.log.error(`Erro ao definir nickname no Discord para o jogador ${player}:`, error?.stack || error);
                return false;
            }
        } catch (error) {
            this.z.utils.log.error(`Erro ao alterar o nickname do jogador ${player}:`, error?.stack || error);
            return false;
        }
    }

    async setPlayerNickname(player, playerData) {
        try {
            this.z.utils.log.info(`Definindo nickname para jogador ${player}`);
            const newNickname = `[${player}] ${(this.showRPNames
                ? await this.getPlayerRPName(player, playerData)
                : await this.getPlayerDisplayName(player))}`;
            this.z.utils.log.info(`Nickname de ${player} será definido para ${newNickname}`);
            const success = await this.updatePlayerNickname(player, newNickname);
            if (success) {
                this.z.utils.log.info(`Nickname de ${player} definido com sucesso!`);
            } else {
                this.z.utils.log.warn(`Falha ao definir nickname de ${player}. Verifique logs anteriores para detalhes.`);
            }
        } catch (error) {
            this.z.utils.log.error(`Erro ao definir nickname do jogador ${player}:`, error?.stack || error);
        }
    }

    async resetPlayerNickname(player) {
        try {
            this.z.utils.log.info(`Resetando nickname para jogador ${player}`);
            const success = await this.updatePlayerNickname(player, null);
            if (success) {
                this.z.utils.log.info(`Nickname de ${player} resetado com sucesso!`);
            } else {
                this.z.utils.log.warn(`Falha ao resetar nickname de ${player}. Verifique logs anteriores para detalhes.`);
            }
        } catch (error) {
            this.z.utils.log.error(`Erro ao resetar nickname do jogador ${player}:`, error?.stack || error);
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
    let coreObj = global.exports['qb-core'];

    if (GetResourceState('qbx_core') == 'started') {
        coreObj = global.exports['qbx_core'];
    }

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

    let coreObj = global.exports['qb-core'];

    if (GetResourceState('qbx_core') == 'started') {
        coreObj = global.exports['qbx_core'];
    }

    if (!coreObj) {
        nameChanger.z.utils.log.error("core module not found");
        return;
    }

    const players = coreObj.GetQBPlayers();
    const total = Object.keys(players).length;

    nameChanger.z.utils.log.info(`Recurso iniciado. Verificando ${total} jogadores conectados.`);

    for (const [_, playerData] of Object.entries(players)) {
        const id = playerData.PlayerData.source;
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
