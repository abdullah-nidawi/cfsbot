# CfsBot

CfsBot is a Discord server bot with per-server XP and ranks, anonymous confession posting, lightweight moderation tools, and interactive community activities. It uses Discord.js and MongoDB so server settings and member progress persist between restarts.

## Features

- **Leveling:** members earn random XP from messages, with a per-member, per-server cooldown. Level-up notices use the server's configured channel.
- **Ranks and leaderboards:** view a rank card, check the top 15 members, and choose whether your rank appears on the leaderboard with `/leaderboard-privacy`.
- **Confessions:** submit a confession in the configured channel. Posts suppress Discord mentions, and the command applies a cooldown.
- **Moderation:** `/warn` records a warning, `/timeout` applies a timed Discord timeout, and `/warnings` displays recent actions. Actions can be sent to an optional moderation log channel.
- **Entertainment:** `/trivia` offers a private multiple-choice question, `/poll` creates a two-choice poll, and `/coinflip` flips a coin.
- **Server configuration:** `/setup-channels` configures confession, level-up, and optional moderation log channels. It updates the existing server configuration when run again.

## Requirements

- Node.js 18.16 or later
- A Discord application and bot
- A MongoDB database reachable from the host running CfsBot

## Setup

1. Clone the repository and install locked dependencies:

   ```sh
   npm ci
   ```

2. Copy `.env.example` to `.env` and fill in the values:

   ```env
   BOT_TOKEN=your_discord_bot_token
   MGDB_URI=your_mongodb_connection_uri
   DEV_USER_ID=your_discord_user_id
   TEST_SERVER_ID=your_test_server_id
   ```

   `DEV_USER_ID` and `TEST_SERVER_ID` are optional. The former enables `/ping`; the latter registers slash commands only in that server for quick testing. Without `TEST_SERVER_ID`, commands register globally. Keep `.env` private; it is ignored by Git.

3. In the Discord Developer Portal, enable the **Message Content Intent**. Invite the bot with the `bot` and `applications.commands` OAuth scopes.

4. Grant the bot permissions to view and send messages, embed links, and attach files in the channels it uses. For timeouts, it also needs **Moderate Members**, and its highest role must be above the member it is timing out.

5. Start the bot:

   ```sh
   npm start
   ```

6. In the server, run `/setup-channels` as a member with **Manage Server** permission. Choose the confession and level-up channels, and optionally a moderation log channel.

For local development, use `npm run dev`.

## Commands

| Command | Access | Description |
| --- | --- | --- |
| `/ping` | Developer ID in `DEV_USER_ID` | Check that the bot responds. |
| `/setup-channels` | Manage Server | Configure confession, level-up, and moderation log channels. |
| `/rank [user]` | Configured level-up channel | View your rank card or another member's public rank. |
| `/leaderboard` | Configured level-up channel | Show the 15 highest-ranked visible members. |
| `/leaderboard-privacy hide` | Server member | Opt out of or back into the leaderboard. |
| `/givexp user xp` | Manage Server | Give a member a positive whole-number XP amount. |
| `/resetxp user` | Manage Server | Reset a member's XP and level. |
| `/confess confession` | Configured confession channel | Publish a confession without allowing mentions to ping users. |
| `/warn user [reason]` | Moderate Members | Record a warning. |
| `/timeout user minutes [reason]` | Moderate Members | Apply a timeout from 1 minute to 28 days. |
| `/warnings user` | Moderate Members | View the 10 most recent moderation actions. |
| `/trivia` | Server member | Answer a private trivia question. |
| `/poll question option-one option-two [minutes]` | Server member | Open a two-choice poll; voters can change their vote. |
| `/coinflip` | Server member | Flip a coin. |

## Data and privacy

XP and channel configuration are stored per server. Moderation actions store the member, moderator, action type, reason, and timestamp. Confessions are posted anonymously to members in the channel, but the database stores the submitter ID to enforce the cooldown. A member can hide their rank from the leaderboard; their XP continues to accumulate.

Poll votes are held in memory while the bot is running, so restarting the bot closes active polls. Trivia answers are ephemeral and are not stored.

## Tests

Run the unit tests with:

```sh
npm test
```
