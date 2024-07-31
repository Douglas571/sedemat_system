import { useEffect, useState } from 'react'
import { DatePicker, FormProps, Select } from 'antd'
import { Form, Input, Button, message, Flex, Typography } from 'antd'
const { Title } = Typography
import { useParams } from 'react-router-dom';

import dayjs from 'dayjs';

import { 
    businessPriority, 
    channelOptions, 
    contactOptions, 
    reminderIntervalOptions 
} from './BusinessShared'

import type { BusinessFormFields } from './BusinessShared';

import * as api from '../util/api'

import type { 
    Business,
    BranchOffice
} from '../util/api'

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type FormFields = {
    businessName: string
    dni: string
    email: string
}

function BusinessNew(): JSX.Element {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()
    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);

    const [business, setBusiness] = useState<Business>()
    const [branchOffices, setBranchOffices] = useState<BranchOffice>()

    //const [business, setBusiness] = React.useState<Business>()
    let { businessId } = useParams();


    function clearForm(){
		form.setFieldValue('businessName', '')
		form.setFieldValue('dni', '')
        form.setFieldValue('email', '')
	}

    // get the business by the id in the url 
    useEffect(() => {
        // first load of data
        loadBusinessData()
        loadEconomicActivityData()
    }, [])

    useEffect(() => {
        initFormData()
    }, [business, branchOffices])

    async function initFormData() {
        if (!business) {
            return 
        }

        form.setFieldValue('businessName', business?.businessName)
        form.setFieldValue('dni', business?.dni)
        form.setFieldValue('email', business?.email)

        form.setFieldValue('branchOffices', branchOffices)

        form.setFieldValue('companyIncorporationDate', dayjs('2040-1-1'))
        form.setFieldsValue({
            companyIncorporationDate: dayjs(business.companyIncorporationDate),
            companyExpirationDate: dayjs(business.companyExpirationDate),
            directorsBoardExpirationDate: dayjs(business.directorsBoardExpirationDate),

            economicActivity: business.economicActivity.title,
            preferredContact: 'CONTACT',
            preferredChannel: "WHATSAPP",
            sendCalculosTo: "CORRREO",
            reminderInterval: "CADA 3 DIAS"
        })

    }

    async function loadBusinessData() {
        // get the business data 
        // feed the form with the business data
        if (businessId) {
            let businessData = await api.fetchBusinessById(Number(businessId))
            let branchOffices = await api.fetchBranchOffices(Number(businessId))

            setBusiness(businessData)
            setBranchOffices(branchOffices)

            console.log(JSON.stringify(business, null, 2))
        }
    }

    async function loadEconomicActivityData() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    const onFinish: FormProps<FiledType>['onFinish'] = async (values) => {
        // when saved, send the business data to the server

        // if error
            // show error
        // if not
            // show the business was saved successfully
        try {

            const updatedBusiness: Business = {
                id: businessId,
                ...values
            }
            
            let response = await api.updateBusinessData(Number(businessId), updatedBusiness)

            values.branchOffices.forEach( async (office) => {
                if (!office.businessId) {
                    console.log("create new office")
                    let newOffice = { ...office, businessId: Number(businessId)}
                    console.log({newOfficeApp: newOffice})
                    let registeredBranchOffice = await api.registerBranchOffice(newOffice)
                    console.log({registeredBranchOffice})
                } else {
                    console.log("updating office", office.businessId)
                    console.log({office})
                    let updatedBranchOffice = await api.updateBranchOffice(office)
                    console.log({updatedBranchOffice})
                }
            })

            // everything fine 
            messageApi.open({
                type: 'success',
                content: "Contribuyente guardado exitosamente",
            });

            //clearForm()
        } catch (error) {
            console.log({error})
            let msg = "Hubo un error"


            messageApi.open({
                type: 'error',
                content: msg,
            });
        }
    }

    return (
        <Flex>
            {contextHolder}
            
            <Form form={form}
                onFinish={onFinish}
            >
                <Form.Item<FormFields>
                    rules={[
                        {
                            required: true,
                            message: "Introduzca la razón social"
                        }
                    ]}
                    label='Razón Social'
                    name='businessName'
                >
                    <Input
                        data-test="business-name-input"
                    />
                </Form.Item>
                <Form.Item<FormFields>
                    rules={[
                        {
                            required: true,
                            message: "Introduzca el rif o la cédula"
                        }
                    ]}
                    label='Rif o Cédula'
                    name='dni'
                >
                    <Input
                        data-test="business-dni-input"
                    />
                </Form.Item>
                {/* <Form.Item<FormFields>
                    label='Correo Electrónico'
                    name='email'
                >
                    <Input/>
                </Form.Item> */}

                <Form.Item
                    // it can be normal or special 
                    label='Tipo de Contribuyente: '
                    name='type'
                    data-test="business-type-select"
                >
                    <Select
                        
                        showSearch
                        defaultValue={'Normal'}
                        options={businessPriority}
                    />
                </Form.Item>

                <Flex>
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

                <Form.Item<BusinessFormFields>
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

                <Title level={3}>
                    Preferencias de comunicación
                </Title>

                <Form.Item<BusinessFormFields> 
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
                    <Form.Item<BusinessFormFields>
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

                    <Form.Item<BusinessFormFields>
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
                    
                    <Form.Item<BusinessFormFields>
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

                <Form.List
                    name='branchOffices'>
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    <h3>Sucursales</h3>
                                    {
                                        fields.map(field => {
                                            return (
                                                <div key={field.name}>
                                                    <span>
                                                        <h4>#{ field.name + 1 } <Button onClick={() => remove(field.name)}>Eliminar</Button></h4>
                                                        <Form.Item label="Dirección" name={[field.name, 'address']}>
                                                            <Input />
                                                        </Form.Item>
                                                    </span>
                                                </div>
                                            )
                                        })
                                    }
                                    <Button 
                                        data-test="button-add-branch-office"
                                        onClick={() => add()}
                                        >Agregar Sucursal</Button>
                                    <Button onClick={() => console.log({contenido: form.getFieldsValue()})}>Mostrar contenido</Button>
                                </div>
                            )
                        }}
                </Form.List>



                <Form.Item>
                    <Button type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </Flex>
    )
}

export default BusinessNew