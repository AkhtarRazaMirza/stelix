# Stelix Command Center

Stelix Command Center is a productivity workspace that brings Gmail, Google Calendar, and AI-assisted workflows into a single application.

The project started from a simple observation: a surprising amount of our work happens between email and calendar. A typical workflow often involves reading an email, checking availability, creating a calendar event, sending a follow-up, and then returning to the inbox again. None of these steps are particularly difficult, but constantly switching between tools creates unnecessary friction.

I wanted to explore whether those workflows could be handled from one place while keeping the flexibility and reliability of the tools people already use. Instead of replacing Gmail or Google Calendar, Stelix sits on top of them and provides a more workflow-focused experience.

Built with Next.js, Express, PostgreSQL, TypeScript, and Corsair integrations, Stelix is an experiment in building a modern command center for communication, scheduling, and productivity.


## Why I Built This

Most productivity tools are designed around data.

Email applications manage emails.

Calendar applications manage events.

Task applications manage tasks.

In reality, work doesn't happen in separate categories. A meeting usually starts with an email. An email often requires a follow-up meeting. Decisions made in meetings generate new actions and conversations.

I wanted to build something that focuses on workflows rather than individual tools.

The goal of Stelix is to reduce context switching and make common productivity actions faster by bringing communication, scheduling, and AI assistance into a single workspace.


## What It Can Do

### Email Management

Users can connect their Gmail account and manage their inbox directly from the application.

Current functionality includes:

- Viewing inbox messages
- Reading email threads
- Searching emails
- Composing new emails
- Sending emails

### Calendar Management

Google Calendar is integrated directly into the workspace.

Users can:

- View upcoming events
- Create calendar events
- Update existing events
- Remove events when plans change

### AI Assistant

The AI assistant provides a natural language interface for common productivity workflows.

For example:

> Schedule a meeting with john@example.com tomorrow at 4 PM and send them a confirmation email.

Instead of manually navigating between different interfaces, users can describe what they want to do and let the assistant handle the workflow.

### Unified Workspace

The dashboard provides a central place to view:

- Email activity
- Upcoming meetings
- Daily priorities
- Recent actions

## Tech Stack

### Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* React Hook Form
* Zod

### Backend

* Express.js
* TypeScript
* REST API Architecture
* JWT Authentication

### Database

* PostgreSQL
* Drizzle ORM

### Integrations

* Corsair
* Gmail
* Google Calendar

### AI

* Groq
* AI-powered workflow execution
* Natural language command processing


## Project Structure

```text
client/
├── app/
│   ├── agent/
│   ├── assistant/
│   ├── calendar/
│   ├── command-center/
│   ├── dashboard/
│   ├── inbox/
│   ├── login/
│   ├── mail/
│   ├── settings/
│   └── signup/
│
├── components/
│   ├── agent/
│   ├── calendar/
│   ├── command-center/
│   ├── email/
│   ├── landing/
│   ├── layout/
│   ├── mail/
│   └── ui/
│
├── hooks/
├── lib/
└── types/

server/
└── src/
    ├── agents/
    ├── config/
    ├── controllers/
    ├── db/
    ├── middleware/
    ├── repositories/
    ├── routes/
    └── services/
```


## Running Locally

### Clone the Repository

```bash
git clone https://github.com/AkhtarRazaMirza/stelix.git
cd stelix
```

### Install Dependencies

Client:

```bash
cd client
npm install
```

Server:

```bash
cd server
npm install
```

### Environment Variables

Server:

```env
DATABASE_URL=

JWT_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

CORSAIR_API_KEY=

GROQ_API_KEY=
```

### Start Development Servers

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```


## Challenges & Lessons Learned

One of the most interesting parts of this project was working with real-world integrations.

Connecting Gmail and Google Calendar sounds straightforward at first, but handling authentication flows, permissions, synchronization, and workflow orchestration introduced challenges that don't exist in isolated applications.

The project also reinforced the importance of designing around user workflows rather than individual features. Many productivity tools solve specific problems well, but the experience often breaks down when users need to move between systems.

Building Stelix helped me gain practical experience with:

- OAuth authentication flows
- Third-party integrations
- API design
- Database modeling
- AI-assisted workflows
- Full-stack TypeScript development


## Things I'd Like To Improve

There are still several areas I would like to explore if development continues.

Some ideas include:

- AI-powered email prioritization
- Meeting preparation summaries
- Real-time updates through webhooks
- Persistent memory for the assistant
- More advanced workflow automation
- Keyboard-first productivity shortcuts
- Semantic search across emails and events


## Final Thoughts

This project started as an experiment around email and calendar workflows, but it gradually became a deeper exploration of how AI can work alongside existing tools instead of trying to replace them.

The current version demonstrates how Gmail, Google Calendar, and AI-assisted actions can be combined into a single workspace while maintaining a familiar workflow for users.

There is still plenty of room to expand the idea, but building Stelix provided valuable experience with integrations, backend architecture, workflow design, and modern AI-powered product development.

## Author

Akhtar Raza

Built for the Corsair Command Center Builder Challenge.