## FEATURE:

Let me define some changes in the cartelería section

- Tab 'Formatos'
Leave just a horizontal, vertical format for the impresos.
Change the name into Post and Story for the digital ones.

- Tab 'Tipos'
Delete, we won't need it.

- Tab 'Plantillas'
Delete, we won't need it

- Tab 'Personalización'
Change name to personalización
Allow me to see something similar to what we have in 'Playground'


Let's define further the personalization one.
Plantilla style was already defined in Tab 'Estilo'. So don't include that one and use the selected one.
We will need to add the following:

'''
Opciones de Visualización (title)
Controla qué elementos se muestran en la plantilla

Iconos, Lista, o Descripción
Mostrar iconos para habitaciones, baños y metros cuadrados


Código QR
Incluir código QR con información de contacto


Marca de Agua
Mostrar logo como marca de agua en cada imagen


Teléfono
Mostrar número de teléfono de contacto


Sitio Web
Mostrar sitio web en la información de contacto


Referencia
Mostrar referencia del piso en la esquina superior izquierda


Descripción Breve
Incluir descripción corta de la propiedad
'''

With that menu we will decide whether or not to include the features for that account. We will include the information in 
Table: Accounts - /Users/javierperezgarcia/Downloads/vesta/src/server/queries/accounts.ts (write here the query)
Column: preferences (json format)
How to: poster_preferences then a dictionary of all of the fields above.


## EXAMPLES:
No exaples provided, first time doing it. 

The images to use are in vesta-configuration-files
templates/
Amazon S3
Buckets
vesta-configuration-files
templates/



Amazon S3
General purpose buckets
Directory buckets
Table buckets
Vector buckets
Preview
Access Grants
Access Points (General Purpose Buckets, FSx file systems)
Access Points (Directory Buckets)
Object Lambda Access Points
Multi-Region Access Points
Batch Operations
IAM Access Analyzer for S3
Block Public Access settings for this account
Storage Lens
Dashboards
Storage Lens groups
AWS Organizations settings
Feature spotlight11

AWS Marketplace for S3
templates/
Copy S3 URI

Objects

Properties
Objects (3)

Copy S3 URI
Copy URL
Download
Open
Delete
Actions
Create folder
Upload
Objects are the fundamental entities stored in Amazon S3. You can use Amazon S3 inventory  to get a list of all objects in your bucket. For others to access your objects, you'll need to explicitly grant them permissions. Learn more 


1


Name
	
Type
	
Last modified
	
Size
	
Storage class

Name
	
Type
	
Last modified
	
Size
	
Storage class

IMG_0744.JPG
JPG
August 4, 2025, 13:28:32 (UTC+02:00)
196.7 KB
Standard
IMG_0745.JPG
JPG
August 4, 2025, 13:28:32 (UTC+02:00)
266.2 KB
Standard
IMG_0749.JPG
JPG
August 4, 2025, 13:28:32 (UTC+02:00)
284.1 KB
Standard


## DOCUMENTATION:
Use best practices in design

## OTHER CONSIDERATIONS:


