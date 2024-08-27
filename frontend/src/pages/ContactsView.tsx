import { Flex, Typography, Image, Button } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Person } from 'util/api'
import * as api from 'util/api'
import { completeUrl } from './BusinessShared'

export default function ContactsView(): JSX.Element {

    const { id: contactId } = useParams()
    const [contact, setContact] = useState<Person>()
    const navigate = useNavigate()

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        if (!contactId) {
            return ''
        }

        try {
            const contactData = await api.getPersonById(contactId)
            setContact(contactData)
        } catch (error) {
            console.log(error)
        }
        // fetch the data

        // put the data
    }



    let dniText = contact?.dni && <>Cédula: {contact.dni}</>

    if (contact?.dniPictureUrl) {
        dniText = <a 
            href={completeUrl(contact.dniPictureUrl)} 
            target="_blank"
        >{contact.dni}</a>
    }

    let rifText = (<>No registrado</>)
    // if rif 
    if (contact?.rif){

        // if rif picture
        if (contact.rifPictureUrl) {
            // render a a link pointing to rif picture and write the rif inside the link
            rifText = (
                <a 
                    href={completeUrl(contact.rifPictureUrl)} 
                    target="_blank"
                >{contact.rif}</a>
            )
        } else {
            // if no rif picture then just render a text with rif only 
            rifText = (
                <>{contact.rif}</>
            )
        }
    }
            

    return (
        <>
            {contact ?

                (
                    <>
                        <Flex align='center' gap={'middle'}>
                            <Typography.Title level={4}>
                                {contact.firstName + " " + contact.lastName}
                            </Typography.Title>

                            <Button onClick={() => navigate(`edit`)}>
                                Editar
                            </Button>
                        </Flex>

                        <Flex gap='large'>
                            <Image
                                data-test="business-details-owner-pfp"
                                width={200}
                                height={250}
                                src={completeUrl(contact?.profilePictureUrl)}
                            />
                            <Typography.Paragraph>

                                Cédula: {' '} { dniText }
                                <br/>

                                RIF: {' '} {rifText} 
                                <br/>

                                Phone: {contact.phone}<br />
                                Correo: {contact.email}<br />
                                Whatsapp: {contact.whatsapp}<br />
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