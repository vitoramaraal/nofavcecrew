# NoFvce Crew - Access Control

This document explains the user access flags used by the app.

## Admin Users

Table: `public.admin_users`

These users are created in Supabase Auth and then allowed into the app admin
panel by inserting their Auth UUID into `public.admin_users`.

Field: `role`

| Value | Access |
| --- | --- |
| `founder` | Full admin access. Can see all applications, members, phones, access codes and member cards. Can approve/reject applications, delete applications, delete members and change member roles. |
| `admin` | Full operational admin access. Same operational permissions as founder for the current MVP. |
| `moderator` | Can see applications and members, including phones, access codes and member cards. Can approve applications, reject pending applications and create regular members through approval. Cannot delete members, delete applications or change roles. Future role for chat/feed moderation. |

Important:

- Supabase Auth login alone is not enough to access `/admin`.
- The Auth user UUID must exist in `public.admin_users`.
- The admin panel role is separate from the member role.

Example:

```sql
insert into public.admin_users (id, email, role)
values ('AUTH_USER_UUID_HERE', 'admin@email.com', 'founder')
on conflict (id) do update
set email = excluded.email,
    role = excluded.role;
```

## Members

Table: `public.members`

Members do not use Supabase Auth in the current MVP. They log in with their
individual `access_code`.

Field: `role`

| Value | Meaning |
| --- | --- |
| `founder` | Crew founder identity inside the member area. Reserved for top-level crew identity and future member-side privileges. |
| `admin` | Admin identity inside the crew/member layer. This does not automatically grant `/admin` access unless the same person also exists in `public.admin_users`. |
| `moderator` | Moderator identity inside the crew/member layer. Prepared for future chat/feed/event moderation. |
| `member` | Default approved member role. Can access the private member app with their secret code. |

Field: `status`

| Value | Meaning |
| --- | --- |
| `active` | Member can log in with their access code and appears in active member views. |
| `inactive` | Member should not be treated as active. The private app validates the stored session against Supabase and blocks access when the member is no longer active. |

Field: `access_code`

| Behavior |
| --- |
| Unique secret code generated when an application is approved. This is what the member uses at `/members/login`. It should be sent privately by WhatsApp and not shared. |

The app stores the active member locally after login, but protected member
routes validate that stored session through `get_member_profile` before opening.
If the member was deleted or inactivated, local access is cleared and the user
returns to login.

Field: `member_number`

| Behavior |
| --- |
| Public-facing member ID shown on the digital member card, for example `NFC-123456`. |

## Applications

Table: `public.applications`

Candidates submit applications without an account.

Field: `status`

| Value | Meaning |
| --- | --- |
| `pending` | Waiting for admin review. |
| `approved` | Approved by admin/moderator. Approval creates a member automatically if one does not exist yet. |
| `rejected` | Rejected by admin/moderator. |

Field: `identity_rule_confirmed`

| Value | Meaning |
| --- | --- |
| `true` | Candidate confirmed the member card photo does not show a clear face unless blurred, masked or anonymous. Required to submit the application. |
| `false` | Candidate did not confirm the identity rule. The database policy blocks public application submission with this value. |

## Current Permission Matrix

| Action | Founder | Admin | Moderator | Member |
| --- | --- | --- | --- | --- |
| Access `/admin` | Yes | Yes | Yes | No |
| See applications | Yes | Yes | Yes | No |
| See members, phones, codes and cards | Yes | Yes | Yes | No |
| Approve pending application | Yes | Yes | Yes | No |
| Reject pending application | Yes | Yes | Yes | No |
| Delete application | Yes | Yes | No | No |
| Delete member | Yes | Yes | No | No |
| Change member role | Yes | Yes | No | No |
| Access member app with code | If active member | If active member | If active member | Yes |

## Notes

- `public.admin_users.role` controls `/admin`.
- `public.members.role` controls crew/member identity.
- A person can be both an admin user and a member, but those are two separate
  records and two separate access models.
- Admin writes are still client-side in the MVP. Before production scale, move
  sensitive write actions to Supabase Edge Functions or a server backend.
