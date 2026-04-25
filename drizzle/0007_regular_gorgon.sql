CREATE TABLE `accountabilityPartners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`partnerId` int NOT NULL,
	`status` enum('pending','accepted','rejected','ended') NOT NULL DEFAULT 'pending',
	`matchScore` int,
	`commonGoals` text,
	`startDate` date,
	`endDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountabilityPartners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challengeParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`userId` int NOT NULL,
	`completionRate` int DEFAULT 0,
	`status` enum('active','completed','failed','abandoned') DEFAULT 'active',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `challengeParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityChallenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`groupId` int,
	`habitId` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`participantCount` int DEFAULT 0,
	`reward` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communityChallenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `groupMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','moderator','admin') DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `groupMembers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboardEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int,
	`consistencyScore` int DEFAULT 0,
	`currentStreak` int DEFAULT 0,
	`longestStreak` int DEFAULT 0,
	`completedHabits` int DEFAULT 0,
	`totalHabits` int DEFAULT 0,
	`rank` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboardEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentorGroups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`creatorId` int NOT NULL,
	`habitFocus` varchar(100),
	`memberCount` int DEFAULT 1,
	`visibility` enum('public','private') DEFAULT 'public',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mentorGroups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sharedInsights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`groupId` int,
	`insight` text NOT NULL,
	`habitId` varchar(255),
	`likes` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`visibility` enum('public','group','private') DEFAULT 'group',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sharedInsights_id` PRIMARY KEY(`id`)
);
