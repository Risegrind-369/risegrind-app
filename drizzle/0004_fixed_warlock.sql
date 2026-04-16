CREATE TABLE `futureLetters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`reason` text NOT NULL,
	`mantra` text,
	`lastShownAt` timestamp,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `futureLetters_id` PRIMARY KEY(`id`),
	CONSTRAINT `futureLetters_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `habitStacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`anchorHabitId` varchar(255) NOT NULL,
	`stackedHabitId` varchar(255) NOT NULL,
	`instruction` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`completionCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `habitStacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `motivationalQuotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quote` text NOT NULL,
	`author` varchar(255),
	`category` enum('quit-prevention','daily','milestone','custom') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`showCount` int NOT NULL DEFAULT 0,
	`lastShownAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `motivationalQuotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weeklyReminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStartDate` date NOT NULL,
	`letterIdShown` int,
	`quoteIdShown` int,
	`weeklySummary` text,
	`wasViewed` boolean NOT NULL DEFAULT false,
	`viewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weeklyReminders_id` PRIMARY KEY(`id`)
);
