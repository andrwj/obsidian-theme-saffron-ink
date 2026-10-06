# Release and Community submission

## Prepared for version 1.0.0

- Public repository: https://github.com/andrwj/obsidian-theme-saffron-ink
- Theme name: **Saffron Ink**
- GitHub owner: **andrwj**
- Supported color scheme: **Light**
- Minimum Obsidian version: **1.14.4**
- Screenshot path: `screenshots/screenshot.png` (512 × 288, PNG, 16:9)
- Larger preview: `screenshots/desktop.png` (1280 × 720)
- Optional icon preview: `screenshots/font-awesome.png` (1280 × 720)
- Suggested description: “Warm saffron paper, crisp ink, blue headings, and six distinct heading weights.”

The screenshots are genuine Obsidian captures of a separate demonstration vault. They contain sample notes only. The primary screenshot shows the theme without community plugins; the optional preview uses GlyphIt and Font Awesome Free Regular. Fonts and icon packs are not bundled.

The repository root contains `theme.css`, `manifest.json`, `README.md`, and the MIT `LICENSE`. `versions.json` maps 1.0.0 to Obsidian 1.14.4. The README documents compatibility, installation, fonts, optional icons, and attribution. Agent instructions and local work records are ignored by Git.

## Local checks

```sh
npm ci
npm run check:submission
npm run release:prepare
```

`check:submission` validates metadata, official Obsidian CSS lint rules, screenshot sizes, local README links, licensing, remote CSS asset restrictions, and publication candidates. Release preparation copies **only** `theme.css` and `manifest.json` to `artifacts/release/1.0.0/`. Never upload the development repository as the theme payload.

These checks do not replace the Community directory's automated review. Desktop reading mode, Live Preview, source mode, and heading weights have been verified locally. Mobile is not yet verified and is not advertised as tested.

## Publication steps still required

No commit, push, tag, GitHub release, or Community submission has been made as part of this preparation.

1. Review the files and screenshots, then commit and push the reviewed 1.0.0 source to the repository's default branch.
2. Create and push the tag **`1.0.0`**, exactly matching `manifest.json`. Do not prefix it with `v`.
3. Create a GitHub release for that tag and attach `theme.css` and `manifest.json` as separate release assets. Publish the release; a draft is insufficient for submission.
4. Confirm that the public default branch, screenshot URL, tag, and both release asset URLs are accessible without authentication.
5. Sign in to the [Obsidian Community directory](https://community.obsidian.md), connect the **andrwj** GitHub account, and accept the current developer policies.
6. Under **Themes → New theme**, enter the repository, owner, name, screenshot path, and **Light** support listed above.
7. Submit and resolve automated review feedback. If source changes require a new release, increment the version consistently and publish a matching tag and assets.

The `release.yml` workflow prepares a **draft** GitHub release when a matching version tag is pushed. Review and publish that draft manually. It does not submit the theme to Obsidian.

For subsequent updates, publish a new matching version, tag, and release assets. The initial Community submission does not need to be repeated.

## Official references

- [Submit your theme](https://docs.obsidian.md/themes/app-themes/submit-theme)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
