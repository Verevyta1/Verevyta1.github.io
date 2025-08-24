# Step-by-Step: Deploy, Configure, and Monetise

## 1) Create your GitHub Pages repo
- **User site**: name the repo `<your-username>.github.io`.
- **Project site**: any repo name works. You will set `baseurl: "/<reponame>"` later.

Push this starter into the repo and go to **Settings → Pages**. Set **Source** to the `main` branch (root). Wait a minute for Pages to publish.

## 2) Configure `_config.yml`
Edit:
- `url`: `https://<your-username>.github.io` (or your custom domain).
- `baseurl`: `""` for user site, or `"/<reponame>"` for a project site.
- `author.*` details.
- `ads.enabled`: switch to `true` once AdSense approves your site.
- `ads.adsense_publisher_id`: `ca-pub-xxxxxxxxxxxxxxxx`.
- `ads.in_article_slot`, `ads.display_slot_top`, `ads.display_slot_sidebar`: create ad units in AdSense, copy slot IDs.
- `analytics.ga4_measurement_id`: your GA4 property ID.

## 3) Consent banner (required in UK/EU)
The site ships with a simple consent banner that blocks loading of GA4 and AdSense until a visitor **Accepts**. You can edit copy in `_includes/consent.html`. Consent is stored in `localStorage` as `consent=granted` or `denied`.

## 4) Write posts
Create files in `_posts/` named `YYYY-MM-DD-my-post.md`:
```yaml
---
title: "My First Post"
description: "Short SEO description under ~160 chars"
date: 2025-01-01
tags: [how-to, tools]
image: /assets/img/cover.jpg
---
```
Use the affiliate helper:
```
{% raw %}{% include affiliate.html url:"https://example.com/product" title:"Great Gadget" subtitle:"Editors' pick" %}{% endraw %}
```

Inline ad (needs `ads.enabled:true` and a valid slot):
```
{% raw %}{% include adsense-auto.html position:"in-article" %}{% endraw %}
```

## 5) Local development (optional)
Install Ruby, then:
```bash
bundle install
bundle exec jekyll serve
```
Open the printed local URL.

## 6) Custom domain (optional)
Add your domain in repo **Settings → Pages** and create a `CNAME` record pointing to GitHub Pages. Include a `CNAME` file at repo root with your domain name.

## 7) Tips for growth
- Publish consistently; add clear, helpful images.
- Internal link between related posts.
- Use descriptive titles and meta descriptions.
- Share posts to communities relevant to your niche.
- Keep pages fast: compress images and avoid heavy embeds.

## Troubleshooting
- **404s or broken links**: ensure `url` and `baseurl` are correct and use `{{ '/path' | relative_url }}` helpers.
- **Ads not showing**: AdSense approval can take time. Ensure `ads.enabled: true`, correct publisher and slot IDs, and sufficient content on site.
- **GA4 missing data**: GA only loads after consent. Test in production with real visits (and disable ad blockers when testing).
