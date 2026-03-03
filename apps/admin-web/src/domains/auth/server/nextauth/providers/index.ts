import { buildCredentials } from './credentials';
import { google } from './google';
import { keycloak } from './keycloak';

export function buildProviders(slug: string | null) {
  return [buildCredentials(slug), google, keycloak];
}
