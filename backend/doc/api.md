# SEDEMAT API Doc

# endpoints 

## /v1/businesses

### POST
it receive a body json with the following parameters

* businessName: string
* dni: string
* companyExpirationDate: date
* directorsBoardExpirationDate

* economicActivityId: int
* ownerPersonId: int
* preferredChannel: string
    - it can be PHONE, WHATSAPP, EMAIL

* sendCalculosTo: string
    - it can be PHONE, WHATSAPP, EMAIL

* preferredContact: string
    - it can be OWNER, ACCOUNTANT, ADMIN

* reminderInterval: int
    - 0 means once a month
    - 3 for each 3 days
    - 7 for each 7 days
    - 15 for 2 times a month


## /v1/branch-offices

### POST
it receive a body json with the following parameters 

* address: string 

* businessId: int

* zone: string

* dimensions: string

* type: string
    - it can be I, II, III
    - NOTE: it should be set automatically

* origin
    - OWN
    - RENTED

## /v1/people
it receive a body json with the following parameters 

### POST

* dni
this should be unique

* firstName: string
* lastName: string
* phone: string
* whatsapp: string
* email: string