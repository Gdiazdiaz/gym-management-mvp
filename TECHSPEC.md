# Gym Management App

## Endpoints

All routes are prefixed with `/api`. Requests and responses are JSON.

- List active plans

## [HTTP GET Method] `/plans`

--> Response

```json

[
  {
    "id": 1,
    "name": "Monthly Basic",
    "price": "29.99",
    "duration_days": 30,
    "is_active": true
  }
]
```

- Create a memeber

## [HTTP POST Methos] `/members`

--> Request Body

```json
{
  "first_name": "Ana",
  "last_name": "Lopez",
  "email": "ana.lopez@example.com",
  "phone_number": "555-0100"
}
```

--> Response `201 Created`

```json
{
  "id": 1,
  "first_name": "Ana",
  "last_name": "Lopez",
  "email": "ana.lopez@example.com",
  "phone_number": "555-0100",
  "created_at": "2026-04-23T06:03:11.691Z",
  "updated_at": "2026-04-23T06:03:11.691Z"
}
```

- List / search members by name or email

## [HTTP GET Methos] `/members?q=<query>`

--> Parameters

- **`q`** (*string, optional*): Search term matched against first name, last name, or email.

--> Response

```json
[
  {
    "id": 1,
    "first_name": "Ana",
    "last_name": "Lopez",
    "email": "ana.lopez@example.com",
    "phone_number": "555-0100",
    "created_at": "2026-04-23T06:03:11.691Z",
    "updated_at": "2026-04-23T06:03:11.691Z"
  }
]
```

Member summary

## [HTTP GET Method] `/members/:id/summary`

--> Parameters:

- **`id`** (*integer*): The member's unique ID.

--> Response

```json
{
  "member": {
    "id": 1,
    "first_name": "Ana",
    "last_name": "Lopez",
    "email": "ana.lopez@example.com",
    "phone_number": "555-0100",
    "created_at": "2026-04-23T06:03:11.691Z",
    "updated_at": "2026-04-23T06:03:11.691Z"
  },
  "active_membership": {
    "membership_id": 1,
    "plan_id": 2,
    "plan_name": "Monthly Basic",
    "plan_price": "29.99",
    "start_date": "2026-04-13T06:00:00.000Z",
    "end_date": "2026-05-13T06:00:00.000Z"
  },
  "last_check_in": "2026-04-23T19:35:23.183Z",
  "check_ins_last_30_days": 6
}
```

Assign a plan to a member

## [HTTP POST Method] `/memberships`

--> Request Body

```json
{
  "member_id": 1,
  "plan_id": 2,
  "start_date": "2026-04-23"
}
```

--> Parameters:

- **`member_id`** (*integer*): The ID of the member receiving the plan.
- **`plan_id`** (*integer*): The ID of the plan to assign.
- **`start_date`** (*string, YYYY-MM-DD*): The date the membership becomes active.

--> Response `201 Created`

```json
{
  "id": 1,
  "member_id": 1,
  "plan_id": 2,
  "start_date": "2026-04-23T06:00:00.000Z",
  "end_date": "2026-05-23T06:00:00.000Z",
  "status": "active",
  "created_at": "2026-04-23T06:03:11.691Z"
}
```

Cancel a membership

## [HTTP POST Method] `/memberships/:id/cancel`

--> Parameters:

- **`id`** (*integer*): The membership's unique ID.

--> Response `200 OK`

```json
{
  "id": 1,
  "member_id": 1,
  "plan_id": 2,
  "start_date": "2026-04-23T06:00:00.000Z",
  "end_date": "2026-05-23T06:00:00.000Z",
  "status": "cancelled",
  "created_at": "2026-04-23T06:03:11.691Z"
}
```

Record check-in

## [HTTP POST Method] `/check-ins`

--> Request Body

```json
{
  "member_id": 1
}
```

--> Parameters:

- **`member_id`** (*integer*): The ID of the member checking in.

--> Response `201 Created`

```json
{
  "id": 42,
  "member_id": 1,
  "membership_id": 1,
  "created_at": "2026-04-23T19:35:23.183Z"
}
```

Liveness probe

## [HTTP GET Method] `/health`

--> Response `200 OK`

```json
{
  "status": "ok"
}
```

## Schema

### PLANS

CREATE TABLE plans (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)   NOT NULL,
    price           NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    duration_days   INTEGER        NOT NULL CHECK (duration_days > 0),
    is_active       BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_is_active ON plans(is_active) WHERE is_active = TRUE;

### Members

CREATE TABLE members (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    phone_number    VARCHAR(20),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_members_last_first ON members(last_name, first_name);
CREATE INDEX idx_members_email_lower ON members(LOWER(email));

### Memberships

CREATE TYPE membership_status AS ENUM ('active', 'canceled', 'expired');

CREATE TABLE memberships (
    id              SERIAL PRIMARY KEY,
    member_id       INTEGER NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    plan_id         INTEGER NOT NULL REFERENCES plans(id)   ON DELETE RESTRICT,
    start_date      DATE    NOT NULL,
    end_date        DATE    NOT NULL,
    status          membership_status NOT NULL DEFAULT 'active',
    cancelled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

CREATE UNIQUE INDEX uniq_memberships_one_active_per_member
    ON memberships(member_id)
    WHERE status = 'active';

CREATE INDEX idx_memberships_member_id ON memberships(member_id);
CREATE INDEX idx_memberships_plan_id   ON memberships(plan_id);
CREATE INDEX idx_memberships_status    ON memberships(status);

### Check-ins

CREATE TABLE check_ins (
    id              SERIAL PRIMARY KEY,
    member_id       INTEGER NOT NULL REFERENCES members(id)     ON DELETE CASCADE,
    membership_id   INTEGER NOT NULL REFERENCES memberships(id) ON DELETE RESTRICT,
    checked_in_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_check_ins_member_time ON check_ins(member_id, checked_in_at DESC);
CREATE INDEX idx_check_ins_membership  ON check_ins(membership_id);
CREATE INDEX idx_check_ins_time        ON check_ins(checked_in_at DESC);

## Bussiness rules and Validation rules

### Plans

--> Bussiness rules

- Plans are never deleted, only deactivated.
- Only active plans (is_active = true) are shown when assigning a new membership.
- Changing a plan's price or duration_days does not affect existing memberships

--> Validation rules

- `name` required, 1-100 characters, trimmed.
- `price` required, numeric, >= 0, at most 2 decimal places.
- `duration_days` required, integer, > 0.
- `is_active` boolean, defaults to true.

### Members

--> Bussiness rules

- Email must be unique across all members
- Email search is case-insensitive: `ana@x.com` and `ANA@x.com` must match the same member.

--> Validation rules

`first_name` required, 1–100 chars, trimmed, letters/spaces/hyphens/apostrophes allowed.
`last_name`  required, 1–100 chars, trimmed, same character rules.
`email` required, valid email format, ≤ 255 chars, normalized to lowercase before storage.
`phone_number` optional, ≤ 20 chars. Strip whitespace, (strip whitespace, allow digits/+/-/()/space).

### Memberships rules

--> Bussiness rules

- A member can have at most one active membership at a time.
- `end_date` is computed from `start_date` + `plan.duration_days` at creation time.
- `plan_price` at time of assignment should be snapshotted into the membership.
- Status transitions are limited:
`active` → `cancelled` (via cancel endpoint)
`active` → `expired` (automatic, when `end_date` passes, will require a scheduled job or query-time check)
No other transitions allowed. A cancelled membership cannot be reactivated; issue a new one.
- `cancelled_at` must be set if and only if status = 'cancelled'
- Cancelation is immediate. There is no partial refund or prorated cancellation in the MVP.
- `start_date` cannot be in the past. Future start dates are allowed for pre-booking

--> Validation rules

- `member_id` required, positive integer, must reference an existing member.
- `plan_id` required, positive integer, must reference an existing active plan.
- `start_date` required, valid date (YYYY-MM-DD), not before today, not more than 1 year in the future.
- Assigning a plan when the member already has an active membership → `409 Conflict`.
- Assigning an inactive plan → `400 Bad Request`.

### Check-in

--> Bussiness rules

- A check-in requires the member to have an active membership at the moment of check-in. Verified in the service layer within a transaction to avoid races.
- Each check-in is tied to the specific `membership_id` that authorized it, not just the member.
- Check-ins are immutable. They are never edited or deleted via the API.
- Same-day duplicate check-ins: the MVP allows them (someone could leave and come back).
- `checked_in_time` defaults to NOW() server-side. The client does not get to specify the time — this prevents backdating.

--> Validation rules

- `member_id` required, positive integer, must reference an existing member.
- Recording a check-in for a member with no active membership → `400 Bad Request`.
- Recording a check-in for a non-existent member → `404 Not Found`.

## Concurrency note: how you prevent race conditions for “only one active membership” 

It get enforced in the DB using Postgres' partial unique index

CREATE UNIQUE INDEX idx_one_active_membership_per_member
  ON memberships (member_id)
  WHERE status = 'active';

## “If more time” improvements

- Add JWT-based staff auth with role-based access
- Membership expiration background job
- Pagination and sorting on the members list
- CI/CD pipeline
- KPIs for management