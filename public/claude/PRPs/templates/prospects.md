So let's define what's a prospect. A prospect, there are two types of prospects, right? So first prospect is when a client comes and he wants to publish some listing. That is a prospect indeed, but it doesn't go into the prospect table because we have a listing and that's enough. Right? Because we have like the apartment or whatever with all the characteristics and so on and we know indeed that he wants to sell or rent something, right? The other type of prospect is a demand. When someone, and this goes in the prospect table, when someone wants something, but they know what they want, but they don't have like anything specific. They don't have a property they like. Okay? 


So let's try to define what will happen when we click on the prospects operations in our operations tab. 
When we click on operations, we have operations/[type], right? But maybe we should create an element or a component or a file or render differently, not at the same time when we have prospects, when we have listings or when we have deals. So what I will try to do in this page is tell you what will be shown when showing the prospects.



So the prospects, it is okay to have a kanban and then a list view, but one important thing to take into consideration is that the kanban view and the list view will be rendered just when asked for it. We don't render both pages at the same time, we render one which is the one which will be shown by default and then the other one.

In this prospect page we will show whether the prospect is a selling or renting prospect or a searching prospect. 
So when it is a selling or renting, we will show the listing characteristics and if it is a demand, we will show the equivalent fields from the prospects table.
- listing.ts + property.ts files
- prospect.ts file

The different statuses that a prospect can have:
Selling Renting Prospect: So a selling or renting prospect can have the following, 
- basic information retrieved & created (info in listing, property and contact tables)
- valoración (aceptar, visita, valor)
- hoja de encargo (firmar)
- En búsqueda (último paso)

do you think we should add more?


Búsqueda Prospect, for searching:
- basic info retrieved & created (info in cotnact and prospect tables)
- En búsqueda


do you think we should add more?

so depending on which type of demanda, we will have more steps  or less . how do we do that in the kanban?



