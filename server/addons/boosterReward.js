let boosterReward;

class BoosterReward {
  constructor(z) {
    this.z = z;
    this.enabled = z.config.BoosterReward.Enabled;
    this.BoosterRoleId = z.config.BoosterReward.BoosterRoleId;
    this.ExpiryRewardServerTrigger =
      z.config.BoosterReward.ExpiryRewardServerTrigger;
    this.RewardServerTrigger = z.config.BoosterReward.RewardServerTrigger;
    boosterReward = this;
    console.log(`${this.constructor.name} Enabled: ${this.enabled}`);
  }

  /**
   * Checa se o usuario tem o cargo de booster no server do discord e da recompensas baseadas nisto".
   * @param {number} player - O ID do jogador no servidor.
   * @param {object} playerData - Os dados do jogador.
   */
  async checkBoosterReward(player, playerData) {
    console.log(`Checando booster reward para ${player}`);
    const discordID = this.z.utils.getPlayerDiscordId(player);
    const roles = await boosterReward.getPlayerDiscordRoles(discordID);
    const citizenid = playerData.citizenid;
    const status = playerData.metadata.hasOwnProperty("boosterStatus")
      ? playerData.metadata.boosterStatus
      : false;

    if (status == "active") {
      if (roles.includes(this.BoosterRoleId)) {
        return;
      } else {
        TriggerEvent(ExpiryRewardServerTrigger, citizenid);
      }
    }

    if (roles.includes(this.BoosterRoleId)) {
      if (status) {
        const status = playerData.metadata.boosterStatus;
        if (status === "active") {
          return;
        } else if (status === "expired") {
          TriggerEvent(RewardServerTrigger, citizenid);
        }
      } else {
        TriggerEvent(RewardServerTrigger, citizenid);
      }
    }
  }

  /**
   * Retorna todas as roles do usuário no Discord.
   * @param {string} discordID - O ID do usuário no Discord.
   * @returns {Promise<Array<string>>} Array com os IDs das roles do usuário.
   */
  async getPlayerDiscordRoles(discordID) {
    try {
      if (!discordID) {
        console.warn("Discord ID não fornecido");
        return [];
      }

      const guildId = this.z.config.DiscordGuildId;
      const guild = await this.z.bot.guilds.fetch(guildId);
      const member = await guild.members.fetch(discordID);

      const roles = member.roles.cache.map((role) => role.id);

      return roles;
    } catch (error) {
      console.error(`Erro ao obter roles do usuário ${discordID}:`, error);
      return [];
    }
  }
}

// Eventos do servidor
onNet("QBCore:Server:OnPlayerLoaded", async () => {
  if (!boosterReward.enabled) return;
  const player = global.source;
  const coreObj = global.exports["qbx_core"];
  if (!coreObj) {
    console.error(`core module not found`);
    return;
  }
  let playerEntity = coreObj.GetPlayer(player);
  if (!playerEntity) {
    console.error(`Player entity not found for player ${player}`);
    return;
  }
  boosterReward.checkBoosterReward(player, playerEntity.PlayerData);
});

module.exports = BoosterReward;
