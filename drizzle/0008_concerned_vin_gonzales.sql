ALTER TABLE `users` ADD `supabase_user_id` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_supabase_user_id_unique` UNIQUE(`supabase_user_id`);