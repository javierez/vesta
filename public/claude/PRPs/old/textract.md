## FEATURES:

- We already have: Call to Amazon AWS Textract to analyze all the features of one particular file that we upload in @property-identification-form
- We desire: Instead of uploading PDFs only, it will allow also images (PNG and JPG). Once uploaded the file, it will not just try to identify random features from the file. I would have a list of features to check (every column of listings table and properties table are options to retrieve, but just that) from @schema.

Then if any of the features or columns of properties or listings table is identified in the file uploaded, and we have over 50% of confidence (textract properties), please save it into the database. 


## EXAMPLES:
- On query examples: /Users/javierperezgarcia/Downloads/vesta/src/server/queries/listing.ts or /Users/javierperezgarcia/Downloads/vesta/src/server/queries/properties.ts
- On query data insertions /Users/javierperezgarcia/Downloads/vesta/src/components/crear/property-form.tsx

## DOCUMENTATION:
https://docs.aws.amazon.com/textract/
for amazon textract

## OTHER CONSIDERATIONS:
- No changes in the UI, just in backend. Log details if you can please that allow me to see what's happening.
