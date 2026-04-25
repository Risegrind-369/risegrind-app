CREATE TABLE `emotionalCheckIns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`mood` int NOT NULL,
	`energy` int NOT NULL,
	`stress` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotionalCheckIns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `habitRecommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`habitId` varchar(255) NOT NULL,
	`reason` text NOT NULL,
	`rank` int NOT NULL,
	`accepted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `habitRecommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentorChats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`mentorPersonality` varchar(50) NOT NULL DEFAULT 'supportive',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mentorChats_id` PRIMARY KEY(`id`)
);
