# GameFlex VPS storage deployment

This document explains how to deploy the GameFlex storage API on a clean Contabo VPS and keep it provider-agnostic.

## 1. Prerequisites

- Clean Ubuntu 22.04+ VPS
- SSH access
- Domain or subdomain such as `storage.gameflex.co.ke`
- HTTPS termination via Cloudflare or Nginx
- Node.js 20+
- `npm` or `pnpm`

## 2. Provisioning

Run the provisioning script from the repo root on the VPS:

```bash
chmod +x scripts/provision-vps-storage.sh
sudo ./scripts/provision-vps-storage.sh
```

The script is idempotent and will:

- create `/var/lib/gameflex-storage`
- create logical bucket directories
- create a dedicated `gameflex-storage` system user
- set secure ownership and permissions
- install runtime dependencies
- configure the storage API service
- configure health checks
- configure log rotation
- create the systemd unit

## 3. Storage root

```text
/var/lib/gameflex-storage/
├── avatars/
├── posts/
├── stories/
├── shorts/
├── messages/
├── tournaments/
├── achievements/
├── rewards/
├── marketplace/
└── .keep
```

This is a logical bucket layout. The app never writes raw filesystem paths; it only uses the storage abstraction and logical bucket names.

## 4. Storage API runtime

The API should run behind a reverse proxy such as Nginx with authentication and TLS enabled.

Typical environment variables on the VPS:

```bash
NODE_ENV=production
STORAGE_API_URL=https://storage.gameflex.co.ke
STORAGE_PUBLIC_URL=https://storage.gameflex.co.ke
STORAGE_ROOT=/var/lib/gameflex-storage
STORAGE_MAX_UPLOAD_BYTES=10485760
STORAGE_JWT_AUDIENCE=gameflex-storage
SUPABASE_URL=https://feyfligmnghsmpsazpdc.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## 5. systemd

The service is managed by systemd. Typical commands:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gameflex-storage
sudo systemctl start gameflex-storage
sudo systemctl status gameflex-storage
sudo journalctl -u gameflex-storage -f
```

## 6. Health endpoint

The storage API should expose a health check such as:

```text
GET https://storage.gameflex.co.ke/health
```

The response should contain a safe, public summary only: provider status, API readiness, disk/volume health, and bucket status.

Do not expose secrets or internal file paths.

## 7. Reverse proxy

Nginx should route HTTPS traffic to the local storage API port and reject unsafe requests.

Example conceptual upstream:

```nginx
location / {
  proxy_pass http://127.0.0.1:4123;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto https;
}
```

## 8. Cloudflare DNS

Create a DNS record for the storage subdomain:

```text
Type: A
Name: storage
Value: <VPS_IP>
Proxy status: DNS only or proxied per deployment design
```

If Cloudflare proxying is enabled, the storage origin should still terminate HTTPS at Cloudflare and then route to the VPS over TLS origin settings. The application should not hardcode the VPS IP in source code.

## 9. Backups

- Store database backups separately from media backups.
- Do not use the primary storage root as the backup target.
- Retain backup procedures outside the active storage path.
- Never auto-delete active media during backup jobs.

## 10. Rollback

- stop the service
- restore the last known-good config
- restore the previous version of the API
- verify health and object retrieval
- restart the service

## 11. Security notes

- Never expose the filesystem root to the browser.
- Validate JWTs and authorization on the storage API.
- Enforce upload size and MIME constraints.
- Reject path traversal and unsafe object keys.
- Keep all secrets in the server environment and never in source control.
