import pool from "../db/pool";

export async function syncKeycloakUser(token: any) {
    const keycloakId = token.sub;
    const email = token.email;
    const username = token.preferred_username || token.name || email;

    const existing = await pool.query('SELECT * FROM "user" WHERE keycloak_id = $1', [keycloakId]);

    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const insert = await pool.query(
        'INSERT INTO "user" (username, email, keycloak_id) VALUES ($1, $2, $3) RETURNING *',
        [username, email, keycloakId]
    );
    return insert.rows[0];
}
