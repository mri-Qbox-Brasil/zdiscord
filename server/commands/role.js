module.exports = {
    name: "role",
    description: "Gerenciar cargos de usuários",
    role: "mod",

    options: [
        {
            type: "SUB_COMMAND",
            name: "add",
            description: "Adicionar cargo a um usuário",
            options: [
                {
                    name: "usuario",
                    description: "Usuário que receberá o cargo",
                    type: "USER",
                    required: true,
                },
                {
                    name: "cargo",
                    description: "Cargo a ser adicionado",
                    type: "ROLE",
                    required: true,
                },
            ],
        },
        {
            type: "SUB_COMMAND",
            name: "remove",
            description: "Remover cargo de um usuário",
            options: [
                {
                    name: "usuario",
                    description: "Usuário que perderá o cargo",
                    type: "USER",
                    required: true,
                },
                {
                    name: "cargo",
                    description: "Cargo a ser removido",
                    type: "ROLE",
                    required: true,
                },
            ],
        },
    ],

    run: async (client, interaction) => {
        const z = client.z;
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('usuario');
        const role = interaction.options.getRole('cargo');

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const fullRole = await interaction.guild.roles.fetch(role.id).catch(() => null);

        if (!member || !fullRole) {
            return interaction.reply({ content: "❌ Usuário ou cargo inválido.", ephemeral: true });
        }

        const botMember = await interaction.guild.members.fetch(client.user.id);
        const executor = interaction.member;

        // Verificações de permissão
        if (!botMember.permissions.has("ManageRoles")) {
            return interaction.reply({ content: "❌ Não tenho permissão para gerenciar cargos (`ManageRoles`).", ephemeral: true });
        }

        if (fullRole.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: "❌ Esse cargo está acima ou no mesmo nível do meu cargo mais alto.", ephemeral: true });
        }

        if (executor.roles.highest.position <= fullRole.position && interaction.guild.ownerId !== executor.id) {
            return interaction.reply({ content: "❌ Você não pode gerenciar um cargo que é igual ou mais alto que o seu.", ephemeral: true });
        }

        // Limite de permissão baseado na hierarquia do sistema
        const { DiscordModRoleId, DiscordAdminRoleId, DiscordGodRoleId } = z.config;
        const executorRoles = executor.roles.cache;
        let limiteCargo = null;

        if (executorRoles.has(DiscordGodRoleId)) {
            limiteCargo = interaction.guild.roles.cache.get(DiscordGodRoleId);
        } else if (executorRoles.has(DiscordAdminRoleId)) {
            limiteCargo = interaction.guild.roles.cache.get(DiscordAdminRoleId);
        } else if (executorRoles.has(DiscordModRoleId)) {
            limiteCargo = interaction.guild.roles.cache.get(DiscordModRoleId);
        }

        if (!limiteCargo) {
            return interaction.reply({ content: "❌ Você não tem permissão suficiente para usar este comando.", ephemeral: true });
        }

        if (role.position >= limiteCargo.position && interaction.guild.ownerId !== interaction.user.id) {
            z.utils.log.debug(`Cargo ${role.name} está acima do limite de permissão ${limiteCargo.name}`);
            z.utils.log.debug(`Owner ID: ${interaction.guild.ownerId}, Executor ID: ${interaction.user.id}`);
            return interaction.reply({ content: `❌ Você só pode gerenciar cargos abaixo de **${limiteCargo.name}**.`, ephemeral: true });
        }

        // Impedir atribuição dos cargos especiais por quem já os possui
        // Impedir que cargos especiais gerenciem entre si
        const cargosEspeciais = [DiscordModRoleId, DiscordAdminRoleId, DiscordGodRoleId];
        const isExecutorEspecial = cargosEspeciais.some(id => executorRoles.has(id));
        const isAlvoEspecial = cargosEspeciais.includes(role.id);

        if (isExecutorEspecial && isAlvoEspecial && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({
                content: `❌ Você não pode atribuir ou remover cargos especiais como **${role.name}**.`,
                ephemeral: true
            });
        }


        // Ações
        const userTag = member.user.tag;
        const roleName = fullRole.name;

        const respondError = (msg, err) => {
            z.utils.log.error(`${subcommand.toUpperCase()} > ${msg}`, err);
            return interaction.reply({ content: `❌ ${msg}`, ephemeral: true });
        };

        try {
            if (subcommand === "add") {
                if (member.roles.cache.has(fullRole.id)) {
                    return interaction.reply({ content: "ℹ️ O usuário já possui esse cargo.", ephemeral: true });
                }

                await member.roles.add(fullRole);
                z.utils.log.info(`Cargo ${roleName} adicionado a ${userTag} por ${executor.user.tag}`);
                return interaction.reply({ content: `✅ Cargo **${roleName}** adicionado para **${userTag}**.`, ephemeral: true });
            }

            if (subcommand === "remove") {
                if (!member.roles.cache.has(fullRole.id)) {
                    return interaction.reply({ content: "ℹ️ O usuário não possui esse cargo.", ephemeral: true });
                }

                await member.roles.remove(fullRole);
                z.utils.log.info(`Cargo ${roleName} removido de ${userTag} por ${executor.user.tag}`);
                return interaction.reply({ content: `✅ Cargo **${roleName}** removido de **${userTag}**.`, ephemeral: true });
            }
        } catch (err) {
            return respondError("Erro ao tentar gerenciar o cargo. Verifique minhas permissões.", err);
        }
    },
};
