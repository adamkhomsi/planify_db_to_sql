const moment = require("moment");
const fs = require("fs");
const db = require("./assets/db.json");
const tables = fs.readFileSync("./assets/tables.sql").toString();

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

const __shift_statuses = [];
const __activity_types = [];
const __teams = [];
const __agents = [];
const __shifts = [];
const __activities = [];

const activity_types_keys = Object.keys(activity_types);
activity_types_keys.map(activity_type => {
  const activity_type_id = activity_types[activity_type];
  __activity_types.push(`(${activity_type_id}, '${activity_type}')`);
});

const shift_status_keys = Object.keys(shift_statuses);
shift_status_keys.map(shift_status => {
  const shift_status_id = shift_statuses[shift_status];
  __shift_statuses.push(`(${shift_status_id}, '${shift_status}')`);
});

const { teams, agents, settings } = db;

const team_names = Object.keys(teams);

for (let team_key in team_names) {
  const team_name = team_names[team_key];
  const team = teams[team_name];
  __teams.push(
    `(${parseInt(team_key) + 1}, '${team_name}', '${team.team_code}')`
  );
}

const agent_emails = Object.keys(agents);

for (let agent_key in agent_emails) {
  const agent_email = agent_emails[agent_key];
  const agent = agents[agent_email];
  const parsed_email = agent_email.replace(/,/g, ".");
  const team_id = team_names.indexOf(agent.team);

  const agent_settings = settings[agent_email] || {};
  const event_colors = agent_settings.event_colors || {};

  __agents.push(
    `(${parseInt(agent_key) + 1}, ${team_id + 1}, '${parsed_email}', '${
      agent.name
    }', '${agent.role}', '${
      agent.role === "lead" || dev_emails.includes(parsed_email) ? "yes" : "no"
    }', '${dev_emails.includes(parsed_email) ? "yes" : "no"}', ${
      event_colors.Break ? `'${event_colors.Break.background}'` : "NULL"
    }, ${event_colors.Break ? `'${event_colors.Break.text}'` : "NULL"}, ${
      event_colors.Custom ? `'${event_colors.Custom.background}'` : "NULL"
    }, ${event_colors.Custom ? `'${event_colors.Custom.text}'` : "NULL"}, ${
      event_colors.Goalie ? `'${event_colors.Goalie.background}'` : "NULL"
    }, ${event_colors.Goalie ? `'${event_colors.Goalie.text}'` : "NULL"}, ${
      event_colors.Meeting ? `'${event_colors.Meeting.background}'` : "NULL"
    }, ${event_colors.Meeting ? `'${event_colors.Meeting.text}'` : "NULL"}, ${
      event_colors.Pool ? `'${event_colors.Pool.background}'` : "NULL"
    }, ${event_colors.Pool ? `'${event_colors.Pool.text}'` : "NULL"}, ${
      event_colors.Project ? `'${event_colors.Project.background}'` : "NULL"
    }, ${event_colors.Project ? `'${event_colors.Project.text}'` : "NULL"}, ${
      event_colors.Skill ? `'${event_colors.Skill.background}'` : "NULL"
    }, ${
      event_colors.Skill ? `'${event_colors.Skill.text}'` : "NULL"
    }, "10", "0")`
  );
}

let shift_id = 0;
let activity_id = 0;
console.log({ agent_emails });
console.log({ agent_emails: agent_emails.length });
for (let agent_key in agent_emails) {
  const agent_email = agent_emails[agent_key];
  const agent = agents[agent_email];

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

          if (day.activities) {
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

            console.log({ agent_email });
            console.log(`${agent_key + 1} SHIFT — ${shift_start}`);
            console.log();

            __shifts.push(
              `(${shift_id++ + 1}, ${parseInt(agent_key) +
                1}, ${shift_status_id}, '${date}', '${shift_start}', '${extended_shift}')`
            );

            const { activities } = day;
            const activity_keys = Object.keys(activities);
            for (let activity_key in activity_keys) {
              const activity = activities[activity_keys[activity_key]];
              if (activity) {
                __activities.push(
                  `(${activity_id++ + 1}, ${shift_id}, ${
                    activity_types[activity.activity]
                  }, '${activity.extends_day ? "yes" : "no"}', '${
                    activity.length
                  }', '${activity.start}')`
                );
              }
            }
          }
        }
      }
    }
  }
}

let __sql = `
INSERT INTO teams (id, name, code) VALUES ${__teams.join(", ")};

INSERT INTO activity_types (id, name) VALUES ${__activity_types.join(", ")};

INSERT INTO shift_statuses (id, name) VALUES ${__shift_statuses.join(", ")};

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
) VALUES ${__agents.join(", ")};

INSERT INTO shifts (
    id,
    id_agent,
    id_shift_status,
    date,
    shift_start,
    extended_shift
) VALUES ${__shifts.join(", ")};

INSERT INTO activities (
    id,
    id_shift,
    id_activity_type,
    extends_day,
    length_in_hours,
    start_time
) VALUES ${__activities.join(", ")};
`;

fs.writeFile("output.sql", tables + __sql, error => {
  if (error) console.log(error);
});
