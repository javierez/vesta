## FEATURE:

My idea is to do the necessary changes to make the app be the most efficient in terms of role and permissions management. Right now I have a table
- user_roles ; please check in /Users/javierperezgarcia/Downloads/vesta/src/server/db/schema.ts
- permissions definitions; /Users/javierperezgarcia/Downloads/vesta/src/lib/permissions.ts (not used I think)
- server_user; /Users/javierperezgarcia/Downloads/vesta/src/lib/server-user.ts (I don't know what is this for)
- middleware; /Users/javierperezgarcia/Downloads/vesta/src/middleware.ts 

I would like to be as efficient as possible in detecting the role for each user and then based on that, be able to:
- display one thing or another depending on the user (like the admin page in the side bar: /Users/javierperezgarcia/Downloads/vesta/src/app/(dashboard)/admin/page.tsx), then be able to perform or not some actions, and then be able to see or not see data  (queries)

## EXAMPLES:

I wish I could have examples of a good implementation. But I don't know which are the best approaches that could be taken.

## DOCUMENTATION:

I'm using to manage the authentication better-auth: https://www.better-auth.com/docs/introduction

## OTHER CONSIDERATIONS:

- Base your response in best practices please
- Do not estblish yet rules depending on the roles, but leave it all prepared to establish rules... If that makes sense 