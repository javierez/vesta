## FEATURES:
What I would like to do is another method called combined method and this combined method what it would happen is the          │
│   following process.\                                                                                                            │
│   \                                                                                                                              │
│   So first the property is created using cadastral data, not document OCR. Then form fields are auto-populated from cadastral    │
│   API response. Then what would happen is that we already have a property and a reference number, right? So we would store the   │
│   document uploaded using that specific reference number.\                                                                       │
│   \                                                                                                                              │
│   Then OCR would run on the document after the property is created. I mean, obviously, because we have created the property and  │
│   we have uploaded the file. And we would update just the fields that have not been updated in the OCR. So please make a list    │
│   of all the OCR fields that we update in the method called Catastral. And those are non-updateable. And the other ones, all of  │
│   them, we will update them with the OCR in the same way that we do when we do the OCR method. But the only thing is that we     │
│   would not create the property listing. We would just update those fields, if that makes sense. So please take a look at all    │
│   the code base and try to apply what I've told you.   


## EXAMPLES:
/Users/javierperezgarcia/Downloads/vesta/src/components/crear/property-identification-form.tsx
/Users/javierperezgarcia/Downloads/vesta/src/server/queries/textract-database-saver.ts
/Users/javierperezgarcia/Downloads/vesta/src/server/ocr/ocr-initial-form.tsx

## DOCUMENTATION:
None 

## OTHER CONSIDERATIONS:
- No changes in the UI, just in backend. Log details if you can please that allow me to see what's happening.
