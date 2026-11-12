# NextBit Updates — Product Requirements

**Requested:** 12 November 2026  
**Repository:** \`arcange-dev/Nextbit-updates-official\`  
**Document status:** Approved product direction; implementation work remains to be completed.

This specification records the requested product changes for NextBit Updates. It is not a claim that these features are already deployed.

## 1. Public navigation: replace Projects with Devices

- Remove the public **Projects / Build** panel from the main navigation, command palette, footer navigation, and public browsing experience.
- Add a first-class **Devices** panel.
- Do not irreversibly delete the old project records or image assets as part of removing the public panel. Archive or retain them until an administrator confirms a separate data-cleanup action.
- The Devices panel must support at least:
  - Mobile phones and smartphones
  - PCs, laptops, desktops and workstations
  - Tablets and e-readers
  - TVs, monitors and display devices
  - Smart watches and wearables
  - Cameras and imaging equipment
  - Headphones, speakers and audio equipment
  - Gaming consoles and peripherals
  - CPUs, GPUs, motherboards, memory and storage
  - Routers, networking equipment and smart-home devices
  - Other consumer and professional electronic devices
- Include category filters, brand filters, model search, sorting, and a device detail page.
- Device cards should display a preview image, brand, model, device category and a short factual summary.
- Device details should show relevant specifications in structured sections. Depending on category, fields may include processor/chipset, memory, storage, display, camera, battery/power, connectivity, dimensions, operating system, ports, release date and model/variant. Do not show irrelevant or invented specifications.
- Show the date last checked and link to the original source.

## 2. Automated device discovery and importing

Build a server-side ingestion pipeline that discovers devices and imports their metadata into NextBit.

### Source rules
- Prefer manufacturer APIs, official product feeds, licensed product-data providers, partner feeds, and sources whose terms expressly permit the intended reuse.
- Maintain an admin-managed source registry with source URL/provider, source type, trust level, allowed content types, attribution requirements, licence/usage notes, enabled state and polling interval.
- Never bypass logins, paywalls, access controls, rate limits, robots directives or website terms.
- Do not copy protected product descriptions or download/re-host product images unless the source licence or permission allows it.
- Where image reuse is not allowed or unclear, use an appropriately licensed image, an approved provider image URL according to its terms, or a neutral placeholder. Retain source attribution.
- Do not imply that a product is officially endorsed by NextBit.

### Ingestion workflow
1. Fetch permitted feeds/APIs on a configurable schedule with respectful rate limits and retry/backoff.
2. Normalize source records into a common device schema.
3. Validate the record, source URL, image rights/provenance and specification fields.
4. Detect duplicates using brand, model, model number, canonical URL and provider ID.
5. Save incoming records to an import queue.
6. Let administrators preview, edit, approve, reject, merge, archive or publish imported records.
7. Permit auto-publication only for sources explicitly marked trusted by an administrator and only under a configurable policy.
8. Preserve provenance for every imported record and image, including original source, source URL, retrieval time, usage rights and last verification.
9. Prevent scheduled imports from silently overwriting admin edits. Track imported values and manual overrides separately and surface conflicts for review.

## 3. Admin content management across every public panel

Administrators must be able to add, edit, publish/unpublish, reorder, archive and delete the content displayed in every public panel, not only news articles.

At minimum, include management for:
- News articles, categories, tags, images and source links
- Devices and device categories
- Opportunities, jobs, internships, scholarships and events
- AI tools, AI models, AI news and curated GitHub repositories
- ICT roadmaps, roadmap categories and roadmap stages
- Africa Tech stories and featured organisations
- Announcements, breaking-news banners and featured items
- Any new public panel added in the future

### Common publishing workflow
- Provide draft, review, published and archived states.
- Provide search, filters, sorting, preview, safe delete confirmation, restore/archive where appropriate, and bulk actions.
- Preserve who created, edited, reviewed and published each item, with timestamps and audit history.
- Keep content-type-specific forms and validation. For example, opportunities, devices, articles and repositories must use appropriate structured fields rather than one generic text box.
- Admin-created content must not be overwritten by scheduled import jobs.
- Add a universal content index in admin so the admin can find and manage all public content without having to navigate unrelated settings pages.
- All state-changing backend routes must enforce permissions server-side. Hiding a frontend button is not access control.

## 4. AI panel and weekly GitHub repository curation

Update the AI/technology panel so its repository recommendations are refreshed automatically every week.

### Discovery and quality scoring
- Use the official GitHub API to search configurable AI-related fields, including machine learning, LLMs, agents, computer vision, NLP, model training, inference, data/ML infrastructure and AI safety.
- Do not rank repositories by star count alone. Use a transparent configurable score that may consider:
  - Topic and description relevance
  - Recent commits and releases
  - Maintenance and issue/PR activity
  - Documentation and project clarity
  - Community adoption (stars, forks and contributors)
  - Licence clarity
  - Security and release practices where verifiable
  - Archived, disabled or abandoned status
- Flag or exclude spam, duplicates, archived projects and repositories with unclear or incompatible licences according to admin policy.
- Record the signals and score used so admins can understand why a repository was selected.

### Weekly scheduled workflow
- Run a scheduled job once every week (configurable day/time and timezone).
- Refresh metadata for currently listed repositories, discover candidates, compare the new ranking with the existing selection, and identify stale, archived, deleted or inactive projects.
- Maintain a history of weekly snapshots and changes.
- Send newly discovered repositories and proposed replacements to an admin review queue by default.
- Allow admins to approve, pin, reject, hide, add manually, remove, or override rankings.
- Do not remove an admin-pinned repository merely because its score decreases; mark it for review.
- Display the repository's original GitHub URL and the date it was last checked.

### Meaning of “clone” for GitHub projects
The default behaviour is to import repository metadata, descriptions within permitted limits, topics, statistics and links into NextBit. Do not mirror or redistribute entire repository source trees unless a separate explicit use case exists and the upstream licence permits it. Preserve repository owner and licence attribution.

## 5. News Writers: accounts, permissions and dedicated workspace

Add a **News Writers** management area to the administrator panel and a separate writer-facing frontend/workspace.

### Admin account management
- Admins can create a writer account with a unique username and an initial temporary password.
- Admins can assign and revoke granular permissions for individual features and actions.
- Admins can edit writer profile details, suspend/reactivate accounts, force password resets, and revoke sessions.
- Admins can see writer status, assigned permissions, submissions and relevant activity/audit history.
- Admins can delete/deactivate an account without deleting the content history authored by that writer.
- Never store or display plaintext passwords after account creation. Store a secure password hash; require the writer to change a temporary password at first login.
- Provide a secure password reset process. Do not place passwords in URLs, logs, emails without an approved secure delivery flow, or client-side source code.

### Dedicated writer frontend
- Provide a dedicated writer login page using the admin-issued username and temporary password.
- Provide a separate News Writer workspace, visually consistent with NextBit but distinct from the full admin console.
- The workspace must show only the pages and actions allowed by that writer's permissions.
- Support writing drafts, editing permitted submissions, uploading approved media, previewing stories and submitting content for review.
- Clearly show draft, submitted, changes requested, approved and published states.
- Writers must not be able to grant permissions, manage admin accounts, alter security settings or access unrelated admin features unless an administrator explicitly grants a narrowly defined permission.
- A writer must never become an administrator simply by changing a role field or calling a hidden API endpoint.

### Suggested permission model
Use explicit permissions rather than relying on one broad \`editor\` role. Examples:
- \`articles.read\`
- \`articles.create\`
- \`articles.edit_own\`
- \`articles.edit_any\`
- \`articles.submit_for_review\`
- \`articles.publish\`
- \`articles.delete\`
- \`devices.read\`
- \`devices.propose\`
- \`opportunities.read\`
- \`opportunities.propose\`
- \`media.upload\`
- \`comments.moderate\`
- \`sources.read\`

Only administrators can grant permissions. Add new permissions deliberately as features are added. Enforce every permission on the server and reflect the same permission set in the frontend navigation and action controls.

## 6. Data model and security expectations

Implementation should extend the existing PostgreSQL/Supabase schema rather than introducing an unrelated datastore.

Likely entities/tables include:
- \`devices\`, \`device_categories\`, \`device_specs\`
- \`content_sources\`, \`source_permissions\`, \`ingestion_runs\`, \`import_queue\`
- \`github_repo_curations\`, \`github_repo_snapshots\`, \`curation_runs\`
- \`writer_profiles\`, \`role_permissions\`, \`user_permissions\`, \`writer_assignments\`
- A content audit/history mechanism covering all manageable content types

Use foreign keys, unique constraints, indexes and JSONB only where appropriate. Design migrations to be repeatable and safe for an existing database. Do not delete current tables or records as part of a feature rollout.

Security requirements:
- Hash passwords with a modern password-hashing algorithm and suitable work factor.
- Use short-lived authenticated sessions or JWTs with safe expiry and revocation strategy.
- Enforce role/permission checks in API middleware and at each protected route.
- Validate and sanitize imported and writer-submitted content.
- Protect uploads by checking file type, size and content; never trust a client-supplied filename.
- Keep API keys, service-role keys and scheduler secrets server-side.
- Record security-sensitive actions in an audit log.
- Apply rate limits to login, password reset and ingestion endpoints.

## 7. Deployment and operations

- Keep the existing Render + Supabase architecture unless implementation testing shows a necessary change.
- Use a Render Cron Job or another supported scheduler for weekly GitHub curation and scheduled device ingestion. A browser timer or in-memory Node.js timer is not sufficient for reliable production scheduling.
- Add environment-variable documentation and safe defaults. Never commit real secrets.
- Add admin-visible ingestion run status: last run, next run, source count, imported/updated/ignored/failed counts and error summaries.
- Add retry/backoff, timeouts, deduplication and idempotency so repeated jobs do not create duplicate records.
- Add tests for permissions, writer isolation, import deduplication, manual-edit preservation, weekly curation and API failures.
- Confirm frontend build, server syntax, database migration and production health before considering each phase complete.

## 8. Recommended delivery phases

1. **Navigation and schema foundation:** remove the public Projects/Build destination, add Devices navigation and device data model while retaining old records.
2. **Universal CMS:** make the existing admin content workflow manage devices, opportunities, AI content, roadmaps and other public content.
3. **Device source ingestion:** implement trusted source adapters, provenance, import queue, previews and admin approval.
4. **GitHub weekly curation:** add scheduled repository discovery, quality scoring, snapshots and review controls.
5. **News Writers:** add secure writer accounts, granular permissions, dedicated sign-in and isolated writer workspace.
6. **Verification and deployment:** run migration, security, functional and production health tests; document any required Render/Supabase configuration.

## Acceptance criteria

The requested work is complete only when:
- The public navigation has Devices and no Projects/Build panel.
- Devices cover the categories above and render image previews, verified structured specifications and source attribution.
- Device imports run from permitted sources and are deduplicated, traceable and reviewable by admins.
- Admins can manage content in every public panel, including Opportunities.
- AI GitHub selections are refreshed by a real weekly scheduled job, have history, and support admin review/override.
- Admins can create writer accounts and assign granular permissions.
- Writers can sign in to a separate workspace and cannot access or mutate features outside their server-enforced permissions.
- Automated tests, migrations and production deployment checks pass.

