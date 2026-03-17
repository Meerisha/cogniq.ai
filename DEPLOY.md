# Deploy COGNIQA AI to Vercel and Connect GoDaddy Domain

## 1. Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (recommended)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push origin main
   ```

2. **Sign in to Vercel**: Go to [vercel.com](https://vercel.com) and sign in with GitHub.

3. **Import the repo**:
   - Click **Add New…** → **Project**
   - Select the `cogniq.ai` repository
   - **Root Directory**: click **Edit**, set to `web` (this is required because the Next.js app lives in `web/`)
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: leave default

4. **Environment variables** (same as local):
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - Optional later: `OPENAI_API_KEY`, `NEXT_PUBLIC_BASE_URL` (your production URL)

5. Click **Deploy**. When it finishes, you’ll get a URL like `cogniq-ai-xxx.vercel.app`.

---

### Option B: Deploy via Vercel CLI

```bash
cd /Users/meerim/cogniq.ai
npx vercel
```

- When asked for **Set up and deploy?** choose the `web` directory (or link to an existing project and set root to `web` in the dashboard).
- For production: `npx vercel --prod`

---

## 2. Connect Your GoDaddy Domain

1. **Add domain in Vercel**:
   - Open your project on [vercel.com/dashboard](https://vercel.com/dashboard)
   - Go to **Settings** → **Domains**
   - Enter your domain (e.g. `cogniqai.com` or `www.cogniqai.com`)
   - Click **Add**

2. **Vercel will show the DNS records** you need. Usually:
   - For **apex** (e.g. `cogniqai.com`): add an **A** record:
     - Name: `@`
     - Value: `76.76.21.21` (Vercel’s IP; confirm in Vercel’s instructions)
   - For **www** (e.g. `www.cogniqai.com`): add a **CNAME** record:
     - Name: `www`
     - Value: `cname.vercel-dns.com` (or what Vercel shows)

3. **In GoDaddy**:
   - Go to [godaddy.com](https://godaddy.com) → **My Products** → your domain → **DNS** (or **Manage DNS**)
   - Add the records Vercel gave you (A and/or CNAME as above)
   - Remove or avoid conflicting records (e.g. old A record pointing elsewhere)
   - Save. DNS can take from a few minutes up to 24–48 hours to propagate.

4. **Back in Vercel**: Wait until the domain shows as **Valid** (green). Vercel will issue SSL automatically.

---

## 3. Optional: Force HTTPS and set base URL

- Vercel serves HTTPS by default; no extra config needed.
- If you use `NEXT_PUBLIC_BASE_URL` for API calls (e.g. activity generator), set it in Vercel to your production URL, e.g. `https://cogniqai.com`.

---

## Quick checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created with **Root Directory** = `web`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] Domain added in Vercel → Domains
- [ ] A and/or CNAME records added in GoDaddy DNS
- [ ] Domain shows Valid in Vercel and site loads over HTTPS
