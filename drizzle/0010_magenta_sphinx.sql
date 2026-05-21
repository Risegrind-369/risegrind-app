CREATE TABLE `habitCompletions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`habitClientId` varchar(255) NOT NULL,
	`date` varchar(10) NOT NULL,
	`completedAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habitCompletions_id` PRIMARY KEY(`id`),
	CONSTRAINT `habitCompletions_userId_habitClientId_date_unique` UNIQUE(`userId`,`habitClientId`,`date`)
);
--> statement-breakpoint
CREATE TABLE `journalEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`clientId` varchar(255) NOT NULL,
	`date` varchar(10) NOT NULL,
	`content` text NOT NULL,
	`prompt` text NOT NULL,
	`moodLevel` int,
	`createdAt` bigint NOT NULL,
	`syncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journalEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `journalEntries_userId_clientId_unique` UNIQUE(`userId`,`clientId`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`achievementId` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(10) NOT NULL,
	`unlockedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `userAchievements_userId_achievementId_unique` UNIQUE(`userId`,`achievementId`)
);
--> statement-breakpoint
CREATE TABLE `userHabits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`clientId` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(10) NOT NULL,
	`durationMin` int NOT NULL DEFAULT 0,
	`isDefault` boolean NOT NULL DEFAULT false,
	`order` int NOT NULL DEFAULT 0,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userHabits_id` PRIMARY KEY(`id`),
	CONSTRAINT `userHabits_userId_clientId_unique` UNIQUE(`userId`,`clientId`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`streak` int NOT NULL DEFAULT 0,
	`lastActiveDate` varchar(10),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userSideQuests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`questId` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(10) NOT NULL,
	`durationDays` int NOT NULL,
	`xpReward` int NOT NULL,
	`badgeId` varchar(255) NOT NULL,
	`category` enum('discipline','wellness','mindset','body') NOT NULL,
	`startedAt` bigint,
	`completedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSideQuests_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSideQuests_userId_questId_unique` UNIQUE(`userId`,`questId`)
);
