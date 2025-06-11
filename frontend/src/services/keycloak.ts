import Keycloak from "keycloak-js";
import type { KeycloakInstance, KeycloakInitOptions } from "keycloak-js";

const keycloak = new (Keycloak as any)({
    url: "https://auth.htl-leonding.ac.at",
    realm: "htlleonding",
    clientId: "htlleonding-service",
}) as KeycloakInstance;

let initPromise: Promise<boolean> | undefined;

export const initKeycloak = (): Promise<boolean> => {
    if (!initPromise) {
        const options: KeycloakInitOptions = {
            onLoad: "login-required",
            checkLoginIframe: false,
            pkceMethod: "S256",
            flow: "standard",
        };

        initPromise = new Promise((resolve, reject) => {
            (keycloak.init(options) as unknown as Promise<boolean>)
                .then((authenticated) => {
                    console.log("✅ Keycloak authenticated:", authenticated);
                    resolve(authenticated);
                })
                .catch((error) => {
                    console.error("❌ Keycloak init error:", error);
                    reject(error);
                });
        });
    }

    return initPromise;
};

export { keycloak };
