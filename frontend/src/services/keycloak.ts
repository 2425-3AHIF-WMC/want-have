import Keycloak, { KeycloakInstance } from 'keycloak-js';

// Workaround to suppress TS error
const KeycloakConstructor = Keycloak as unknown as {
    new (config: any): KeycloakInstance;
};

export const keycloak: KeycloakInstance = new KeycloakConstructor({
    url: 'https://auth.htl-leonding.ac.at',
    realm: 'htlleonding',
    clientId: 'htlleonding-service',
});
