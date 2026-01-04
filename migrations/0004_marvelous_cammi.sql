ALTER TABLE "email_logs" DROP CONSTRAINT "email_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;