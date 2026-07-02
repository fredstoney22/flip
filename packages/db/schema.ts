import { pgTable, text, timestamp, boolean, integer, index, uniqueIndex } from 'drizzle-orm/pg-core';

export type SubscriptionStatus =
	| 'active'
	| 'trialing'
	| 'past_due'
	| 'canceled'
	| 'incomplete'
	| 'incomplete_expired'
	| 'unpaid'
	| 'paused';

export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	stripeCustomerId: text('stripe_customer_id'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at')
		.$onUpdate(() => new Date())
		.notNull()
});

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		activeOrganizationId: text('active_organization_id')
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const organization = pgTable(
	'organization',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		slug: text('slug').notNull().unique(),
		logo: text('logo'),
		createdAt: timestamp('created_at').notNull(),
		metadata: text('metadata')
	},
	(table) => [uniqueIndex('organization_slug_uidx').on(table.slug)]
);

export const member = pgTable(
	'member',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		role: text('role').default('member').notNull(),
		createdAt: timestamp('created_at').notNull()
	},
	(table) => [
		index('member_organizationId_idx').on(table.organizationId),
		index('member_userId_idx').on(table.userId)
	]
);

export const invitation = pgTable(
	'invitation',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		email: text('email').notNull(),
		role: text('role'),
		status: text('status').default('pending').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').notNull(),
		inviterId: text('inviter_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [
		index('invitation_organizationId_idx').on(table.organizationId),
		index('invitation_email_idx').on(table.email)
	]
);

export const subscription = pgTable(
	'subscription',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		stripeCustomerId: text('stripe_customer_id').notNull(),
		stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
		stripePriceId: text('stripe_price_id').notNull(),
		status: text('status').notNull(),
		cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
		currentPeriodEnd: timestamp('current_period_end').notNull(),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [
		index('subscription_userId_idx').on(table.userId),
		index('subscription_stripeCustomerId_idx').on(table.stripeCustomerId)
	]
);

/**
 * A puzzle pack. Metadata lives here; puzzle data lives in the `puzzle` table.
 * Multiple pack rows can share the same stripeProductId — that models a bundle.
 */
export const pack = pgTable(
	'pack',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		access: text('access').notNull().default('free'), // 'free' | 'paid'
		stripeProductId: text('stripe_product_id'),
		active: boolean('active').notNull().default(true),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at').notNull()
	},
	(t) => [uniqueIndex('pack_slug_uidx').on(t.slug)]
);

/** An individual puzzle belonging to a pack. Grid data stored as JSON strings. */
export const puzzle = pgTable(
	'puzzle',
	{
		id: text('id').primaryKey(),
		packId: text('pack_id')
			.notNull()
			.references(() => pack.id, { onDelete: 'cascade' }),
		puzzleNumber: integer('puzzle_number').notNull(),
		startState: text('start_state').notNull(),
		templates: text('templates').notNull(),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at').notNull()
	},
	(t) => [
		uniqueIndex('puzzle_pack_number_uidx').on(t.packId, t.puzzleNumber),
		index('puzzle_packId_idx').on(t.packId)
	]
);

/**
 * Tracks which packs a user has unlocked via Stripe.
 * One row per unlocked pack per user — a bundle purchase inserts multiple rows.
 */
export const packAccess = pgTable(
	'pack_access',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		packSlug: text('pack_slug').notNull(),
		stripeProductId: text('stripe_product_id'),
		stripeSessionId: text('stripe_session_id'),
		purchasedAt: timestamp('purchased_at').notNull()
	},
	(table) => [
		uniqueIndex('pack_access_user_pack_uidx').on(table.userId, table.packSlug),
		index('pack_access_userId_idx').on(table.userId)
	]
);

/** Stores the best move count for each puzzle a user has completed. */
export const puzzleProgress = pgTable(
	'puzzle_progress',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		packSlug: text('pack_slug').notNull(),
		puzzleId: integer('puzzle_id').notNull(),
		bestMoveCount: integer('best_move_count').notNull(),
		completedAt: timestamp('completed_at').notNull()
	},
	(table) => [
		uniqueIndex('progress_user_pack_puzzle_uidx').on(table.userId, table.packSlug, table.puzzleId),
		index('progress_userId_idx').on(table.userId)
	]
);

/** Persists one in-progress game state per user so they can resume later. */
export const savedGameState = pgTable('saved_game_state', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	packSlug: text('pack_slug').notNull(),
	puzzleId: integer('puzzle_id'),
	puzzleState: text('puzzle_state').notNull(),
	moveCount: integer('move_count').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

/**
 * Curated daily puzzles — one row per calendar date (YYYY-MM-DD).
 * Public; no auth required to read today's entry.
 */
export const dailyPuzzle = pgTable('daily_puzzle', {
	id: text('id').primaryKey(),
	date: text('date').notNull().unique(),
	packSlug: text('pack_slug'),
	puzzleId: integer('puzzle_id'),
	generatedConfig: text('generated_config'),
	generationKind: text('generation_kind'),
	createdAt: timestamp('created_at').notNull()
});
