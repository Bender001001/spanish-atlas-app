# Publishing ¡ÓRALE! to GitHub — a complete beginner's guide

Written for a complete GitHub beginner. Everything below happens in the web browser — no command line, no git installation needed. Budget ~45 minutes for the first publish. Words in *italics* are GitHub jargon explained on first use.

---

## 1. Create your GitHub account (~5 min)

1. Go to https://github.com/signup
2. Enter an email address you check regularly, create a password, and pick a **username** — choose carefully, it becomes part of your app's public URL (e.g. username `orale-dev` → app lives at `orale-dev.github.io`). Lowercase letters, numbers and hyphens only.
3. Verify the email code GitHub sends you.
4. Skip/ignore any paid-plan offers — everything this project needs (public repos, GitHub Pages, Releases) is **free**.
5. Recommended: turn on two-factor authentication when prompted (Settings → Password and authentication). GitHub increasingly requires it.

## 2. Create the repository (~5 min)

A *repository* ("repo") is a project folder that lives on GitHub, with a full history of every change.

1. Click the **+** icon (top-right) → **New repository**.
2. Fill in:
   - **Repository name:** `orale` (this makes the app URL `https://<username>.github.io/orale/`)
   - **Description:** `Learn conversational Mexican Spanish in 26 weeks — one HTML file, zero dependencies, fully offline.`
   - **Visibility:** Public
   - **Do NOT** tick "Add a README" — we're bringing our own.
3. Click **Create repository**.

## 3. Upload the project files (~10 min)

You'll land on a "Quick setup" page. Use the browser uploader:

1. Click the link **"uploading an existing file"** (in the Quick setup box).
2. In Windows Explorer, open your `orale-project` folder and select these items — **drag them all into the GitHub upload area at once** (folders drag in with their contents):
   - the `app` folder
   - the `docs` folder
   - the `tools` folder
   - `README.md`, `ROADMAP.md`, `LICENSE`
   - **Leave out:** `backups/`, `app/backups/`, and `handoff/` — internal working files, not for the public repo.
3. In the "Commit changes" box at the bottom, type a message like `v2.0.0 — initial public release` and click **Commit changes**. (A *commit* is a saved snapshot with a label.)
4. Wait for the upload to finish (the single big HTML file is ~200 KB — quick). You should now see your folders and README rendered on the repo homepage.

> If drag-and-drop of folders doesn't work in your browser: click **Add file → Upload files** and upload one folder's contents at a time, typing the folder name in the filename path (e.g. `app/orale.html`).

## 4. Turn on GitHub Pages — your free live app URL (~5 min)

*GitHub Pages* serves your files as a real website — this is what makes the PWA installable for anyone.

1. In your repo, go to **Settings** (top tab) → **Pages** (left sidebar).
2. Under **Build and deployment**: Source = **Deploy from a branch**; Branch = **main**, folder **/(root)** → **Save**.
3. Wait 1–2 minutes, refresh the page: a box appears saying "Your site is live at `https://<username>.github.io/orale/`".
4. Your app is now at: **`https://<username>.github.io/orale/app/orale.html`** — open it, Chrome/Edge will show the install icon in the address bar.
5. **Run the acceptance test** (from the internal roadmap): on the live URL, complete the tutorial and one review session, and click through the week-1 external links (the 3-minute checklist in `docs/QA-REPORT.md`).

## 5. Create the v2.0.0 Release (~5 min)

A *Release* is a labeled, downloadable snapshot — this is what "packaging" means on GitHub. Users who don't want to browse the repo just grab the zip.

1. On the repo homepage, right sidebar → **Releases** → **Create a new release**.
2. **Choose a tag** → type `v2.0.0` → "Create new tag: v2.0.0 on publish". (A *tag* is a permanent bookmark to this exact version.)
3. **Release title:** `¡ÓRALE! v2.0.0 — first public release`
4. **Description:** paste the `[2.0.0]` section from `docs/CHANGELOG.md`, plus a one-line pitch and the live Pages link at the top.
5. **Attach the offline bundle:** drag `orale-v2.0.0-release.zip` (in your project's `backups/` folder — created for you) into the "Attach binaries" box. It contains just the `app/` files — everything an offline user needs.
6. Tick nothing else, click **Publish release**.

## 6. Add your HTML presentation to the homepage (when you're ready)

You said you'll build an HTML presentation to attract eyeballs. Here's exactly where it goes:

1. Name the file **`index.html`** and upload it to the **root** of the repo (Add file → Upload files).
2. Because Pages serves from the root, `index.html` automatically becomes the page people see at **`https://<username>.github.io/orale/`** — the cleanest possible URL.
3. In the presentation, link the app as `app/orale.html` (relative link) and the repo as `https://github.com/<username>/orale`.
4. Also set the repo's **About** section (gear icon, repo homepage, right sidebar): paste the Pages URL in "Website" and add *topics* — `spanish`, `language-learning`, `flashcards`, `srs`, `pwa`, `offline-first`, `single-file`, `mexican-spanish`. Topics are how people discover the repo.
5. There's a placeholder comment in `README.md` marking this plan — remove it once index.html is live.

## 7. Attracting eyeballs — a realistic playbook

- **The README is your storefront** — it's already written to sell the project (v2.0.0 version). Add 2–3 screenshots: take them in the app, upload to the repo in a `screenshots/` folder, then reference them in the README with `![Panel](screenshots/panel.png)`.
- **Enable Issues and Discussions** (Settings → General → Features) so the community roadmap has somewhere to land. Create one Issue per near-term `ROADMAP.md` item and label starter items **`good first issue`** — GitHub surfaces that label to newcomers looking for projects.
- **Add badges** to the top of the README once live (shields.io): license, release version, "works offline".
- **Where to post:** r/Spanish and r/languagelearning (Reddit), Hacker News as "Show HN: A 968-card Mexican Spanish course in a single offline HTML file", the language-learning Discords. Lead with the zero-dependency offline angle — that's the differentiator no big app can match.
- **Star your own repo** and ask friends to — the first 10 stars matter disproportionately for discovery.

## 8. Updating the app later (the routine)

1. Edit files locally (Cowork sessions keep working exactly as before — the OneDrive folder stays your workshop).
2. Bump `APP_VERSION` in `orale.html` + add the CHANGELOG entry + run both gates (every session already does this).
3. On GitHub: **Add file → Upload files** → drag the changed files → they overwrite the old ones → Commit.
4. Pages redeploys automatically in ~1 minute. Installed PWA users get the update on their next online launch (the v2.0.0 service-worker fix is what makes this work).
5. For milestone versions, repeat §5 with a new tag (v2.1.0, etc.).

## 9. When the community shows up

- **Issues** = bug reports & feature requests. Respond, label, and point people at `ROADMAP.md`.
- **Pull Requests (PRs)** = someone offering you code. Review the diff on GitHub; check the PR text confirms both gates PASS; check the CHANGELOG entry and `APP_VERSION` bump; for Spanish content, spot-check MX register per `docs/QA-REPORT.md`. Merge with the green button, or request changes politely.
- The README's Contributing section and ROADMAP's "out of scope" list are your shield — link them instead of re-arguing the single-file architecture in every thread.
- Later, consider moving the whole workflow to git proper (GitHub Desktop is the gentlest on-ramp) — worth it once outside PRs become regular.
