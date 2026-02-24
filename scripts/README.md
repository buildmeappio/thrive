# Scripts

Root-level scripts for local development, deployment, and tooling.

## Local infra (scripts/local.sh)

Docker-based local development: PostgreSQL instances + Keycloak.

| Command           | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `pnpm local:up`   | Start all (thrive-db, master-db, keycloak-db, keycloak) |
| `pnpm local:down` | Stop all                                                |
| `pnpm local:sync` | Sync all from remote via SSH tunnel                     |

Pass targets as args: `pnpm local:up thrive` or `pnpm local:sync master keycloak`.

**Services** (docker-compose.local.yml): thrive-db:5441, master-db:5442, keycloak-db:5443, Keycloak:8080.

**Sync** requires `.env.db` with SYNC\_\* vars (see `.env.db.example`).

## Other scripts

| Script                             | Description                                                        |
| ---------------------------------- | ------------------------------------------------------------------ |
| `scripts/connect-to-db.sh`         | Connect to RDS via bastion (dev env)                               |
| `scripts/create-deploy-tarball.sh` | Create deployment tarball for an app                               |
| `scripts/db-sync.sh`               | Sync thrive/master/keycloak DBs from remote (called by local:sync) |
