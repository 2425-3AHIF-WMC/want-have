import Keycloak from "keycloak-js";

export const keycloak = Keycloak({
    url: 'https://auth.htl-leonding.ac.at',
    realm: 'htlleonding',
    clientId: 'htlleonding-service',
});
