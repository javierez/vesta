## FEATURES:
Apply authentication to all the codebase using BetterAuth. Explain also how are you implementing it.

## EXAMPLES:
 /Users/javierperezgarcia/Downloads/vesta/public/claude/examples/auth-client.ts
 /Users/javierperezgarcia/Downloads/vesta/public/claude/examples/auth.ts
 /Users/javierperezgarcia/Downloads/vesta/public/claude/examples/sign-in.tsx
 /Users/javierperezgarcia/Downloads/vesta/public/claude/examples/sign-up.tsx



## DOCUMENTATION:
https://www.better-auth.com/docs
https://www.better-auth.com/docs/basic-usage
https://www.better-auth.com/docs/authentication/google
https://www.better-auth.com/docs/introduction
https://www.better-auth.com/docs/adapters/drizzle
https://www.better-auth.com/docs/adapters/prisma
https://www.better-auth.com/docs/concepts/cli#generate



## OTHER CONSIDERATIONS:
- Add security standards so that one account cannot access other accounts' information. 
- When you login, you identify as a user. And that's where we define roles, permissions, etc. Look at @schema for that
- Please be aware of where you place the different components in teh code. we have some middleware now and no place to locate it.
