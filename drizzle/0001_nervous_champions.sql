CREATE TABLE `weeklyChallenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`xpReward` int NOT NULL DEFAULT 50,
	`completed` int NOT NULL DEFAULT 0,
	`weekStartDate` timestamp NOT NULL,
	`weekEndDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `weeklyChallenges_id` PRIMARY KEY(`id`)
);
