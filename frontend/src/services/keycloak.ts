
import Keycloak, { KeycloakInstance } from "keycloak-js";

// Workaround für TS: Keycloak.js erwartet dieselbe Signatur.
const KeycloakConstructor = Keycloak as unknown as {
    new (config: { url: string; realm: string; clientId: string }): KeycloakInstance;
};

export const keycloak: KeycloakInstance = new KeycloakConstructor({
    url: "https://auth.htl-leonding.ac.at",
    realm: "htlleonding",
    clientId: "htlleonding-service",
});
