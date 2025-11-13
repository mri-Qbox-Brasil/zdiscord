# Convars do zdiscord

Este documento descreve cada opção presente no arquivo de configuração `zdiscord.cfg`(convars) e fornece um exemplo pronto para copiar e colar, substituindo os valores pelos seus.

> Atenção: mantenha o token do bot e IDs privados em segurança. Nunca compartilhe o token do bot em repositórios públicos. No exemplo abaixo o token foi substituído por um placeholder.

## Opções disponíveis

- discord_lang
  - Tipo: string
  - Descrição: Idioma usado pelas mensagens do recurso (ex.: "pt-br").
  - Exemplo: `set discord_lang "pt-br"`

- discord_server_name
  - Tipo: string
  - Descrição: Nome do servidor mostrado em notificações/embeds.
  - Exemplo: `set discord_server_name "MRI QBOX"`

- discord_invite
  - Tipo: string
  - Descrição: Link de convite do Discord (opcional).
  - Exemplo: `set discord_invite ""`

- discord_server_ip
  - Tipo: string
  - Descrição: IP do servidor (opcional).
  - Exemplo: `set discord_server_ip ""`

- discord_enable_bot
  - Tipo: "true" / "false"
  - Descrição: Habilita o bot do Discord.
  - Exemplo: `set discord_enable_bot "true"`

- discord_token
  - Tipo: string (token do bot)
  - Descrição: Token do bot Discord. Substitua pelo token do seu bot.
  - Segurança: nunca comite esse valor em público.
  - Exemplo: `set discord_token "<SEU_DISCORD_BOT_TOKEN_AQUI>"`

- discord_guild_id
  - Tipo: string (ID numérico)
  - Descrição: ID do servidor (guild) do Discord usado pelo recurso.
  - Exemplo: `set discord_guild_id "732417307925676103"`

- discord_enable_staff_chat
  - Tipo: "true" / "false"
  - Descrição: Habilita chat entre staff via Discord.
  - Exemplo: `set discord_enable_staff_chat "true"`

- discord_staff_channel_id
  - Tipo: string (ID do canal)
  - Descrição: Canal do Discord usado para chat de staff.
  - Exemplo: `set discord_staff_channel_id "732417307925676107"`

- discord_enable_whitelist
  - Tipo: "true" / "false"
  - Descrição: Habilita verificação de whitelist por roles do Discord.
  - Exemplo: `set discord_enable_whitelist "false"`

- discord_whitelist_roles
  - Tipo: string (IDs separados por vírgula)
  - Descrição: Lista de role IDs permitidas (quando whitelist ativada).
  - Exemplo: `# set discord_whitelist_roles "000000000000000000,000000000000000000"`

- discord_enable_commands
  - Tipo: "true" / "false"
  - Descrição: Habilita comandos via Discord.
  - Exemplo: `set discord_enable_commands "true"`

- discord_mod_role / discord_admin_role / discord_god_role
  - Tipo: string (ID do role)
  - Descrição: IDs das roles que têm permissões específicas (mod/admin/god).
  - Exemplo:
    - `set discord_mod_role "1368991102123901060"`
    - `set discord_admin_role "1368991050542354432"`
    - `set discord_god_role "1368990988588286194"`

- discord_enable_status
  - Tipo: "true" / "false"
  - Descrição: Mostra status do servidor (ex.: jogadores online) via bot.
  - Exemplo: `set discord_enable_status "true"`

- discord_enable_ace_perms
  - Tipo: "true" / "false"
  - Descrição: Integra permissões ACE (se aplicável).
  - Exemplo: `set discord_enable_ace_perms "false"`

- discord_save_screenshots
  - Tipo: "true" / "false"
  - Descrição: Salva screenshots enviadas pelo bot (se o recurso suportar).
  - Exemplo: `set discord_save_screenshots "false"`

- discord_enable_logging_webhooks
  - Tipo: "true" / "false"
  - Descrição: Usa webhooks para logs no Discord.
  - Exemplo: `set discord_enable_logging_webhooks "false"`

- discord_logging_name
  - Tipo: string
  - Descrição: Nome exibido nas mensagens de logging quando webhooks ativos.
  - Exemplo: `set discord_logging_name "ZDiscord"`

- discord_enable_name_changer
  - Tipo: "true" / "false"
  - Descrição: Permite alteração de nome (ex.: sincronizar nick com RP).
  - Exemplo: `set discord_enable_name_changer "true"`

- discord_show_rp_names
  - Tipo: "true" / "false"
  - Descrição: Mostra nomes de RP em mensagens.
  - Exemplo: `set discord_show_rp_names "true"`

- discord_complete_name
  - Tipo: "true" / "false"
  - Descrição: Usa nome completo ao mostrar nomes.
  - Exemplo: `set discord_complete_name "true"`

- discord_show_citizen_id
  - Tipo: "true" / "false"
  - Descrição: Exibe citizen ID (se aplicável).
  - Exemplo: `set discord_show_citizen_id "false"`

- discord_enable_booster_reward
  - Tipo: "true" / "false"
  - Descrição: Ativa recompensas para boosters do servidor.
  - Exemplo: `set discord_enable_booster_reward "false"`

- discord_booster_role_id / discord_booster_reward_trigger / discord_booster_expiry_trigger
  - Tipo: string
  - Descrição: Configurações relacionadas a recompensa de booster (IDs e triggers).
  - Exemplo:
    - `# set discord_booster_role_id "000000000000000000"`
    - `# set discord_booster_reward_trigger "discord:booster_reward"`
    - `# set discord_booster_expiry_trigger "discord:booster_expiry"`

- discord_enable_backup
  - Tipo: "true" / "false"
  - Descrição: Habilita backup automático das configurações/DB do recurso.
  - Exemplo: `set discord_enable_backup "true"`

- discord_backup_interval
  - Tipo: número (minutos)
  - Descrição: Intervalo entre backups em minutos (ex.: 1440 = 24h).
  - Exemplo: `set discord_backup_interval "1"`

- discord_backup_path
  - Tipo: string (caminho)
  - Descrição: Pasta onde os backups serão salvos.
  - Exemplo: `set discord_backup_path "backups/"`

- discord_backup_channel_id / discord_backup_guild_id
  - Tipo: string (IDs)
  - Descrição: Canal e guild para notificações/armazenamento de backup (se usado).
  - Exemplo:
    - `set discord_backup_channel_id "1210457748073091074"`
    - `set discord_backup_guild_id "1210457748073091072"`

## Exemplo pronto para copiar (substitua os placeholders)

Copie e cole no seu `zdiscord.cfg` e substitua os valores entre <> pelos seus dados reais.

```cfg
// Exemplo pronto — substitua os valores entre <> pelos seus dados
set discord_lang "pt-br"

set discord_server_name "MRI QBOX"
set discord_invite "<LINK_DE_CONVIDO_OPCIONAL>"
set discord_server_ip "<IP_DO_SERVIDOR_OPCIONAL>"

set discord_enable_bot "true"
set discord_token "<SEU_DISCORD_BOT_TOKEN_AQUI>"
set discord_guild_id "<ID_DA_GUILD_AQUI>"

set discord_enable_staff_chat "true"
set discord_staff_channel_id "<ID_CANAL_STAFF_AQUI>"

set discord_enable_whitelist "false"
# set discord_whitelist_roles "<ID_ROLE_1>, <ID_ROLE_2>"

set discord_enable_commands "true"
set discord_mod_role "<ID_ROLE_MOD>"
set discord_admin_role "<ID_ROLE_ADMIN>"
set discord_god_role "<ID_ROLE_GOD>"

set discord_enable_status "true"

set discord_enable_ace_perms "false"

set discord_save_screenshots "false"

set discord_enable_logging_webhooks "false"
set discord_logging_name "ZDiscord"

set discord_enable_name_changer "true"
set discord_show_rp_names "true"
set discord_complete_name "true"
set discord_show_citizen_id "false"

set discord_enable_booster_reward "false"
# set discord_booster_role_id "<ID_ROLE_BOOSTER>"
# set discord_booster_reward_trigger "discord:booster_reward"
# set discord_booster_expiry_trigger "discord:booster_expiry"

set discord_enable_backup "true"
set discord_backup_interval "1440"  # em minutos (1440 = 24 horas)
set discord_backup_path "backups/"
set discord_backup_channel_id "<ID_CANAL_BACKUP_AQUI>"
set discord_backup_guild_id "<ID_GUILD_BACKUP_AQUI>"
