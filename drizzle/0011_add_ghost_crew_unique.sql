ALTER TABLE `ghostCrewFriends` ADD CONSTRAINT `ghostCrewFriends_userId_friendId_unique` UNIQUE(`userId`, `friendId`);
