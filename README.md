# GYM MANGEMENT APP

An MVP to manage gym members, membership plans, check ins.

- **Backedn:** Node.js, Express. TypesScript, Knex, Postgres
- **Fronten** React, Vite, TypeScript
- **Database** postgres 16 running in docker

## Prerequisites

- [Node.js v22.12 or higher](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/downloads)

Verify each one

node --version
npm --version
docker --version
git --version

**Docker Desktop must be running before starting the DB**

## Start Guide

- 1. Unzip the project
- 2. in the terminal `cd gym-management-mvp`

NOTE: Make sure you're in the folder that contains `docker-compose.yml`.

- 3. Start the db `docker compose up -d` 
**Docker Desktop must be running before starting the DB**

NOTE: Verify it's runnin `docker ps`. You should see a container named `gym_management_db` with status "Up".

- 4. Setup and strat the backend

Open a new terminal tab (keep the first one free for later commands) and:

`cd server`
`cp .env.example .env` // or manually create .env and copy the content from .env.example
`npm install`
`npm run migrate`
`npm run seed`
`npm run dev`

When it's ready you'll see: API listening on http://localhost:3000

**Leave this terminal running.** Closing it stops the API.

- 5. Setup and start the frontend

Open another terminal tab and:
`cd gym_management_app`
`npm install`
`npm run dev`

When ready you'll see: Local: http://localhost:5000/ 
Open that URL in your browser. You're done

## Running the tests

In a new terminal:
`cd server`
`npm test`


