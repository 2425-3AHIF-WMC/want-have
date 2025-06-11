import "keycloak-js";

declare module "keycloak-js" {
    interface KeycloakInitOptions {
        pkceMethod?: string;
        flow?: string;
    }
}
