import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import * as api from '../util/api'
import { Business, BranchOffice } from '../util/types'
import { Button, DatePicker, Divider, Flex, Form, Input, Select, Typography } from "antd";

import { 
    BusinessFormFields, 
    channelOptions, 
    ContactForm, 
    contactOptions, 
    getBase64, 
    reminderIntervalMap, 
    reminderIntervalOptions, 
    ZONES
} from './BusinessShared'

export default function BusinessForm(): JSX.Element {
    const [business, setBusiness] = useState<Business>()
    const [branchOffices, setBranchOffices] = useState<BranchOffice[]>()
    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);
    const [people, setPeople] = useState<Person[]>([])


    const [form] = Form.useForm()

    const { businessId } = useParams();

    let isNewTaxPayer = businessId ? false : true
    
    useEffect(() => {
        if(businessId) {
            loadBusinessData(businessId)
        } else {
            console.log("Creating a new tax payer")
        }

        loadEconomicActivities()
        loadPeople()
    }, [])

    async function loadBusinessData(businessId: string){
        let businessData = await api.fetchBusinessById(Number(businessId))
        let branchOffices = await api.fetchBranchOffices(Number(businessId))

        setBusiness(businessData)
        setBranchOffices(branchOffices)

        console.log(JSON.stringify(businessData, null, 2))

        form.setFieldsValue({
            businessName: businessData.businessName,
            dni: businessData.dni,
            economicActivity: businessData.economicActivity.title,
        })
    }

    async function loadEconomicActivities() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async function loadPeople() {
        const peopleData = await api.getPeople()

        // console.log({peopleData})

        setPeople(peopleData)
    }
    
    function showFormData() {
        const formData = form.getFieldsValue()
        console.log({formData})
    }

    return (
        <Flex vertical>
            { isNewTaxPayer 
                ? <Typography.Title level={1}>Nuevo contribuyente</Typography.Title> 
                : <Typography.Title level={1}>Editar contribuyente</Typography.Title>}

            <Form form={form}>
                <BusinessBasicInformarionForm 
                    economicActivities={economicActivities}
                />

                <BusienssContactInformationForm 
                    people={people}
                />

                <BusienssContactPreferenceForm 
                
                />

                <Form.Item>
                    <Button 
                        data-test='submit-button'
                        type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>

                <Button onClick={() => showFormData()}>
                    Show form data
                </Button>
            </Form>
        </Flex>
    )
}

function BusinessBasicInformarionForm({economicActivities}): JSX.Element {
    return (
        <>
            <Flex gap='middle'>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "Introduzca la razón social"
                        }
                    ]}
                    label='Razón Social'
                    name='businessName'
                    style={{
                        width: '70%'
                    }}
                >
                    <Input data-test='business-name-input'/>
                </Form.Item>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "Introduzca el RIF"
                        }
                    ]}
                    label='Rif'
                    name='dni'
                    style={{
                        width: '30%'
                    }}
                >
                    <Input data-test='business-dni-input'/>
                </Form.Item>
            </Flex>

            <Form.Item
                // it can be normal or special 
                label='Tipo de Contribuyente: '
                name='type'
            >
                <Select
                    showSearch
                    defaultValue={'Normal'}
                    options={[
                        {label: "Especial", value: "Especial"},
                        {lable: "Normal", value: "Normal"}
                    ]}
                />
            </Form.Item>

            <Flex wrap gap="middle">
                {/* Define good names */}
                
                <Form.Item
                    label='Fecha Constitución: '
                    name='companyIncorporationDate'
                >
                    <DatePicker data-test="business-incorporation-date-input"/>
                </Form.Item>

                <Form.Item
                    label='Fecha Vencimiento de la Empresa: '
                    name='companyExpirationDate'
                >
                    <DatePicker data-test="business-expiration-date-input"/>
                </Form.Item>
                <Form.Item
                    label='Fecha Vencimiento Junta Directiva: '
                    name='directorsBoardExpirationDate'
                >
                    <DatePicker data-test="business-board-expiration-date-input"/>
                </Form.Item>
            </Flex>

            <Form.Item
                rules={[
                    {
                        required: true,
                        message: "Seleccione una actividad económica"
                    }
                ]}
                // it can be normal or special 
                label='Actividad Económica: '
                name='economicActivity'
            >
                <Select
                    data-test='business-economic-activity-input'
                    //defaultValue={economicActivities[0]?.title}
                    showSearch
                    options={economicActivities.map( e => ({ label: e?.title, value: e?.title}))}
                />
            </Form.Item>

            <Divider/>
        </>
    )
}

function BusienssContactInformationForm({people}): JSX.Element{

    const peopleOptions = people.map( p => {
        // i need to convert to format that is valid for select

        return {
            label: p.dni + ' - ' + p?.fullName, 
            value: p.dni + ' - ' + p?.fullName,
            key: p.id,
        }
    })

    return (
        <>
            <Typography.Title level={3}>
                Contactos
            </Typography.Title>

            <Flex gap='middle'>
                <Form.Item 
                    name={"owner"}
                    label={"Propietario"}
                    style={{width: '100%'}}
                    rules={[{required: true, message: "Seleccione un propietario"}]}>
                    <Select
                        showSearch
                        options={peopleOptions}
                    />
                </Form.Item>
            </Flex>
                
            <Flex gap='middle'>
                <Form.Item 
                    name={"accountant"}
                    label={"Contador"}
                    style={{width: '80%'}}>
                    <Select
                        showSearch
                        options={peopleOptions}
                    />
                    
                </Form.Item>
                <Button>Eliminar</Button>
            </Flex>            
            

            <Flex gap='middle'>
                <Form.Item 
                    name={"administrator"}
                    label={"Administrador"}
                    style={{width: '80%'}}>
                    <Select
                        showSearch
                        options={peopleOptions}
                    />
                    
                </Form.Item>
                <Button>Eliminar</Button>
            </Flex>

            <Divider/>
        </>
    )
}


function BusienssContactPreferenceForm(): JSX.Element{

    function cleanContact({field}){
        // clear contact field
        
    }
    return (
        <>
            <Typography.Title level={3}>
                Preferencias de comunicación
            </Typography.Title>
            
            <Form.Item<FormFields> 
                label='Agente encargado de finanzas: '
                name='preferredContact'
            >
                <Select
                    data-test="communication-options-preferred-contact"
                    showSearch
                    style={{minWidth: "150px"}}
                    options={contactOptions}
                />
            </Form.Item>
            <Form.Item<FormFields>
                label='Medio preferido de comunicación: '
                name="preferredChannel"
            >
                <Select
                    data-test="communication-options-preferred-channel"
                    showSearch
                    style={{minWidth: "150px"}}
                    options={channelOptions}
                />
            </Form.Item>

            <Form.Item<FormFields>
                label="Enviar cálculos al: "
                name="sendCalculosTo"
            >
                <Select
                    data-test="communication-options-send-calculos"
                    showSearch
                    style={{minWidth: "150px"}}
                    options={channelOptions}
                />
            </Form.Item>
            
            <Form.Item<FormFields>
                label="Recordatorios: "
                name="reminderInterval"
            >
                <Select
                    data-test="communication-options-reminder-interval"
                    showSearch
                    style={{minWidth: "150px"}}
                    options={reminderIntervalOptions}
                />
            </Form.Item>
        
        </>
    )

}