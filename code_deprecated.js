const moment = require("moment");
const fs = require("fs");
const db = require("./db.json");

const dev_emails = [
  "brydon.mccluskey@shopify.com",
  "adrian.corcoran@shopify.com"
];

const shift_statuses = {
  Working: 1,
  Lieu: 2,
  Vacation: 3,
  Personal: 4
};

const activity_types = {
  Pool: 1,
  Goalie: 2,
  Break: 3,
  Project: 4,
  Skill: 5,
  Meeting: 6,
  Custom: 7
};

let sql = `
-- ACTIVITY TYPES
INSERT INTO activity_types (id, name) VALUES (1, 'Pool');
INSERT INTO activity_types (id, name) VALUES (2, 'Goalie');
INSERT INTO activity_types (id, name) VALUES (3, 'Break');
INSERT INTO activity_types (id, name) VALUES (4, 'Project');
INSERT INTO activity_types (id, name) VALUES (5, 'Skill');
INSERT INTO activity_types (id, name) VALUES (6, 'Meeting');
INSERT INTO activity_types (id, name) VALUES (7, 'Custom');\n
-- END ACTIVITY TYPES

-- SHIFT STATUSES
INSERT INTO shift_status (id, name) VALUES (1, 'Working');
INSERT INTO shift_status (id, name) VALUES (2, 'Lieu');
INSERT INTO shift_status (id, name) VALUES (3, 'Vacation');
INSERT INTO shift_status (id, name) VALUES (4, 'Personal');\n
-- END SHIFT STATUSES\n\n`;
const add_sql = new_sql => {
  sql += `${new_sql}\n`;
};

const { teams, agents, permissions, settings } = db;

// teams
const team_names = Object.keys(teams);

add_sql("-- TEAMS");
for (let team_key in team_names) {
  const team_name = team_names[team_key];
  const team = teams[team_name];
  add_sql(`
INSERT INTO teams (
  id,
  name,
  code
) VALUES (
  ${parseInt(team_key) + 1},
  '${team_name}',
  '${team.team_code}'
);`);
}
add_sql("-- END TEAMS\n\n");

// agents
const agent_emails = Object.keys(agents);

add_sql("-- AGENTS");
//! Add permissiont to user model
for (let agent_key in agent_emails) {
  const agent_email = agent_emails[agent_key];
  const agent = agents[agent_email];
  const parsed_email = agent_email.replace(/,/g, ".");
  const team_id = team_names.indexOf(agent.team);

  const agent_settings = settings[agent_email] || {};
  const event_colors = agent_settings.event_colors || {};

  add_sql(`
INSERT INTO agents (
  id,
  id_team,
  email,
  name,
  role,
  all_schedule_access,
  is_dev,
  break_bg_color,
  break_text_color,
  custom_bg_color,
  custom_text_color,
  goalie_bg_color,
  goalie_text_color,
  meeting_bg_color,
  meeting_text_color,
  pool_bg_color,
  pool_text_color,
  project_bg_color,
  project_text_color,
  skill_bg_color,
  skill_text_color,
  default_start_hour,
  default_start_minute
) VALUES (
  ${agent_key},
  ${team_id + 1},
  '${parsed_email}',
  '${agent.name}',
  '${agent.role}',
  '${
    agent.role === "lead" || dev_emails.includes(parsed_email) ? "yes" : "no"
  }',
  '${dev_emails.includes(parsed_email) ? "yes" : "no"}',
  ${event_colors.Break ? `'${event_colors.Break.background}'` : "NULL"},
  ${event_colors.Break ? `'${event_colors.Break.text}'` : "NULL"},
  ${event_colors.Custom ? `'${event_colors.Custom.background}'` : "NULL"},
  ${event_colors.Custom ? `'${event_colors.Custom.text}'` : "NULL"},
  ${event_colors.Goalie ? `'${event_colors.Goalie.background}'` : "NULL"},
  ${event_colors.Goalie ? `'${event_colors.Goalie.text}'` : "NULL"},
  ${event_colors.Meeting ? `'${event_colors.Meeting.background}'` : "NULL"},
  ${event_colors.Meeting ? `'${event_colors.Meeting.text}'` : "NULL"},
  ${event_colors.Pool ? `'${event_colors.Pool.background}'` : "NULL"},
  ${event_colors.Pool ? `'${event_colors.Pool.text}'` : "NULL"},
  ${event_colors.Project ? `'${event_colors.Project.background}'` : "NULL"},
  ${event_colors.Project ? `'${event_colors.Project.text}'` : "NULL"},
  ${event_colors.Skill ? `'${event_colors.Skill.background}'` : "NULL"},
  ${event_colors.Skill ? `'${event_colors.Skill.text}'` : "NULL"},
);`);
}
add_sql("-- END AGENTS\n\n");

// shifts
add_sql("-- SHIFTS");
let shift_id = 0;
for (let agent_key in agent_emails) {
  const agent_email = agent_emails[agent_key];
  const agent = agents[agent_email];
  const parsed_email = agent_email.replace(/,/g, ".");

  add_sql(`/* ${agent.name} (${parsed_email}) */`);

  if (agent.list) {
    const month_keys = Object.keys(agent.list);
    for (let month_key in month_keys) {
      const month = agent.list[month_keys[month_key]];
      const week_keys = Object.keys(month);

      for (let week_key in week_keys) {
        const week = month[week_keys[week_key]];
        const day_keys = Object.keys(week);

        for (let day_key in day_keys) {
          const day = week[day_keys[day_key]];

          if (!day.activities)
            add_sql(`-- NO ACTIVITIES, SKIPPING ${day_keys[day_key]}`);
          else {
            const shift_status_id = shift_statuses[day.status || "Working"];
            const { extended_shift: is_extended_shift, shift_start } = day;
            const moment_date = moment(
              day_keys[day_key].replace(/-[A-Z].*/, ""),
              "M-D-yyyy"
            );
            const date = moment_date.format();
            const extended_shift =
              is_extended_shift === undefined
                ? "no"
                : is_extended_shift === true
                ? "yes"
                : "no";

            add_sql(`
INSERT INTO shifts (
  id,
  id_agent,
  id_shift_status,
  date,
  shift_start,
  extended_shift
) VALUES (
  ${shift_id++},
  ${agent_key},
  ${shift_status_id},
  '${date}',
  '${shift_start}',
  '${extended_shift}'
);`);

            add_sql(`-- DAY ACTIVITIES FOR ${agent.name} (${parsed_email})`);

            const { activities } = day;
            const activity_keys = Object.keys(activities);
            for (let activity_key in activity_keys) {
              const activity = activities[activity_keys[activity_key]];
              if (activity) {
                add_sql(`
INSERT INTO activities (
  id,
  id_shift,
  id_activity_type,
  extends_day,
  length_in_hours,
  start_time
) VALUES (
  ${activity_key},
  ${shift_id},
  ${activity_types[activity.activity]},
  '${activity.extends_day ? "yes" : "no"}',
  '${activity.length}',
  '${activity.start}'
);`);
              }
            }

            add_sql(
              `-- END DAY ACTIVITIES FOR ${agent.name} (${parsed_email})`
            );
          }
        }
      }
    }
  }

  add_sql(`-- END ${agent.name}`);
}

add_sql("-- END SHIFTS\n\n");

const redacted_comments = sql.replace(/--.*\n/g, "");
fs.writeFile("output.sql", sql, error => {
  if (error) console.log(error);
});
