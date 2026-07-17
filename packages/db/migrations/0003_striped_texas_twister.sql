ALTER TABLE "daily_puzzle" ALTER COLUMN "pack_slug" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_puzzle" ALTER COLUMN "puzzle_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_puzzle" ADD COLUMN "generated_config" text;--> statement-breakpoint
ALTER TABLE "daily_puzzle" ADD COLUMN "generation_kind" text;