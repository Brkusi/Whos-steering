# Sales automation

Additive schema migration runs before the API starts. Sales tables have RLS enabled; only the server's database role accesses them. Saved links use 256-bit random tokens in URL fragments and expire after 30 days. No shipping or payment data is saved in lead records by the storefront.

Configure Render environment variables to activate sending:
- RESEND_API_KEY: send-only API key for a verified domain.
- Verify whossteering.com in Resend. The sender, reply-to, and owner notification recipient are service@whossteering.com.
- SALES_POSTAL_ADDRESS: business mailing address included in reminder footers.

Without the sender, saving still returns a private link and fitment requests appear in Admin → Sales & fitment. The reminder opt-in is hidden until all settings exist. Do not claim emails are sent when the provider fails.

Reminders run approximately 1, 24 and 72 hours after an opted-in save, at most three per latest email lead. Orders that move past pending, including processing payments, suppress reminders. Unsubscribe stops all current leads for that email. Prices are always recalculated by the existing checkout API. Paid purchases originating from saved links are attributed only when the checkout email matches the saved email; this is attribution, not proof of incremental revenue.

The worker runs every minute while Render is awake and on startup. A free sleeping Render instance needs an external scheduler or an always-on instance for timely delivery. No recurring external scheduler or paid service is provisioned automatically. Configure one before relying on reminder timing.

Manual acceptance: save and reopen a BMW/Audi build; save and restore a cart; submit fitment with uploaded photo and resolve in admin; verify no email without opt-in; confirm unsubscribe and paid/processing order suppression. Email validation should use a designated test recipient; never create a live charge for testing.
