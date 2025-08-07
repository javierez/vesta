## FEATURE:
In /Users/javierperezgarcia/Downloads/vesta/src/app/(dashboard)/account-admin I would like to add another configuration menu. This would be 'Portales', where we will be configuring the portal settings. We will group settings by portal. We will have a tab for Fotocasa and another tab for Idealista. and another tab for general settings. All tabs could be in the same route, as this is not heavy information. 

Firstly, when rendering the page, we will have to fetch information using the accountId from the auth and get the portal_settings from the accounts table: account_id,name,logo,address,phone,email,website,portal_settings,payment_settings,preferences,plan,subscription_status,created_at,updated_at,is_active
2251799813685249,Inmobiliaria Acropolis,https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/branding/logo_original_1754307053196_wfEs0l.png,fkjnafd,44444444,ino2@acropolis.com,https://www.inmobiliariaacropolis.es/,{},{},"{""brandingUpdatedAt"":""2025-08-04T11:30:54.685Z"",""colorPalette"":[""#c2c2d6"",""#fe0000"",""#07007d"",""#7774b8"",""#fe6b6b"",""#2D3748""],""logoTransparent"":""https://inmobiliariaacropolis.s3.us-east-1.amazonaws.com/branding/logo_transparent_1754307054237_gBmkUg.png"",""logoTransparentImageKey"":""branding/logo_transparent_1754307054237_gBmkUg.png"",""logoTransparentS3Key"":""s3://inmobiliariaacropolis/branding/logo_transparent_1754307054237_gBmkUg.png"",""poster_preferences"":{""format_ids"":[""vertical"",""story""],""show_description"":true,""show_email"":false,""show_icons"":true,""show_phone"":true,""show_qr_code"":false,""show_reference"":true,""show_watermark"":true,""show_website"":true,""template_style"":""classic""}}",pro,suspended,2025-07-30 12:45:45,2025-08-06 18:06:04,1


and this is what we will update later. 

In the general menu, we will have watermark (y/n) 'marca de agua' to determine if we want to add the logo as watermark for the images we upload to the portals. Please allow me to configure if we want to use it or not.

Then we will have a save button where we will store the infromation in portal_information in accounts table. (use a saving and saved state and track changes to activate the save button again)




## EXAMPLES:
we have some calls to accounts in 

## DOCUMENTATION:



## OTHER CONSIDERATIONS:

