#!/usr/bin/env bash
# scripts/setup-vercel-preview-env.sh
#
# Configures Vercel Preview environment variables for the Flip monorepo.
#
# Non-Stripe vars are read from the local .env file.
# Stripe vars are ALWAYS prompted — enter test-mode values only.
# BETTER_AUTH_SECRET and CRON_SECRET are freshly generated each run.
# BETTER_AUTH_URL is intentionally skipped — better-auth auto-detects from Host header.
#
# Usage:
#   bash scripts/setup-vercel-preview-env.sh
#   bash scripts/setup-vercel-preview-env.sh --branch=my-feature

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
BRANCH=""

for arg in "$@"; do
    case "$arg" in
        --branch=*) BRANCH="${arg#--branch=}" ;;
        -h|--help) sed -n 's/^# //p' "$0" | head -15; exit 0 ;;
    esac
done

log()  { printf '  %s\n' "$*"; }
info() { printf '\n▸ %s\n' "$*"; }
warn() { printf '  ⚠  %s\n' "$*" >&2; }
die()  { printf '\n  ✗  ERROR: %s\n' "$*" >&2; exit 1; }

env_var() {
    local line
    line=$(grep -E "^${1}=" "$ENV_FILE" 2>/dev/null | head -1) || true
    [[ -z "$line" ]] && echo "" && return
    printf '%s' "${line#"${1}="}" | sed 's/[[:space:]]*#.*//'
}

set_preview_var() {
    local key="$1" value="$2"
    if [[ -n "$BRANCH" ]]; then
        printf '%s' "$value" | vercel env add "$key" preview "$BRANCH" --force
    else
        printf '%s' "$value" | vercel env add "$key" preview --force
    fi
    log "✓ $key"
}

prompt_secret() {
    local key="$1" hint="${2:-}" value=""
    while [[ -z "$value" ]]; do
        printf '  Enter %s%s: ' "$key" "${hint:+ ($hint)}"
        read -r -s value; printf '\n'
        [[ -z "$value" ]] && warn "Value cannot be empty."
    done
    printf '%s' "$value"
}

# ── Step 1: Vercel CLI ────────────────────────────────────────────────────────
info "Step 1/8: Vercel CLI"
if ! command -v vercel &>/dev/null; then
    warn "vercel not found — installing globally..."
    npm install -g vercel
fi
log "vercel $(vercel --version 2>/dev/null | head -1)"

# ── Step 2: Authentication ────────────────────────────────────────────────────
info "Step 2/8: Authentication"
if ! vercel whoami &>/dev/null; then
    warn "Not logged in. Running 'vercel login'..."
    vercel login
fi
log "Authenticated as: $(vercel whoami)"

# ── Step 3: Project link ──────────────────────────────────────────────────────
info "Step 3/8: Project link"
if [[ ! -f "$REPO_ROOT/.vercel/project.json" ]]; then
    cd "$REPO_ROOT" && vercel link
else
    PROJECT=$(grep -o '"projectName":"[^"]*"' "$REPO_ROOT/.vercel/project.json" | cut -d'"' -f4)
    log "Linked: $PROJECT${BRANCH:+ (branch: $BRANCH)}"
fi

# ── Step 4: .env check ───────────────────────────────────────────────────────
info "Step 4/8: .env"
[[ ! -f "$ENV_FILE" ]] && die ".env not found — copy .env.example first."
log "Reading: $ENV_FILE"

# ── Step 5: DATABASE_URL ─────────────────────────────────────────────────────
info "Step 5/8: DATABASE_URL"
DB_URL=$(env_var DATABASE_URL)
[[ -z "$DB_URL" ]] && die "DATABASE_URL not set in .env"
echo ""
echo "  Current DATABASE_URL points to your Neon database (likely production)."
echo "  y — use as-is (preview shares the production DB)"
echo "  n — enter a separate Neon branch connection string (recommended)"
echo ""
printf '  Use this DATABASE_URL for preview? [Y/n] '
read -r USE_DB
[[ "${USE_DB:-Y}" =~ ^[Nn]$ ]] && \
    DB_URL=$(prompt_secret DATABASE_URL "paste Neon branch connection string")
set_preview_var DATABASE_URL "$DB_URL"

# ── Step 6: Auth credentials ──────────────────────────────────────────────────
info "Step 6/8: Auth"

# BETTER_AUTH_SECRET: always generate fresh (never reuse production secret)
AUTH_SECRET=$(openssl rand -hex 32)
log "Generated BETTER_AUTH_SECRET: ${AUTH_SECRET:0:8}…"
set_preview_var BETTER_AUTH_SECRET "$AUTH_SECRET"

# BETTER_AUTH_URL: intentionally skipped for preview.
# better-auth reads baseURL from process.env.BETTER_AUTH_URL (packages/auth/index.ts:14).
# When unset, it auto-detects from the request Host header — correct for
# per-deployment dynamic Vercel URLs.
log "BETTER_AUTH_URL: skipped (auto-detect from Host header)"

# BETTER_AUTH_TRUSTED_ORIGINS: comma-split exact strings (no glob expansion).
# After first deploy, replace with the actual .vercel.app URL if CORS errors appear.
TRUSTED_ORIGINS=$(env_var BETTER_AUTH_TRUSTED_ORIGINS)
if [[ -n "$TRUSTED_ORIGINS" ]]; then
    set_preview_var BETTER_AUTH_TRUSTED_ORIGINS "$TRUSTED_ORIGINS"
else
    warn "BETTER_AUTH_TRUSTED_ORIGINS not in .env — skipping."
    warn "If CORS errors appear on preview, set it to the specific .vercel.app URL."
fi

# Google OAuth: reuse production app (or separate dev app if preferred)
GOOGLE_ID=$(env_var GOOGLE_CLIENT_ID)
GOOGLE_SECRET=$(env_var GOOGLE_CLIENT_SECRET)
[[ -z "$GOOGLE_ID" ]]     && die "GOOGLE_CLIENT_ID not set in .env"
[[ -z "$GOOGLE_SECRET" ]] && die "GOOGLE_CLIENT_SECRET not set in .env"
set_preview_var GOOGLE_CLIENT_ID     "$GOOGLE_ID"
set_preview_var GOOGLE_CLIENT_SECRET "$GOOGLE_SECRET"
warn "Add the preview redirect URI to Google Cloud Console OAuth client:"
warn "  https://<preview-url>/api/auth/callback/google"

# ── Step 7: Stripe (always prompt — never read from .env) ────────────────────
info "Step 7/8: Stripe (test-mode only)"
echo ""
echo "  ────────────────────────────────────────────────────────────"
echo "  DO NOT use sk_live_... keys here. Test mode only."
echo "  Stripe Dashboard (test mode): https://dashboard.stripe.com/test"
echo "  ────────────────────────────────────────────────────────────"
echo ""

STRIPE_KEY=$(prompt_secret STRIPE_SECRET_KEY "must start with sk_test_")
[[ "$STRIPE_KEY" != sk_test_* ]] && \
    die "STRIPE_SECRET_KEY must start with sk_test_ — refusing to set a live key in preview."
set_preview_var STRIPE_SECRET_KEY "$STRIPE_KEY"

echo ""
echo "  Webhook: Dashboard → Webhooks → Add endpoint"
echo "    URL:    https://<preview-url>/api/webhooks/stripe"
echo "    Events: checkout.session.completed, customer.subscription.*"
echo ""
STRIPE_WEBHOOK=$(prompt_secret STRIPE_WEBHOOK_SECRET "whsec_... from Stripe test webhook")
set_preview_var STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK"

echo ""
STRIPE_PRICE=$(prompt_secret STRIPE_PRO_PRICE_ID "price_... from Stripe test Products")
set_preview_var STRIPE_PRO_PRICE_ID "$STRIPE_PRICE"

# ── Step 8: Generated secrets + optional vars ─────────────────────────────────
info "Step 8/8: Remaining vars"

CRON_SECRET=$(openssl rand -hex 32)
log "Generated CRON_SECRET: ${CRON_SECRET:0:8}…"
set_preview_var CRON_SECRET "$CRON_SECRET"

SENTRY_DSN=$(env_var SENTRY_DSN)
PUBLIC_SENTRY_DSN=$(env_var PUBLIC_SENTRY_DSN)
if [[ -n "$SENTRY_DSN" ]]; then
    set_preview_var SENTRY_DSN "$SENTRY_DSN"
    [[ -n "$PUBLIC_SENTRY_DSN" ]] && set_preview_var PUBLIC_SENTRY_DSN "$PUBLIC_SENTRY_DSN"
else
    log "SENTRY_DSN not in .env — skipping"
fi

# ── Verify + summary ──────────────────────────────────────────────────────────
info "Verification"
vercel env ls --environment preview

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Preview env vars set. Next steps:"
echo ""
echo "  1. Trigger a preview deploy:  git push origin HEAD"
echo "  2. Verify auth on preview URL:"
echo "       npm run verify:auth -- --url=https://<preview-url>"
echo "  3. If OAuth redirect fails, set BETTER_AUTH_URL to the specific"
echo "     preview URL in the Vercel dashboard and redeploy."
echo "  4. Confirm the Stripe test webhook receives events from Vercel."
echo ""
