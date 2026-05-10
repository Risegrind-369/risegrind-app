CREATE TABLE `ghostCrewFriends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`friendId` varchar(255) NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ghostCrewFriends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `friendCode` varchar(6);--> statement-breakpoint
ALTER TABLE `users` ADD `displayName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_friendCode_unique` UNIQUE(`friendCode`);