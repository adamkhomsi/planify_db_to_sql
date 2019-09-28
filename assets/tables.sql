-- ***************************************************;

DROP TABLE IF EXISTS `activities`;

CREATE TABLE `activities`
(
 `id`               int(11) NOT NULL,
 `id_shift`         int NOT NULL ,
 `id_activity_type` int NOT NULL ,
 `extends_day`      varchar(255) NULL DEFAULT 'no' ,
 `length_in_hours`  float NULL DEFAULT 1 ,
 `start_time`       varchar(255) NULL DEFAULT '00:00' 
);

ALTER TABLE `activities` ADD PRIMARY KEY (`id`);

ALTER TABLE `activities` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;

DROP TABLE IF EXISTS `activity_types`;

CREATE TABLE `activity_types`
(
 `id`               int(11) NOT NULL,
 `name`             varchar(255) NULL
);

ALTER TABLE `activity_types` ADD PRIMARY KEY (`id`);

ALTER TABLE `activity_types` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;

DROP TABLE IF EXISTS `agents`;

CREATE TABLE `agents`
(
 `id` int(11) NOT NULL,
 `id_team`              int NOT NULL ,
 `email`                varchar(255) NULL ,
 `name`                 varchar(255) NULL ,
 `role`                 varchar(255) NULL DEFAULT 'user' ,
 `all_schedule_access`  varchar(255) NULL DEFAULT 'no' ,
 `is_dev`               varchar(255) NULL DEFAULT 'no' ,
 `break_bg_color`       varchar(255) NULL DEFAULT '#113b7b',
 `break_text_color`     varchar(255) NULL DEFAULT '#ffffff',
 `custom_bg_color`      varchar(255) NULL DEFAULT '#ffb700',
 `custom_text_color`    varchar(255) NULL DEFAULT '#ffffff',
 `goalie_bg_color`      varchar(255) NULL DEFAULT '#017365',
 `goalie_text_color`    varchar(255) NULL DEFAULT '#ffffff',
 `meeting_bg_color`     varchar(255) NULL DEFAULT '#d8630c',
 `meeting_text_color`   varchar(255) NULL DEFAULT '#ffffff',
 `pool_bg_color`        varchar(255) NULL DEFAULT '#48bfc5',
 `pool_text_color`      varchar(255) NULL DEFAULT '#ffffff',
 `project_bg_color`     varchar(255) NULL DEFAULT '#8f1f51',
 `project_text_color`   varchar(255) NULL DEFAULT '#ffffff',
 `skill_bg_color`       varchar(255) NULL DEFAULT '#dd8480',
 `skill_text_color`     varchar(255) NULL DEFAULT '#ffffff',
 `default_start_hour`   varchar(255) NULL DEFAULT '10',
 `default_start_minute` varchar(255) NULL DEFAULT '0'
);

ALTER TABLE `agents` ADD PRIMARY KEY (`id`);

ALTER TABLE `agents` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;

DROP TABLE IF EXISTS `shift_statuses`;

CREATE TABLE `shift_statuses`
(
 `id`              int(11) NOT NULL,
 `name`            varchar(255) NULL DEFAULT 'working'
);

ALTER TABLE `shift_statuses` ADD PRIMARY KEY (`id`);

ALTER TABLE `shift_statuses` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;

DROP TABLE IF EXISTS `shifts`;

CREATE TABLE `shifts`
(
 `id` int(11) NOT NULL,
 `id_agent`        int NOT NULL ,
 `id_shift_status` int NOT NULL ,
 `date`            varchar(255) NULL DEFAULT '0000-00-00T00:00:00' ,
 `shift_start`     varchar(255) NULL DEFAULT '00:00' ,
 `extended_shift`  varchar(255) NULL DEFAULT 'no'
);

ALTER TABLE `shifts` ADD PRIMARY KEY (`id`);

ALTER TABLE `shifts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;

DROP TABLE IF EXISTS `team_stats`;

CREATE TABLE `team_stats`
(
 `id` int(11) NOT NULL,
 `id_team`      int NOT NULL ,
 `date`         varchar(255) NULL DEFAULT '0000-00-00' ,
 `break`        float NULL DEFAULT 0.00 ,
 `goalie`       float NULL DEFAULT 0.00 ,
 `meeting`      float NULL DEFAULT 0.00 ,
 `pool`         float NULL DEFAULT 0.00 ,
 `project`      float NULL DEFAULT 0.00 ,
 `skill`        float NULL DEFAULT 0.00
);

ALTER TABLE `team_stats` ADD PRIMARY KEY (`id`);

ALTER TABLE `team_stats` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;

DROP TABLE IF EXISTS `teams`;

CREATE TABLE `teams`
(
 `id`      int(11) NOT NULL,
 `name`    varchar(255) NULL ,
 `code`    varchar(255) NULL
);

ALTER TABLE `teams` ADD PRIMARY KEY (`id`);

ALTER TABLE `teams` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;

DROP TABLE IF EXISTS `zrt_data`;

CREATE TABLE `zrt_data`
(
 `id` int(11) NOT NULL,
 `region`                    varchar(255) NULL DEFAULT 'IR' ,
 `date`                      varchar(255) NULL DEFAULT '0000-00-00' ,
 `average_handle_time`       int NULL DEFAULT 0 ,
 `expected_incoming_tickets` int NULL DEFAULT 0 ,
 `ics_available`             int NULL DEFAULT 0 ,
 `tickets_in_pool`           int NULL DEFAULT 0 ,
 `pool_hours`                float NULL DEFAULT 0.00
);

ALTER TABLE `zrt_data` ADD PRIMARY KEY (`id`);

ALTER TABLE `zrt_data` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ***************************************************;
