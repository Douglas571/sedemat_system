import React, { useState, useEffect } from 'react'
import { DatePicker, FormProps, Select, Switch } from 'antd'
import { Form, Input, Button, message, Typography, Space, Flex } from 'antd'
import _ from 'lodash'

import * as api from '../util/api'
import type { Business, EconomicActivity } from '../util/api'


const { Title, Paragraph } = Typography

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type BranchOfficeFormFields = {
    address: string 
    phone: string
}

interface ContactForm {
    firstName: string 
    lastName: string 
    dni: string
    phone: string
    whatsapp: string 
    email: string 
}

// TODO: create the needed classes 
interface FormFields {
    businessName: string
    dni: string
    email: string
    branchOffices: Array<BranchOfficeFormFields>

    owner: ContactForm
    accountant: ContactForm
    administrator: ContactForm
}

function BusinessNew(): JSX.Element {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()
    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);

    function clearForm(){
		form.setFieldValue('businessName', '')
		form.setFieldValue('dni', '')
        form.setFieldValue('email', '')
	}

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    const onFinish: FormProps<FiledType>['onFinish'] = async (values: FormFields) => {
        try {
            console.log({values})

            const economicActivityObject = economicActivities.find( e => e.title === values?.economicActivity)
            const economicActivityId = economicActivityObject?.id

            // register contacts
            const { owner, accountant, administrator } = values
            
            // upload the owner and get the id before sending the business
            const registeredOwner = await api.registerContact(owner)
            console.log({registeredOwner})



            // upload the accountant if it exists 
            // upload the administrator 
            
            const newBusiness = {
                ..._.omit(values, ['branchOffices']), 
                economicActivityId,
                ownerContactId: registeredOwner.id
            }
            let response = await api.sendBusinessData(newBusiness)
            console.log({response})
            let businessId = response.id
            
            // everything fine
            values.branchOffices.forEach( async (office) => {
                let officeToRegister = { ...office, businessId}
                let newOffice = await api.registerBranchOffice(officeToRegister)
                console.log({registeredOffice: newOffice})
            })

            messageApi.open({
                type: 'success',
                content: "Contribuyente guardado exitosamente",
            });

            clearForm()
        } catch (error) {
            console.log({error})
            let msg = "Hubo un error"
            msg = error.message

            if (error.message === "duplicated dni") {
                messageApi.open({
                    type: 'error',
                    content: `Cédula ya está registrada`,
                });

                return
            }

            messageApi.open({
                type: 'error',
                content: msg,
            });
        }
    }

    return (
        <div>
            {contextHolder}
            <Title level={2}>
                Nuevo Contribuyente
            </Title>
            
            <Form form={form}
                onFinish={onFinish}
                initialValues={{
                    branchOffices: [
                        {}
                    ]
                }}
            >
                <Flex gap='middle'>
                    <Form.Item<FormFields>
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
                    <Form.Item<FormFields>
                        rules={[
                            {
                                required: true,
                                message: "Introduzca el rif o la cédula"
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
                {/* <Form.Item<FormFields>
                    label='Correo Electrónico'
                    name='email'
                >
                    <Input/>
                </Form.Item> */}

                <Space>
                    <Form.Item
                        // it can be normal or special 
                        label='Tipo: '
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

                    <Form.Item label="Es Alquilado?" name='e'>
                        <Switch checkedChildren="SÍ" unCheckedChildren="NO"></Switch>
                    </Form.Item>
                </Space>

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

                <Title level={3}>
                    Propietario
                </Title>
                <Space>
                    <Form.Item<FormFields>
                        rules={[
                            {
                                required: true,
                                message: "El nombre del propietario es requerido"
                            }
                        ]}
                        label='Nombre: '
                        name={["owner", "firstName"]}
                    >
                        <Input data-test='owner-first-name-input'/>
                    </Form.Item>
                    <Form.Item
                        rules={[
                            {
                                required: true,
                                message: "El apellido del propietario es requerido"
                            }
                        ]}
                        label='Apellido: '
                        name={["owner", "lastName"]}
                    >
                        <Input data-test="owner-last-name-input"/>
                    </Form.Item>
                    <Form.Item
                        rules={[
                            {
                                required: true,
                                message: "La cédula del propietario es requerida"
                            }
                        ]}
                        label='Cédula'
                        name={["owner", "dni"]}
                    >
                        <Input data-test="owner-dni-input"/>
                    </Form.Item>
                </Space>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "El teléfono del propietario es requerido"
                        }
                    ]}
                    label='Teléfono: '
                    name={["owner", "phone"]}
                >
                    <Input data-test="owner-phone-input"/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={["owner", "whatsapp"]}
                >
                    <Input data-test="owner-whatsapp-input"/>
                </Form.Item>
                <Form.Item
                    rules={[
                        {
                            required: true,
                            message: "El correo del propietario es requerido"
                        }
                    ]}
                    label='Correo: '
                    name={["owner", "email"]}
                >
                    <Input data-test="owner-email-input"/>
                </Form.Item>

                <Title level={3}>
                    Contador
                </Title>
                <Space>
                    <Form.Item
                        label='Nombre: '
                        name={["accountant", "firstName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Apellido: '
                        name={["accountant", "lastName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Cédula: '
                        name={["accountant", "dni"]}
                    >
                        <Input/>
                    </Form.Item>
                </Space>
                <Form.Item
                    label='Teléfono: '
                    name={["accountant", "phone"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={["accountant", "whatsapp"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Correo: '
                    name={["accountant", "email"]}
                >
                    <Input/>
                </Form.Item>

                <Title level={3}>
                    Administrador
                </Title>
                <Space>
                    <Form.Item
                        label='Nombre: '
                        name={["administrator", "firstName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Apellido: '
                        name={["administrator", "lastName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Cédula: '
                        name={["administrator", "dni"]}
                    >
                        <Input/>
                    </Form.Item>
                </Space>
                <Form.Item
                    label='Teléfono: '
                    name={["administrator", "phone"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={["administrator", "whatsapp"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Correo: '
                    name={["administrator", "email"]}
                >
                    <Input/>
                </Form.Item>

                <Form.List
                    name='branchOffices'>
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    <Title level={3}>
                                        Sucursales
                                    </Title>
                                    {
                                        fields.map(field => {
                                            return (
                                                <div>
                                                    <span>
                                                        <h4>#{ field.name + 1 } <Button onClick={() => remove(field.name)}>Eliminar</Button></h4>
                                                        <Form.Item label="Zona" name={[field.name, 'zone']}>
                                                            <Input data-test={`branch-office-${field.name}-zone`}/>
                                                        </Form.Item>

                                                        <Form.Item label="Dirección" name={[field.name, 'address']}>
                                                            <Input data-test={`branch-office-${field.name}-address`}/>
                                                        </Form.Item>

                                                        <Space>
                                                            <Form.Item label="Dimensiones (Mts2)" name={[field.name, 'dimensions']}>
                                                                <Input data-test={`branch-office-${field.name}-dimensions`}/>
                                                            </Form.Item>

                                                            <Form.Item label="Tipo" name={[field.name, 'type']}>
                                                                <Input data-test={`branch-office-${field.name}-origin`}/>
                                                            </Form.Item>
                                                        </Space>
                                                    </span>
                                                </div>
                                            )
                                        })
                                    }
                                    <Button 
                                        data-test='branch-office-add-button'
                                        onClick={() => add()}>Agregar Sucursal</Button>
                                    {/* <Button onClick={() => console.log({contenido: form.getFieldsValue()})}>Mostrar contenido</Button> */}
                                </div>
                            )
                        }}
                </Form.List>

                <Form.Item>
                    <Button 
                        data-test='submit-button'
                        type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default BusinessNew