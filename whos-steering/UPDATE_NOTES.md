# B9 paddles and account experience update

## Included

- B9 Standard paddles: Normal (silver/black) and Stealth (black), modeled from the ten PaddlesOG1 reference photos. Enclosed mounts omit wiring. Finish is preserved in saved configuration and order/admin summaries.
- R8 feature notice includes factory compatibility and additional installation requirements, with keyboard-accessible dismissal.
- Password reset: emailed six-digit, single-use codes, ten-minute expiry, five-attempt limit, resend cooldown, hashed codes, generic request responses, and revocation of existing login tokens after reset.
- Signed-in tracking loads orders owned by that account. Unverified email matches do not grant private order access or cancellation rights; historical guest orders remain available through guest tracking.
- HTML email signature is sent as rendered HTML with a plain-text alternative. Remote logo display remains subject to the recipient's email settings.
- Motion welcome/login/admin refinements respect reduced motion. Dashboard pipeline uses an adapted MIT-licensed Bklit linear gauge; attribution is included beside the component.

## Deployment requirements

- Frontend: Node 20+ (Netlify configuration uses Node 22).
- Backend: configure `JWT_SECRET` with at least 32 characters and a working `RESEND_API_KEY`. Resend must authorize the `service@whossteering.com` sender.
- Optional `PASSWORD_RESET_SECRET` separates reset-code hashing from JWT signing; keep it secret and stable across instances.
- Backend startup applies `db/migrations/20260924_password_reset.sql` through the existing migration initialization. This adds reset-code storage and `customers.session_version`; deploy it before serving the updated authentication routes.
- Verify a real reset email and signed-in tracking against the deployed database before release. Automated tests use mocked database/email services.

## Verification limitations

Local preview startup was blocked by the execution policy, so browser visual verification of the final 3D paddle fit is still needed. Geometry tests verify blade/mount overlap and wheel-surface contact, but do not replace a front/back visual inspection.

The existing CRA development toolchain still reports dependency audit findings. No forced major-version dependency migration is included in this update.
