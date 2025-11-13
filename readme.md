# zdiscord (v7)

**Observação: zdiscord v7 e versões superiores REQUEREM artifacts do FiveM build 4890 ou mais recentes**<br>
zdiscord v5-6 REQUER artifacts 4800 ou mais recentes.<br>
Artifacts mais antigos exigirão o uso do [branch eris v4](https://github.com/zfbx/zdiscord/tree/eris).

[Instalação](#setup) | [Doar](#donate) | [FAQ](https://zfbx.github.io/zdiscord/faq) | [Suporte](#support) | [Docs](https://zfbx.github.io/zdiscord)

## Sobre

Um bot do Discord que roda no FiveM com propósito de whitelist, moderação e utilidades usando [discord.js](https://discord.js.org/). O objetivo deste recurso é ser fácil de configurar e expandir, oferecendo à sua equipe de administração um método simples de suporte e moderação de jogadores no jogo sem precisar abrir o FiveM. Este recurso também possui amplo suporte ao [QBCore](https://github.com/qbcore-framework) em muitas de suas funcionalidades, mas não é obrigatório.

## Funcionalidades

- Recurso standalone para FiveM (sem necessidade de hospedagem externa)
- Usa [Slash commands](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ) com ajuda/sugestões
- Ferramentas de moderação (kick, ban, inspect, etc)
- [Comandos](https://zfbx.github.io/zdiscord/commands) para [QBCore](https://github.com/qbcore-framework) incluídos!
- Fácil de expandir e customizar com [comandos](https://zfbx.github.io/zdiscord/commands#add-commands) modulares
- Pode ser configurado com [convars](convars.md)
- Sistema automático de concessão de permissões Ace
- [Exports úteis](https://zfbx.github.io/zdiscord/exports)
- Chat da equipe bidirecional
- E MUITO MAIS!

## Instalação

### Requisitos
- Artifacts do FiveM build 4890 ou superior
- [cfx-server-data](https://github.com/citizenfx/cfx-server-data) nos seus recursos (yarn (`[system]/[builders]/yarn/`) pelo menos)
- Opcional: [screenshot-basic](https://github.com/citizenfx/screenshot-basic) se você quiser que o comando /screenshot funcione

### Passos
1. Obtenha uma aplicação de bot se ainda não tiver uma [Guia Aqui](https://discordjs.guide/preparations/setting-up-a-bot-application.html)

2. **IMPORTANTE: Ative AMBOS os intents** na página do bot do passo 1 ([Exemplo em imagem](https://zfbx.github.io/zdiscord/images/intents.png)) *Se você não fizer isso.. seu bot NÃO funcionará.*

3. Adicione o bot ao seu servidor - Para isso copie o link abaixo substituindo `YOUR-BOT-ID` pelo ID do seu bot e siga o processo de convite: `https://discord.com/api/oauth2/authorize?client_id=YOUR-BOT-ID&permissions=116928&scope=bot%20applications.commands`<br> **OBS: Se o bot já estiver no seu servidor talvez seja necessário rodar o link acima novamente para garantir que ele tenha o escopo de slash commands (isso é independente das permissões)**

4. Copie o recurso para a pasta de resources do seu servidor FiveM e certifique-se de que ele esteja nomeado `zdiscord` (não zdiscord-djs, zdiscord-eris ou outro)

5. Verifique se você tem o recurso [cfx-server-data](https://github.com/citizenfx/cfx-server-data) nos seus resources (ou ao menos o yarn em `[system]/[builders]/yarn/`)

6. No seu `server.cfg` faça o seguinte:<br>
    6a. Adicione `ensure zdiscord` (após qb-core e/ou [convars](https://zfbx.github.io/zdiscord/convars) que você possa ter)<br>
    6b. Adicione o seguinte em qualquer lugar do seu .cfg:
    ```
    add_ace resource.zdiscord command allow
    add_ace group.zdiscordstaff zdiscord.staffchat allow
    ```

7. Ajuste as variáveis em `config.js` conforme desejar. (Opcionalmente use [Convars](https://zfbx.github.io/zdiscord/convars))

8. **Se você pulou o passo 2, volte e faça-o.. ou então NÃO VAI FUNCIONAR!**

9. Se encontrar qualquer erro verifique o [FAQ](https://zfbx.github.io/zdiscord/faq) onde muitas dúvidas comuns estão listadas e respondidas

## Suporte

*Por favor note que nós apenas damos suporte ao framework oficial, gratuito e open source [QBCore](https://github.com/qbcore-framework) e não a cópias antigas "qbus" ou versões pagas do QBCore.*

Se você tiver erros ou problemas verifique primeiro:
- [Perguntas Frequentes](https://zfbx.github.io/zdiscord/faq)
- [Issues no Github](https://github.com/zfbx/zdiscord/issues?q=)

Se nada disso resolver [Abra um ticket](https://github.com/zfbx/zdiscord/issues/new/choose) ou me envie uma mensagem no [Discord](https://discord.gg/M6neBU3cv) (Meu nome é Tony#1275 no discord)

## Doar

Eu construí e aperfeiçoei este recurso gratuitamente e o publiquei como open source para todo mundo. Se você usa, gosta, recebe suporte de mim ou só quer apoiar o projeto por favor considere enviar uma gorjeta ou doação por uma das plataformas abaixo:

[![Donate on PayPal](https://img.shields.io/badge/Donate-PayPal-%2300457C?style=for-the-badge&logo=paypal)](https://paypal.me/zfbx)
[![Sub on Patreon](https://img.shields.io/badge/Support-Patreon-%23FF424D?style=for-the-badge&logo=patreon)](https://www.patreon.com/zfbx)
[![Buy Me a Pizza](https://img.shields.io/badge/Pizza-BuyMeACoffee-%23FFDD00?style=for-the-badge&logo=buymeacoffee)](https://www.buymeacoffee.com/zfbx)

Qualquer contribuição é muito apreciada, mas você já é incrível de qualquer forma ♥

## Licença

**Observação: a partir da versão 7.0.0 do zdiscord, ele está licenciado sob CC-BY-NC-SA-4.0**

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/zfbx/zdiscord">zdiscord</a> © 2021 por <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/zfbx">zfbx</a> está licenciado sob <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Atribuição-NãoComercial-CompartilhaIgual 4.0 Internacional<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1"></a></p>

**TL;DR**
- BY: Deve ser dado crédito a mim, o criador. (Tony/zfbx)
- NC: Uso comercial não é permitido. (Você pode usar no seu próprio servidor FiveM que gere renda, MAS não pode vender o zdiscord em si ou distribuir com fins comerciais)
- SA: Adaptações devem ser compartilhadas sob os mesmos termos.
