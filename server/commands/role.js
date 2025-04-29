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
        const subcommand = interaction.options.getSubcommand();
        const interactionUser = interaction.options.getUser('usuario');
        const interactionRole = interaction.options.getRole('cargo');

        if (!interactionUser || !interactionRole) {
            return interaction.reply({ content: "❌ Usuário ou cargo inválido.", ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(interactionUser.id).catch(() => null);
        const role = await interaction.guild.roles.fetch(interactionRole.id).catch(() => null);

        if (!member || !role) {
            return interaction.reply({ content: "❌ Usuário ou cargo inválido.", ephemeral: true });
        }

        // Verificações padrões do Discord

        // Verifica se o bot tem permissão para gerenciar cargos
        const botMember = await interaction.guild.members.fetch(client.user.id);
        if (!botMember.permissions.has("ManageRoles")) {
            return interaction.reply({ content: "❌ Não tenho permissão para gerenciar cargos (`ManageRoles`).", ephemeral: true });
        }

        // Verifica se o cargo que o bot vai adicionar/remover está abaixo do cargo mais alto dele
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({ content: "❌ Não consigo gerenciar esse cargo porque ele está acima ou no mesmo nível do meu cargo mais alto.", ephemeral: true });
        }

        if (interaction.member.roles.highest.position <= role.position && interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: "❌ Você não pode gerenciar um cargo que é igual ou mais alto que o seu.", ephemeral: true });
        }

        // Obter maior cargo permitido do executor (mod/admin/god)
        const modRoleId = client.z.config.DiscordModRoleId;
        const adminRoleId = client.z.config.DiscordAdminRoleId;
        const godRoleId = client.z.config.DiscordGodRoleId;

        const executorRoles = interaction.member.roles.cache;
        let permissaoLimite = null;

        if (executorRoles.has(godRoleId)) {
            permissaoLimite = interaction.guild.roles.cache.get(godRoleId);
        } else if (executorRoles.has(adminRoleId)) {
            permissaoLimite = interaction.guild.roles.cache.get(adminRoleId);
        } else if (executorRoles.has(modRoleId)) {
            permissaoLimite = interaction.guild.roles.cache.get(modRoleId);
        }

        if (!permissaoLimite) {
            return interaction.reply({ content: "❌ Você não tem permissão suficiente para usar este comando.", ephemeral: true });
        }

        if (role.position >= permissaoLimite.position) {
            return interaction.reply({ content: `❌ Você só pode gerenciar cargos abaixo de **${permissaoLimite.name}**.`, ephemeral: true });
        }

        // Executar ação
        if (subcommand === "add") {
            if (member.roles.cache.has(role.id)) {
                return interaction.reply({ content: "ℹ️ O usuário já possui esse cargo.", ephemeral: true });
            }

            await member.roles.add(role).catch(error => {
                console.error("Erro ao adicionar cargo:", error);
                return interaction.reply({ content: "❌ Erro ao tentar adicionar o cargo. Verifique minhas permissões.", ephemeral: true });
            });

            return interaction.reply({ content: `✅ Cargo **${role.name}** adicionado para **${member.user.tag}**.`, ephemeral: true });

        } else if (subcommand === "remove") {
            if (!member.roles.cache.has(role.id)) {
                return interaction.reply({ content: "ℹ️ O usuário não possui esse cargo.", ephemeral: true });
            }

            await member.roles.remove(role).catch(error => {
                console.error("Erro ao remover cargo:", error);
                return interaction.reply({ content: "❌ Erro ao tentar remover o cargo. Verifique minhas permissões.", ephemeral: true });
            });

            return interaction.reply({ content: `✅ Cargo **${role.name}** removido de **${member.user.tag}**.`, ephemeral: true });
        }
    },
};
