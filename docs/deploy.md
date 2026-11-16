# Publicação na Vercel

Feito uma vez, no navegador. Depois disso, cada push na `main` publica e cada pull request ganha uma prévia.

1. **GitHub:** crie o repositório `portfolio-adriano` (público ou privado) e envie o código:
   ```bash
   git remote add origin https://github.com/Adriano2712/portfolio-adriano.git
   git push -u origin main
   ```
2. **Vercel:** Add New → Project → importe `portfolio-adriano`. O framework é detectado como Astro; não mude o comando de build nem a pasta de saída.
3. **Variáveis de ambiente** (Settings → Environment Variables), todas opcionais:
   - `SITE_URL`: o domínio definitivo, com `https://`. Sem ela, o build usa o domínio de produção que a Vercel informa.
   - `PUBLIC_UMAMI_WEBSITE_ID` e `PUBLIC_UMAMI_SRC`: do site criado no Umami (ADR-0005).
4. **GitHub Actions:** em Settings → Secrets and variables → Actions → Variables, crie `SITE_URL` com o mesmo valor, para o CI gerar os mesmos links canônicos.
5. **Domínio próprio** (quando houver): Vercel → Settings → Domains, e atualize `SITE_URL` nos dois lugares.

## Conferir depois do primeiro deploy

- `/` num navegador em português abre `/pt/`; em inglês, `/en/`.
- `curl -sI https://SEU-DOMINIO/` com user-agent de navegador responde 302; com `-A Googlebot` responde 200.
- [VALIDAR] Acesso de fora do Brasil (VPN) com navegador em português vai para `/pt/`; com navegador em inglês, para `/en/`. Isso confirma que o cabeçalho `x-vercel-ip-country` chega (ADR-0001).
- `https://SEU-DOMINIO/sitemap-index.xml` e `/robots.txt` apontam para o domínio certo.
- Lighthouse do Chrome, perfil celular, em `/pt/` e num estudo de caso.
