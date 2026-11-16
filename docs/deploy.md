# Publicação na Vercel

**No ar:** https://portfolio-adriano-taupe.vercel.app (projeto importado em 16/11/2026; cada push na `main` publica).

Feito uma vez, no navegador. Depois disso, cada push na `main` publica e cada pull request ganha uma prévia.

1. **GitHub:** repositório: https://github.com/Adriano2712/portfolio-Adriano (público). Código já enviado:
   ```bash
   git remote add origin https://github.com/Adriano2712/portfolio-Adriano.git
   git push -u origin main
   ```
2. **Vercel:** Add New → Project → importe `portfolio-Adriano`. O framework é detectado como Astro; não mude o comando de build nem a pasta de saída.
3. **Variáveis de ambiente** (Settings → Environment Variables), todas opcionais:
   - `SITE_URL`: o domínio definitivo, com `https://`. Sem ela, o build usa o domínio de produção que a Vercel informa.
   - `PUBLIC_UMAMI_WEBSITE_ID` e `PUBLIC_UMAMI_SRC`: do site criado no Umami (ADR-0005).
4. **GitHub Actions:** em Settings → Secrets and variables → Actions → Variables, crie `SITE_URL` com o mesmo valor, para o CI gerar os mesmos links canônicos.
5. **Domínio próprio** (quando houver): Vercel → Settings → Domains, e atualize `SITE_URL` nos dois lugares.

## Conferir depois do primeiro deploy

- `/` num navegador em português abre `/pt/`; em inglês, `/en/`.
- `curl -sI https://SEU-DOMINIO/` com user-agent de navegador responde 302; com `-A Googlebot` responde 200.
- Cabeçalho `x-vercel-ip-country`: validado em 16/11/2026 (ADR-0001). Falta só um teste de fora do Brasil (VPN) com navegador em inglês, que deve ir para `/en/`.
- `https://SEU-DOMINIO/sitemap-index.xml` e `/robots.txt` apontam para o domínio certo.
- Lighthouse do Chrome, perfil celular, em `/pt/` e num estudo de caso.
