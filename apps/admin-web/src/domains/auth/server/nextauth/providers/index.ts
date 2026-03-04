import { buildCredentials } from './credentials';
import { google } from './google';
import { keycloak } from './keycloak';

export function buildProviders() {
  return [buildCredentials(), google, keycloak];
}
