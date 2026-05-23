CREATE TABLE `aiUsageLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`feature` varchar(50) NOT NULL,
	`model` varchar(50) NOT NULL,
	`inputTokens` int NOT NULL DEFAULT 0,
	`outputTokens` int NOT NULL DEFAULT 0,
	`estimatedCostUsd` decimal(8,6) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiUsageLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userProgress` ADD `mentorMessagesUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `userProgress` ADD `mentorMessagesResetAt` timestamp DEFAULT (now()) NOT NULL;