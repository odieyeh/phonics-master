CREATE TABLE `learningRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vocabularyId` int NOT NULL,
	`recordType` enum('word','sentence') NOT NULL,
	`studentAudioUrl` varchar(500) NOT NULL,
	`score` int NOT NULL,
	`performanceLevel` enum('excellent','good','keep_practicing') NOT NULL,
	`feedback` text NOT NULL,
	`aiAnalysis` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learningRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPracticeCount` int DEFAULT 0,
	`averageScore` decimal(5,2) DEFAULT '0',
	`excellentCount` int DEFAULT 0,
	`goodCount` int DEFAULT 0,
	`keepPracticingCount` int DEFAULT 0,
	`lastPracticeDate` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProgress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `vocabularies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(100) NOT NULL,
	`ipa` varchar(100) NOT NULL,
	`exampleSentence` text NOT NULL,
	`wordAudioUrl` varchar(500),
	`sentenceAudioUrl` varchar(500),
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vocabularies_id` PRIMARY KEY(`id`),
	CONSTRAINT `vocabularies_word_unique` UNIQUE(`word`)
);
