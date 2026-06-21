import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
export * from './schema';
export * from 'drizzle-orm';

type Schema = typeof schema;

let _db: PostgresJsDatabase<Schema> | undefined;
let _client: ReturnType<typeof postgres> | undefined;

function createPostgresClient() {
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	// Neon pooler + long-lived dev servers: stale TLS sockets cause ECONNRESET.
	return postgres(process.env.DATABASE_URL, {
		prepare: false,
		idle_timeout: 20,
		max_lifetime: 60 * 30,
		connect_timeout: 10
	});
}

function getDb(): PostgresJsDatabase<Schema> {
	if (!_db) {
		_client = createPostgresClient();
		_db = drizzle(_client, { schema });
	}
	return _db;
}

export const db = new Proxy({} as PostgresJsDatabase<Schema>, {
	get(_target, prop) {
		return getDb()[prop as keyof PostgresJsDatabase<Schema>];
	}
});
