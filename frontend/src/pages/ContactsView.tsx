import { Flex, Typography, Image, Button } from 'antd'
import {useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Person } from 'util/api'
import * as api from 'util/api'

export default function ContactsView(): JSX.Element {

    const {id: contactId} = useParams()
    const [contact, setContact] = useState<Person>()
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    })

    async function loadData() {
        if (!contactId) {
            return ''
        }
        // setContact({
        //     id: 1,
        //     firstName: "Douglas",
        //     lastName: "Socorro",
        //     dni: "29748656",
        //     phone: "04125340038",
        //     whatsapp: "04125340038",
        //     email: "douglassocorro1@gmail.com",

        //     get fullName(): string{
        //         return this.firstName + " " + this.lastName
        //     }
        // })

        try {
            const contactData = await api.getPersonById(contactId)
            setContact(contactData)
        } catch (error) {
            console.log(error)
        }
        // fetch the data

        // put the data
    }

    return (
        <>
            { contact ? 
                
            (
                <>
                    <Typography.Title level={4}>
                        {contact.firstName + " " + contact.lastName}
                    </Typography.Title>

                    <Button onClick={() => navigate(`edit`)}>
                        Editar
                    </Button>
                    
                    <Flex gap='large'> 
                        <Image
                            data-test="business-details-owner-pfp"
                            width={200}
                            height={250}
                            src={contact?.profilePictureUrl}
                        />
                        <Typography.Paragraph>
                            Cédula: {contact.dni}<br/>
                            Phone: {contact.phone}<br/>
                            Whatsapp: {contact.whatsapp}<br/>
                            Correo: {contact.email}<br/>
                        </Typography.Paragraph>
                    </Flex>
                </>
            )
            : (
                <Typography.Paragraph>
                    Cargando...
                </Typography.Paragraph>
            )
        
            }
        </>
    )
}