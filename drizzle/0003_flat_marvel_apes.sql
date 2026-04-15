CREATE TABLE `healthData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`sleepHours` decimal(4,2),
	`steps` int,
	`activeEnergy` int,
	`morningEnergyScore` int,
	`lastSyncedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthData_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missedHabitReasons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`habitId` varchar(255) NOT NULL,
	`missedDate` date NOT NULL,
	`reason` text NOT NULL,
	`aiResponse` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `missedHabitReasons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recoveryQuests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`habitId` varchar(255) NOT NULL,
	`missedDate` date NOT NULL,
	`questDescription` text NOT NULL,
	`durationMin` int NOT NULL DEFAULT 5,
	`completed` int NOT NULL DEFAULT 0,
	`streakRecoveryPercent` int NOT NULL DEFAULT 50,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `recoveryQuests_id` PRIMARY KEY(`id`)
);
