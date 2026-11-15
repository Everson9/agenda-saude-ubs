# Deploy

A aplicação está publicada no **Render**, plano gratuito: **https://agenda-saude-ubs.onrender.com**

| Item | Valor |
|---|---|
| Serviço | Web Service `agenda-saude-ubs`, runtime Node 22, região Virginia (EUA) |
| Origem | Branch `main` deste repositório, com deploy automático a cada merge |
| Build | `npm ci --omit=dev` |
| Start | `npm start` (`node src/server.js`) |
| Health check | `GET /api/saude` → `{"status":"ok"}` |
| Configuração | [`render.yaml`](../render.yaml) (Blueprint) |

Um serviço só atende tudo: o Express entrega a API em `/api/*` e a tela da recepção (`src/public`) na mesma
origem. Por isso não há CORS a configurar nem endereço de API embutido na tela.

## Fluxo

`feature/*` → PR para `develop` (CI) → `release/X.Y.Z` → PR para `main` (CI) → **o Render publica sozinho**.
A `develop` não é publicada: ela é a branch de integração.

## Variáveis de ambiente

| Variável | Valor em produção |
|---|---|
| `NODE_ENV` | `production`. Com ele, o servidor **não inicia** sem `AUTH_SENHA_HASH` e `AUTH_SEGREDO` (#76) |
| `NODE_VERSION` | `22` |
| `AUTH_USUARIO` | `recepcao` |
| `AUTH_SENHA_HASH` | Hash scrypt da senha de produção, gerado com `npm run hash-senha -- "senha"`. Fica só no painel do Render |
| `AUTH_SEGREDO` | 32 bytes aleatórios em hex. Fica só no painel do Render |
| `ACESSO_AVALIACAO` | `true`. Mostra "Entrar como avaliador" na tela de login (#81) |

## Acesso de avaliação

Quem avalia o projeto acompanha pelo GitHub e não recebe a senha da recepção. Publicar essa senha no README
deixaria a conta real aberta, e foi justamente o risco apontado na avaliação Week_01. A saída foi um acesso
separado, **ligado só por variável de ambiente**:

- `GET /api/auth/opcoes` diz à tela se o acesso está ligado; a tela só mostra o botão nesse caso.
- `POST /api/auth/avaliacao` emite um token de 8 h para o usuário `avaliador`. Desligado, a rota responde 404.
- A senha da recepção continua secreta e continua valendo.

O risco aceito: com o acesso ligado, qualquer pessoa com o link entra e vê o que foi cadastrado. Isso só é
aceitável porque o ambiente publicado é de demonstração, com disco efêmero e o aviso na tela para não usar dados
reais. Num ambiente com dados reais de pacientes a variável fica desligada.

A senha de desenvolvimento do README (`recepcao123`) **não funciona** no ambiente publicado (conferido: o login
com ela devolve 401). Nenhum segredo de produção está no repositório; o Gitleaks do CI vigia isso.

## Limites do plano gratuito

- **O serviço dorme** depois de 15 minutos sem requisição. O primeiro acesso depois disso leva cerca de 1 minuto.
- **O disco é efêmero.** O arquivo `data/db.json` some a cada deploy ou reinício, então os dados publicados são
  só de demonstração. Para uso real na UBS seria preciso um banco gerenciado (PostgreSQL), item já previsto no
  backlog ("Migrar JSON para SQLite/PostgreSQL"), ou um disco persistente, que é pago.
- Uma instância só. Isso combina com o controle de concorrência atual, que serializa as escritas dentro do
  processo (ver [arquitetura.md](arquitetura.md)); com mais de uma instância seria preciso um banco.

## Como refazer do zero

1. No Render, **New → Blueprint** e escolher este repositório. O `render.yaml` cria o serviço.
2. Preencher `AUTH_SENHA_HASH` no painel e, se for ambiente de demonstração, `ACESSO_AVALIACAO=true` (o `AUTH_SEGREDO` o Render gera sozinho).
3. Esperar o deploy ficar `live` e conferir `curl https://<serviço>.onrender.com/api/saude`.

## Conferência feita na publicação (14/11/2026)

- `GET /api/saude` → 200 `{"status":"ok"}`; `GET /` → 200 (tela de login).
- Login com a senha de desenvolvimento → 401. Login com a senha de produção → token.
- `GET /api/pacientes` sem token → 401.
