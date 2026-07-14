# Backend prompt — deliver only Admin Console Feature 1

Copy and use the prompt below in the backend repository.

---

You are working in the TalentShare admin backend. Deliver only **Admin Console Requirement 1: User profile management**. Do not add or expose requirements 2–7.

## Architecture constraint

There are two PostgreSQL databases:

1. **Admin portal database** (`DATABASE_URL`)
   - Admin authentication/session data
   - Admin-only audit records
2. **SysTest/live application database** (`SYSTEST_DATABASE_URL`)
   - Providers and seekers
   - User profiles, portfolio links, supporting documents, provider profile data, programs, enrollments, and support requests

The SysTest/live database must be the source of truth for all managed users. Never look up or mutate a provider/seeker through the admin database.

Before changing code, inspect both actual schemas and existing migrations. Do not assume that both databases use the same Prisma schema. If a new live-app field or table is needed, add its migration in the repository that owns the SysTest/live schema—not in the admin database schema.

## Required API behavior

All routes remain under `/api/admin`, require a valid admin JWT, and require `users.read` or `users.manage` as appropriate.

### 1. Search/list providers and seekers

Implement/verify:

`GET /api/admin/users`

Query parameters:

- `search`: partial, case-insensitive match on first name, last name, email, username, or user ID
- `role`: `SEEKER | PROVIDER`
- `status`: `ACTIVE | SUSPENDED | DELETED`
- `page`, `limit`

Read only from `SYSTEST_DATABASE_URL`. Exclude admin-portal staff unless they are also real live-app users requested explicitly.

Return:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "live-user-id",
        "publicId": "public-user-id",
        "email": "user@example.com",
        "username": "username",
        "firstName": "First",
        "lastName": "Last",
        "role": "SEEKER",
        "isVerified": true,
        "status": "ACTIVE",
        "bio": null,
        "avatar": null,
        "phone": null,
        "location": null,
        "professionalTitle": null,
        "lastLoginAt": null,
        "loginLocked": false,
        "providerProfileEnabled": null,
        "deletionRequestedAt": null,
        "createdAt": "ISO-8601"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
  }
}
```

For providers, `providerProfileEnabled` must be a real independent value. It must not be inferred from login access.

### 2. Complete user profile

Implement/verify:

`GET /api/admin/users/:id`

Read the user and all related profile data from the SysTest/live database. Return:

- identity and contact fields
- role, verification, account status, last login
- provider-profile enabled/disabled state
- portfolio URL(s)
- uploaded supporting documents with `id`, `fileName`, `contentType`, storage key, and created date
- provider application/profile summary
- program count/list
- enrollment count/list
- support-request count/list

Do not return password hashes, reset tokens, OAuth secrets, raw private storage credentials, payment credentials, or other sensitive fields.

### 3. Lock/unlock login access

Use the existing endpoint:

`PATCH /api/admin/users/:id`

Bodies:

```json
{ "status": "SUSPENDED" }
```

```json
{ "status": "ACTIVE" }
```

Requirements:

- Mutate the matching user in the SysTest/live database.
- `SUSPENDED` must block authentication in the live app.
- `ACTIVE` restores authentication.
- Locking login must not disable the provider’s public profile.
- Do not allow a `DELETED` user to be restored through the unlock operation.
- Return the same normalized user shape used by the list endpoint.

### 4. Disable/enable provider profile independently

Implement:

`PATCH /api/admin/users/:id/provider-profile`

Body:

```json
{ "enabled": false }
```

or:

```json
{ "enabled": true }
```

Requirements:

- Target must be a provider; otherwise return `409`.
- Persist this in the SysTest/live database using the live schema’s provider-profile visibility/status field. If no independent field exists, add one in the live-app schema with a safe default of enabled for existing providers.
- Disabling a provider profile hides it from public provider discovery/profile endpoints.
- It must not change login access, the user role, programs, enrollments, or historical data.
- Return the normalized user shape with `providerProfileEnabled`.

### 5. Mark a profile for deletion

Use:

`PATCH /api/admin/users/:id`

Body:

```json
{ "status": "DELETED" }
```

Requirements:

- Mutate the SysTest/live user.
- Record `deletionRequestedAt` (add the field in the live schema if necessary).
- Block login immediately.
- Treat this as a reversible soft-deletion marker at the data layer; do not physically delete related records.
- Repeated requests must be idempotent.
- Return the normalized user shape.

### 6. Secure document download

Implement/verify:

`GET /api/media/:id/signed`

Requirements:

- Look up document metadata in the SysTest/live database, not the admin database.
- Permit the document owner or an authenticated admin with `users.read`.
- Generate a short-lived signed download URL from the existing object-storage service.
- Never return a permanent public URL or storage credentials.
- Return `404` when the document does not belong to a live user or is deleted.

Response:

```json
{
  "success": true,
  "data": { "url": "short-lived-signed-url", "expiresIn": 300 }
}
```

## Audit logging across two databases

After each successful live-database mutation, write an audit record to the admin database containing:

- admin actor ID
- action: `user.login.lock`, `user.login.unlock`, `provider.profile.disable`, `provider.profile.enable`, or `user.deletion.mark`
- live user ID
- timestamp
- reason if supplied
- non-sensitive before/after values

Do not store full user records, document URLs, tokens, or secrets in audit metadata.

Because this is a cross-database operation, do not pretend it is one atomic transaction. Make the live mutation authoritative, then write the audit event. Log and alert if audit persistence fails without rolling back a successful live-user mutation.

## Validation and safety

- Replace raw string interpolation with parameterized Prisma queries.
- Validate role, status, pagination, IDs, and search length.
- Rate-limit admin mutations.
- Prevent accidental mutation of admin-portal staff records.
- Return `404` for unknown live users, `409` for invalid state transitions, and `403` for missing permission.
- Keep response envelopes consistent: `{ "success": true, "data": ... }` or `{ "success": false, "message": "..." }`.

## Tests

Add unit/integration coverage proving:

1. Search reads SysTest/live users and supports all filters.
2. Complete profile includes portfolio and document metadata.
3. Lock blocks live login; unlock restores it.
4. Provider-profile disable does not change login status.
5. Login lock does not change provider-profile visibility.
6. Deletion marking is idempotent and blocks login.
7. Every mutation writes the correct admin-database audit event.
8. A failed audit write does not corrupt or revert a successful live mutation.
9. Signed document URLs require owner/admin authorization.
10. No mutation is accidentally sent to `DATABASE_URL`.

Run backend build, lint, tests, and migrations against disposable databases. Report changed files, migration ownership, endpoint examples, and test results.

---
