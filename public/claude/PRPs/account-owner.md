## FEATURES:
What I need you to create is another admin tab, both in the side navigation pane and in the routing. This admin tab, it will be not for master admins but for account administrators and will allow them to do several actions that I will describe later. But basically, this depends on the user role being another one. If you look at the other admin tab which is already created, We have the condition of if user role is 2 then we will grant him access but if not, well, we won't grant him access. And I want the same but with other functionalities this time.

So if userRole = 3; role = ACcount Admin (I've already updated the database). And therefore he will have access to this new menu. 

Regarding the side navigation, the looks will be the same because account admins will see an admin page.

Inside of the admin page. We will have also a menu where they will have: Reports - Configuration  - Other that you consider

Inside of the configuration one. We will have a menu where they can select Logo, as well as other options. In logo they will allow you to upload an image. This image will go into inmobiliariaAcropolis folder in aws in a folder inside called configFiles



## EXAMPLES:
  // Check if user has role ID 3 (as specifically requested)
  const hasRequiredRole = await userHasRole(session.user.id, 3);

  if (!hasRequiredRole) {
    redirect("/dashboard");
  }
/Users/javierperezgarcia/Downloads/vesta/src/app/(dashboard)/admin/page.tsx


## DOCUMENTATION:
- no documentation provided 

## OTHER CONSIDERATIONS:
- please do not disrupt nothing currently develop (except for the side nav). This is a new feature
