CREATE TABLE `echoJournalViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalEntryId` varchar(255) NOT NULL,
	`daysBack` int NOT NULL,
	`growthHighlights` text,
	`shownAt` timestamp NOT NULL DEFAULT (now()),
	`wasMeaningful` boolean NOT NULL DEFAULT false,
	CONSTRAINT `echoJournalViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ghostMirrors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStartDate` date NOT NULL,
	`visualization` text NOT NULL,
	`streakAtGeneration` int NOT NULL,
	`xpAtGeneration` int NOT NULL,
	`viewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ghostMirrors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moodSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`moodLevel` int NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moodSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routineCancellations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`wasCancelled` boolean NOT NULL DEFAULT false,
	`wasReachieved` boolean NOT NULL DEFAULT false,
	`xpMultiplier` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `routineCancellations_id` PRIMARY KEY(`id`)
);
