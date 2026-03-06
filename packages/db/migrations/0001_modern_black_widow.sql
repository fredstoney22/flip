CREATE TABLE "pack" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"access" text DEFAULT 'free' NOT NULL,
	"stripe_product_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "puzzle" (
	"id" text PRIMARY KEY NOT NULL,
	"pack_id" text NOT NULL,
	"puzzle_number" integer NOT NULL,
	"start_state" text NOT NULL,
	"templates" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "puzzle" ADD CONSTRAINT "puzzle_pack_id_pack_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."pack"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pack_slug_uidx" ON "pack" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "puzzle_pack_number_uidx" ON "puzzle" USING btree ("pack_id","puzzle_number");--> statement-breakpoint
CREATE INDEX "puzzle_packId_idx" ON "puzzle" USING btree ("pack_id");