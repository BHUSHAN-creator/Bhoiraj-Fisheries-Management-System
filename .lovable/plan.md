# Complete Marathi Cooperative Portal

## User-facing work
- Make Marathi the first-render language across public pages, menus, forms and role dashboards; keep English and Hindi available and use the requested date/time format.
- Add the supplied society watermark as a cleanly resized site-wide layer, with an authorized Admin control to replace it.
- Complete the Marathi public experience and make photos, achievements, documents and dam records open in readable full views.
- Improve member records and access: designation editing and full location columns for staff, minimized public/member views, member-specific notifications, and reliable approval/rejection visibility.
- Present each dam as one cohesive record with natural-fit photos, a map link and optional 360-degree view; correct scheme links and staff/member actions.
- Give Chairman and Admin distinct dashboards whose controls open the selected section; add advertisement/social controls and safe management controls where supported.
- Apply restrained glass styling, useful motion, responsive media treatment and reduced-motion accessibility.

## Implementation approach
- Inspect current routes, database policies, related control panels, and preview diagnostics before editing.
- Reuse current project patterns, existing database structures and semantic styling tokens. Use a migration only where the schema/policies need to change, with role checks and privacy-preserving access.
- Prioritize reachable, testable frontend and workflow corrections. Avoid clearing existing records or claiming access/security behavior that cannot be verified.
- Check the site across public routes, then inspect build and runtime signals. Run authenticated approval checks only if the preview session can be safely established; do not create or impersonate an external Google identity.

## Important limitations
- Admin account access must remain protected by its own valid credentials; an email already attached to an account is not a reason to create or reveal another account.
- Automated website extraction, AI image generation, advertisement management, storage controls, and audit screenshot prevention depend on existing supported services, fields and permissions; implement only what the connected setup supports and report remaining blockers.
- Google Maps behavior and external email/OTP delivery require authorized live services and may need owner verification.