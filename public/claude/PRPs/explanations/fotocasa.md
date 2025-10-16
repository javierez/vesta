# Fotocasa Documentation

Dictionaries

Building type
Identifies the type of the property

Description	Id
Flat	1
House	2
Commercial store	3
Office	4
Building	5
Land	6
Industrial building	7
Garage	8
Storage room	12

Building subtype
Identifies the category of the property depending on the selected building type

Description	Id	Allowed use
Triplex	2	Flat
Duplex	3	Flat
Penthouse	5	Flat
Studio	6	Flat
Loft	7	Flat
Flat	9	Flat
Apartment	10	Flat
Ground floor	11	Flat
House	13	House
Terraced house	17	House
Paired house	19	House
Chalet	20	House
Rustic house	24	House
Bungalow	27	House
Residential	48	Building
Others	49	Building
Mixed residential	50	Building
Offices	51	Building
Residential land	56	Land
Industrial land	60	Land
Rustic land	91	Land
Moto	68	Garage
Double	69	Garage
Individual	70	Garage
Hotel	72	Building

Transaction type
Defines the type of the transaction

Description	Id	Accepts
Buy	1	Flat, House, Commercial store, Land, Office, Industrial building, Storage room, Building, Garage
Rent	3	Flat, House, Commercial store, Land, Office, Industrial building, Storage room, Building, Garage
Transfer	4	Commercial store, Office, Industrial building, Storage room, Building
Share	7	Flat, House
Rent with buy option	9	Flat, House

Visibility mode
Defines how to show the property address

Description	Id
Exact	1
Street	2
Zone	3

Floor map
Identifies the floor type of the property

Description	Id
Basement	1
Ground floor	3
Mezzanine	4
First	6
Second	7
Third	8
Fourth	9
Fifth	10
Sixth	11
Seventh	12
Eight	13
Ninth	14
Tenth	15
Tenth upwards	16
Penthouse	22
Other	31

Features

Allowed use
Description	Id	Available for	Type
Allowed use	21	Land	Decimal
Possible Values:

Description	Id
Agricultural	1
Commercial	2
Services	3
Industrial	4
Residential multi family	8
Residential single family	9

Terrace
Description	Id	Available for	Type
Terrace	27	Flat, House, Office, Commercial store	Boolean
Terrace surface	62	Flat, House, Office, Commercial store	Decimal

Orientation
Description	Id	Available for	Type
Orientation	28	Flat, House, Commercial store, Office, Building	Decimal
Possible Values:

Description	Id
North east	1
West	2
North	3
South west	4
East	5
South east	6
North west	7
South	8

Heating
Description	Id	Available for	Type
Has heating	29	Flat, House, Office, Industrial building	Boolean
Heatings	320	Flat, House, Office, Industrial building	Decimal
Possible values:

Description	Id
Natural gas	1
Electric	2
Diesel oil	3
Butane	4
Propane	5
Solar	6

Hot water
Description	Id	Available for	Type
Hot water	321	Flat, House, Commercial store, Office, Industrial building	Decimal
Possible values:

Description	Id
Natural gas	1
Electric	2
Diesel oil	3
Butane	4
Propane	5
Solar	6

Energy certification
Description	Id	Available for	Type
Consumption efficiency scale	323	Flat, House, Commercial store, Office, Building	Decimal
Emissions efficiency scale	324	Flat, House, Commercial store, Office, Building	Decimal
Consumption efficiency value	325	Flat, House, Commercial store, Office, Building	Decimal(1..999)
Emissions efficiency value	326	Flat, House, Commercial store, Office, Building	Decimal(1..999)
Energy certificate	327	Flat, House, Commercial store, Office, Building	Decimal
Possible values for energy certificate status

Description	Id
Available	1
Pending	2
Exempt	3
Possible values for consumption and emissions efficiency scale

Description	Id
A	1
B	2
C	3
D	4
E	5
F	6
G	7

Conservation status
Description	Id	Available for	Type
Conservation status	249	Flat, House, Commercial store, Office, Industrial building, Building	Decimal
Possible values:

Description	Id
Good	1
Pretty good	2
Almost new	3
Needs renovation	4
Renovated	6

Property features
Description	Id	Available for	Type
Surface	1	All	Decimal
Title	2	All	Text
Description	3	All	Text
Rooms	11	Flat, House, Building	Decimal
Bathrooms	12	Flat, House, Commercial store, Industrial building, Building	Decimal
Furnished	30	Flat, House, Commercial store, Office	Boolean
Year built	231	Flat, House, Commercial store, Garage, Office, Industrial building, Building	Decimal
Elevator	22	Flat, Building, Garage, Industrial building, Office	Boolean
Wardrobe	258	Flat, House, Commercial store	Boolean
Surveillance system	272	Flat, House, Commercial store, Office, Building, Storage room, Garage, Industrial building	Boolean
Equipped kitchen	314	Flat, House, Commercial store	Boolean
Air conditioner	254	Flat, House, Commercial store, Office	Boolean
Parking	23	Flat, House, Office, Storage room	Boolean
Security door	294	Flat, House, Garage, Office, Storage room	Boolean
Private garden	298	Flat, House, Office, Storage room	Boolean
Yard	263	Flat, House, Commercial store, Office	Boolean
Storage room	24	Flat, House, Office	Boolean
Smoke outlet	311	Commercial store, Industrial building	Boolean
Community pool	300	Flat, House, Building	Boolean
Private pool	25	Flat, House	Boolean
Loading area	204	Commercial store, Office, Storage room	Boolean
Twenty-four hour access	207	Office, Storage room	Boolean
Free internal transport elements	208	Storage room	Boolean
Alarm	235	Flat, House, Commercial store, Office, Building, Storage room, Garage, Industrial building	Boolean
Personal access code	131	Storage room	Boolean
Free parking	206	Storage room	Boolean
Laundry	257	Flat, House	Boolean
Community area	301	Flat, House, Building	Boolean
Office kitchen	289	Flat, House, Office	Boolean
Jacuzzi	274	Flat, House	Boolean
Sauna	277	Flat, House	Boolean
Tennis court	310	Flat, House	Boolean
Gym	309	Flat, House, Building	Boolean
Sports area	302	Flat, House, Building	Boolean
Children area	303	Flat, House, Building	Boolean
Home automation	142	Flat, House, Commercial store	Boolean
Internet	286	Flat, House, Commercial store, Office	Boolean
Suite bathroom	260	Flat, House	Boolean
Home appliances	259	Flat, House	Boolean
Oven	288	Flat, House	Boolean
Washing machine	293	Flat, House	Boolean
Microwave	287	Flat, House	Boolean
Fridge	292	Flat, House	Boolean
TV	291	Flat, House	Boolean
Parquet	290	Flat, House, Commercial store	Boolean
Stoneware	295	Flat, House, Commercial store	Boolean
Balcony	297	Flat, House, Office	Boolean
Pets allowed	313	Flat, House	Boolean
Nearby public transport	176	Flat, House	Boolean
Land area	69	House, Land, Industrial building	Decimal
Dryer	315	Flat, House	Boolean
Dishwasher	316	Flat, House	Boolean

Document type
Identifies the document type

Description	Id
Image	1
Video (max. 100 MB)	8
External video link (youtube, vimeo)	31
Blueprint	23
Virtual tour	7
Virtual tour	32 (deprecated)

Multipublication
Defines the publications supported by our system

Description	Id
Spainhouses	1983
kyero	4539
pisos.com	31
Think Spain	10025
Listglobally Basic	32421

Contact info
Identifies the contact type provided

Description	Id
Email	1
Phone	2

Contact type
Identifies the contact type provided

Description	Id
Agency	1
Specific	3



JSON Schema Example
{
  "ExternalId": "123456",
  "AgencyReference": "123",
  "TypeId": 1,
  "SubTypeId": 9,
  "ContactTypeId": 3,
  "PropertyAddress": [
    {
      "FloorId": 6,
      "x": -3.21288689804,
      "y": 43.3397409074,
      "VisibilityModeId": 2,
      "ZipCode": "39700",
      "Street": "Aribau",
      "Number": "124"
    }
  ],
  "PropertyFeature": [
    {
      "FeatureId": 1,
      "DecimalValue": 58
    },
    {
      "FeatureId": 2,
      "TextValue": "Inmobiliaria vende piso reformado en la zona de Brazomar. La vivienda se distribuye en 2 habitaciones, 1 baño, cocina equipada y un amplio salón comedor con salida a una terraza."
    },
    {
      "FeatureId": 3,
      "TextValue": "Remodeled to perfection! This beautiful home is located close to shopping and dining. Here are just a few of its wonderful features: cozy fireplace, new kitchen cabinets, stainless steel sink, modern quartz counter tops, wood flooring, remodeled bathrooms, freshly painted, central a/c, attached two-car garage, large back yard, and so much more!"
    },
    {
      "FeatureId": 11,
      "DecimalValue": 2
    },
    {
      "FeatureId": 12,
      "DecimalValue": 1
    },
    {
      "FeatureId": 30,
      "BoolValue": false
    },
    {
      "FeatureId": 62,
      "DecimalValue": 0
    },
    {
      "FeatureId": 231,
      "DecimalValue": 1965
    },
    {
      "FeatureId": 235,
      "BoolValue": false
    },
    {
      "FeatureId": 249,
      "DecimalValue": 2
    },
    {
      "FeatureId": 254,
      "BoolValue": false
    },
    {
      "FeatureId": 257,
      "BoolValue": false
    },
    {
      "FeatureId": 258,
      "BoolValue": true
    },
    {
      "FeatureId": 263,
      "BoolValue": false
    },
    {
      "FeatureId": 323,
      "DecimalValue": 7
    },
    {
      "FeatureId": 324,
      "DecimalValue": 6
    },
    {
      "FeatureId": 325,
      "DecimalValue": 357
    },
    {
      "FeatureId": 326,
      "DecimalValue": 64
    },
    {
      "FeatureId": 327,
      "DecimalValue": 1
    }
  ],
  "PropertyContactInfo": [
    {
      "TypeId": 1,
      "Value": "demo@adevinta.com"
    },
    {
      "TypeId": 2,
      "Value": "942862711"
    }
  ],
  "PropertyTransaction": [
    {
      "TransactionTypeId": 1,
      "Price": 160000,
      "ShowPrice": true
    }
  ],
  "PropertyPublications": [
    {
      "PublicationId": 31,
      "PublicationTypeId": 2
    },
    {
      "PublicationId": 32421,
      "PublicationTypeId": 2
    }
  ],
  "PropertyDocument": [
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-c67186f3.jpg",
      "SortingId": 1
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-3bda6803.jpg",
      "SortingId": 2
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-42b27a1f.jpg",
      "SortingId": 3
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-594b24e8.jpg",
      "SortingId": 4
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-0e40fd41.jpg",
      "SortingId": 5
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-a16088db.jpg",
      "SortingId": 6
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-3b67fefd.jpg",
      "SortingId": 7
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-0de16cf0.jpg",
      "SortingId": 8
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-0eb01416.jpg",
      "SortingId": 9
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-4f351a25.jpg",
      "SortingId": 10
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-095aaa5d.jpg",
      "SortingId": 11
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-e2841b01.jpg",
      "SortingId": 12
    },
    {
      "TypeId": 1,
      "Url": "https://cdn.adevinta.com/1fbb7256-0003444021.jpg",
      "SortingId": 13
    },
    {
      "TypeId": 1,
      "Url": "https://adevinta.s3.amazonaws.com/pics/3444021-39347578.jpg",
      "SortingId": 14
    }
  ]
}



JSON Schema
{
      "id": "Property",
      "title": "Property",
      "description": "The main entity of the property data model",
      "required": true,
      "type": "object",
      "properties": {
          "ExternalId": {
              "description": "The unique identifier for a property",
              "required": true,
              "type": "string",
              "minLength": 1
          },
          "AgencyReference": {
              "description": "Reference given by the agency to the property",
              "required": true,
              "type": "string",
              "minLength": 1
          },
          "TypeId": {
              "description": "Identifies the type of the property within the following enumeration",
              "required": true,
              "type": "integer",
              "enum": [ 1, 2, 3, 4, 5, 6, 7, 8, 10, 12 ],
              "dictionary": "Building type"
          },
          "SubTypeId": {
              "description": "Indicates the subtype of the property from the value selected in 'TypeId' field",
              "required": true,
              "type": "integer",
              "enum": [ 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 17, 19, 20, 24, 27, 48, 49, 50, 51, 56, 60, 68, 69, 70, 72, 91 ],
              "dictionary": "Building subtype"
          },
          "ContactTypeId": {
              "description": "Defines the type of contact provided",
              "required": true,
              "type": "integer",
              "enum": [ 1, 3 ],
              "dictionary": "Contact type"
          },    
          "PropertyAddress": {
              "id": "PropertyAddress",
              "title": "PropertyAddress",
              "description": "Defines where the property is exactly located",
              "required": true,
              "type": "array",
              "items": {
                  "id": "PropertyAddress",
                  "type": "object",
                  "properties": {
                      "ZipCode": {
                          "description": "ZIP Code (not required if x and y are specified)",
                          "required": false,
                          "type": "string"
                      },
                      "FloorId": {
                          "description": "Enum for the floor",
                          "required": false,
                          "type": "integer",
                          "enum": [ 1, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 22, 31 ],
                          "dictionary": "Floor map"
                      }``,
                      "x": {
                          "description": "Longitude coordinate used to geographycally place the property",
                          "required": true,
                          "type": "number"
                      },
                      "y": {
                          "description": "Latitude coordinate used to geographycally position the property",
                          "required": true,
                          "type": "number"
                      },
                      "VisibilityModeId": {
                          "description": "Defines how to display the property address",
                          "required": true,
                          "type": "integer",
                          "enum": [1, 2, 3 ],
                          "dictionary": "Visibility mode"
                      },
                      "Street": {
                          "description": "Street name (literal to show in portals)",
                          "required": false,
                          "type": "string"
                      },
                      "Number": {
                          "description": "Street number (literal to show in portals)",
                          "required": false,
                          "type": "string"
                      }
                  }
              }
          },
          "PropertyDocument": {
              "id": "PropertyDocument",
              "title": "PropertyDocument",
              "description": "Entity used to define the property's document(s) like pictures, videos and others",
              "required": false,
              "type": "array",
              "items": {
                  "id": "PropertyDocument",
                  "type": "object",
                  "properties": {
                      "TypeId": {
                          "description": "Describes the type of file according to the following enumeration",
                          "required": true,
                          "type": "integer",
                          "enum": [ 1, 7, 8, 23, 31 ],
                          "dictionary": "Document type"
                      },
                      "Url": {
                          "description": "It must contain the file name (i.e. 'picture.jpg')",
                          "required": true,
                          "type": "string"
                      },
                      "SortingId": {
                          "description": "Use it to alter the order of appearence of the document in lists",
                          "required": true,
                          "type": "integer"
                      }
                  }
              }
          },
          "PropertyFeature": {
              "id": "PropertyFeature",
              "title": "PropertyFeature",
              "description": "Entity used to define the property's features (extras)",
              "required": true,
              "type": "array",
              "items": {
                  "id": "PropertyFeature",
                  "type": "object",
                  "properties": {
                      "FeatureId": {
                          "description": "Describes the type of feature according to the following enumeration",
                          "required": true,
                          "type": "integer",
                          "enum": [ 1, 2, 3, 11, 12, 30, 231, 22, 258, 272, 314, 254, 23, 294, 298, 263, 24, 311, 300, 25, 204, 207, 208, 235, 131, 206,
                          257, 301, 289, 274, 277, 310, 309, 302, 303, 142, 286, 260, 259, 288, 293, 287, 292, 291, 290, 295, 297, 313 ],
                          "dictionary": "Property features"
                      },
                      "DecimalValue": {
                          "description": "If the feature type is 'DecimalValue', 'List' or 'Multiple', its value must be placed in this field",
                          "required": false,
                          "type": "number"
                      },
                      "BoolValue": {
                          "description": "If the feature type is 'BooleanValue', its value must be placed in this field",
                          "required": false,
                          "type": "boolean"
                      },
                      "DateValue": {
                          "description": "If the feature type is 'DateValue', its value must be placed in this field",
                          "required": false,
                          "type": "string"
                      },
                      "TextValue": {
                          "description": "If the feature type is 'TextValue', its value must be placed in this field",
                          "required": false,
                          "type": "string"
                      }
                  }
              }
          },
          "PropertyContactInfo": {
              "id": "PropertyContactInfo",
              "title": "PropertyContactInfo",
              "description": "Contains all the contact sources provided by the property's owner (i.e. phone, e-mail...)",
              "required": true,
              "type": "array",
              "items": {
                  "id": "PropertyContactInfo",
                  "type": "object",
                  "properties": {
                      "TypeId": {
                          "description": "Describes the type of contact according to the following enumeration",
                          "required": true,
                          "type": "integer",
                          "enum": [ 1, 2 ],
                          "dictionary": "Contact info"
                      },
                      "Value": {
                          "description": "Free text with the value of the contact source",
                          "required": true,
                          "type": "string"
                      }
                  }
              }
          },
          "PropertyPublications": {
              "id": "PropertyPublications",
              "title": "PropertyPublications",
              "description": "List of publications which the property will be sent to",
              "required": false,
              "type": "array",
              "items": {
                  "id": "PropertyPublication",
                  "type": "object",
                  "properties": {
                      "PublicationId": {
                          "description": "The unique identifier where the property is published, according to the following enumeration",
                          "required": true,
                          "type": "integer",
                        "enum": [ 1983, 4539, 31, 10025, 6053, 23958, 32421, 38882, 33749, 33748 ],
                          "dictionary": "Multipublication"
                      }
                  }
              }
          },
          "PropertyTransaction": {
              "id": "PropertyTransaction",
              "title": "PropertyTransaction",
              "description": "Describes the transaction features of the property (i.e. Price, currency, payment periodicity...)",
              "required": true,
              "type": "array",
              "items": {
                  "id": "PropertyTransaction",
                  "type": "object",
                  "properties": {
                      "TransactionTypeId": {
                          "description": "Indicates the type of the transaction according to the following enumeration",
                          "required": true,
                          "type": "integer",
                          "enum": [ 1, 3, 4, 7, 9 ],
                          "dictionary": "Transaction type"
                      },
                      "Price": {
                          "description": "The property price for this transacton type",
                          "required": true,
                          "type": "number"
                      },
                      "ShowPrice": {
                          "description": "Hide/show price in communications and publications (true by default)",
                          "required": false,
                          "type": "boolean"
                      }
                  }
              }
          }
      }
  }

## Missing Fotocasa Mappings

The following Fotocasa API fields are available but not currently mapped in our system. These would require new database columns or fields to be added:

### Storage Room Specific Features
- **FeatureId 131**: Personal access code (Boolean) - Storage room
- **FeatureId 204**: Loading area (Boolean) - Commercial store, Office, Storage room  
- **FeatureId 206**: Free parking (Boolean) - Storage room
- **FeatureId 207**: Twenty-four hour access (Boolean) - Office, Storage room
- **FeatureId 208**: Free internal transport elements (Boolean) - Storage room

### Land Property Features
- **FeatureId 21**: Allowed use (Decimal) - For Land properties
  - Possible values: 1=Agricultural, 2=Commercial, 3=Services, 4=Industrial, 8=Residential multi family, 9=Residential single family

### Additional Amenities
- **FeatureId 295**: Stoneware (Boolean) - Flat, House, Commercial store (already mapped in listings table but not properties)
- **FeatureId 301**: Community area (Boolean) - Flat, House, Building
- **FeatureId 311**: Smoke outlet (Boolean) - Commercial store, Industrial building
- **FeatureId 315**: Dryer (Boolean) - Flat, House
- **FeatureId 316**: Dishwasher (Boolean) - Flat, House

### Notes
- Some fields like Air conditioner (254) and Parquet (290) have been mapped using existing varchar fields converted to boolean
- Land area (69) currently uses builtSurfaceArea as a proxy - may need a dedicated landArea field for better accuracy
- Garden (263) was replaced with Private Garden (298) as it better represents the field meaning
