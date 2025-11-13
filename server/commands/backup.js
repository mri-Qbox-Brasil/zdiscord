const fs = require("fs");
const path = require("path");
const mysqldump = require('mysqldump');

const formatDateForFilename = () => {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, "-"); // seguro para nomes de arquivos
};

async function createBackup(client, interaction = null) {
    const z = client.z;
    const BackupSettings = z.config.BackupSettings;

    const isManual = !!interaction;
    let autoDisabled = false;
    if (!BackupSettings?.Enabled) {
        if (!isManual) {
            return;
        }
        autoDisabled = true;
    }

    const timestamp = formatDateForFilename();
    const locale = (z?.config?.LanguageLocaleCode) || undefined;
    const displayDate = new Date().toLocaleString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
    const backupsFolder = BackupSettings?.Path && BackupSettings.Path.length > 0
        ? BackupSettings.Path
        : "./backups";
    const resolvedFolder = path.resolve(backupsFolder);
    const fileName = path.join(resolvedFolder, `backup_full_${timestamp}.sql`);
    const fileBase = "`" + path.basename(fileName) + "`";

    const intervalMinutes = Number(BackupSettings?.Interval) || 0;
    let nextRunUnix = null;
    if (intervalMinutes > 0 && !autoDisabled) {
        const intervalMs = intervalMinutes * 60 * 1000;
        const sched = client._backupScheduler;
        if (sched && sched.start && sched.intervalMs === intervalMs) {
            // calcula o próximo tick com base no start do agendador para não "resetar" quando executado manualmente
            const now = Date.now();
            const elapsed = Math.max(0, now - sched.start);
            const passed = Math.floor(elapsed / intervalMs);
            const nextTick = sched.start + (passed + 1) * intervalMs;
            nextRunUnix = Math.floor(nextTick / 1000);
        } else {
            nextRunUnix = null;
        }
    }

    await fs.promises.mkdir(resolvedFolder, { recursive: true });

    try {
        const mysqlConnection = GetConvar('mysql_connection_string', '');
        if (mysqlConnection && mysqlConnection.length > 0) {
            const regex = /^mysql:\/\/(?:(.+?):(.+?)@)?([^:/]+)(?::(\d+))?\/(.+?)(?:\?.*)?$/;
            const match = mysqlConnection.match(regex);
            if (match) {
                const [_, user, password, host, port, database] = match;
                await mysqldump({
                    connection: {
                        host: host,
                        port: port ? parseInt(port) : 3306,
                        user: user,
                        password: password,
                        database: database,
                    },
                    dumpToFile: fileName,
                });

                let scheduleInfo = "";
                if (isManual) {
                    if (autoDisabled) {
                        scheduleInfo = "Nota: backups automáticos estão desativados.";
                    } else if (intervalMinutes <= 0) {
                        scheduleInfo = "Nenhum backup automático agendado (intervalo desativado).";
                    } else if (nextRunUnix) {
                        scheduleInfo = `Próximo backup automático: <t:${nextRunUnix}:R>.`;
                    } else {
                        scheduleInfo = "Nenhum backup automático agendado.";
                    }
                } else {
                    scheduleInfo = nextRunUnix ? `Próximo backup automático: <t:${nextRunUnix}:R>.` : "";
                }
                try {
                    let guildId = BackupSettings.GuildId || z.config.DiscordGuildId;
                    const guild = await z.bot.guilds.fetch(guildId).catch((err) => {
                        z.utils.log.error(`Erro ao buscar guild (${guildId}):`, err?.stack || err);
                        return null;
                    });

                    const botId = z.bot.user && z.bot.user.id;
                    let botMember = null;
                    try {
                        botMember = guild.members.cache.get(botId) || await guild.members.fetch(botId);
                    } catch (err) {
                        // ignore, será tratado abaixo
                    }

                    if (!botMember) {
                        z.utils.log.error(`Bot não é membro da guild ${guildId}. Não é possível enviar backup.`);
                        return null;
                    }

                    if (!BackupSettings.ChannelId) {
                        z.utils.log.error(`Canal de backup não configurado. Não é possível enviar backup.`);
                        return null;
                    }

                    const channel = await guild.channels.fetch(BackupSettings.ChannelId).catch((err) => {
                        z.utils.log.error(`Erro ao buscar canal de backup (${BackupSettings.ChannelId}):`, err?.stack || err);
                        return null;
                    });

                    if (!channel) {
                        z.utils.log.error(`Canal de backup (${BackupSettings.ChannelId}) não encontrado. Não é possível enviar backup.`);
                        return null;
                    }

                    const channelMsg = `📦 Novo backup gerado — ${displayDate}\nArquivo: ${fileBase}` + (scheduleInfo ? `\n${scheduleInfo}` : "");
                    if (fs.existsSync(fileName)) {
                        await channel.send({
                            content: channelMsg,
                            files: [fileName]
                        });
                    }
                } catch (sendErr) {
                    console.error("Erro ao enviar backup para o canal:", sendErr);
                }

                if (interaction) {
                    const userMsg = `✅ Backup gerado com sucesso — ${displayDate}\nArquivo: ${fileBase}` + (scheduleInfo ? `\n${scheduleInfo}` : "");
                    return interaction.followUp({ content: userMsg, ephemeral: true });
                }
                return;
            }
        } else {
            if (interaction) {
                return interaction.followUp({ content: "❌ Erro ao gerar backup: Nenhuma conexão MySQL encontrada.", ephemeral: true });
            }
            return;
        }
    } catch (err) {
        console.error("Erro ao gerar backup:", err);
        if (interaction) {
            return interaction.followUp({ content: "❌ Erro ao gerar o backup: Verifique o log para mais detalhes.", ephemeral: true });
        }
    }
}

module.exports = {
    name: "backup",
    description: "Gerar backup da base de dados",
    role: "mod",

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        return createBackup(client, interaction);
    },

    init: (client) => {
        const setup = async () => {
            const z = client.z;
            const BackupSettings = z?.config?.BackupSettings;
            if (!BackupSettings || !BackupSettings.Enabled) return;

            const intervalMinutes = Number(BackupSettings.Interval) || 0;
            if (intervalMinutes > 0) {
                const intervalMs = intervalMinutes * 60 * 1000;
                if (!client._backupIntervals) client._backupIntervals = [];
                const start = Date.now();
                const id = setInterval(() => {
                    createBackup(client, null).catch(err => {
                        console.error("Erro no backup agendado:", err);
                    });
                }, intervalMs);
                client._backupIntervals.push(id);
                client._backupScheduler = { start, intervalMs, timerId: id };
            } else {
                console.info("Backups periódicos desativados (interval <= 0)");
            }
        };

        if (client.readyAt) {
            setup();
        } else {
            client.once('ready', setup);
        }
    }
};
