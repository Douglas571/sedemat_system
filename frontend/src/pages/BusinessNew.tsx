import React, { useState, useEffect } from 'react'
import { DatePicker, FormProps, Select } from 'antd'
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

            return
            
            let response = await api.sendBusinessData(_.omit(values, ['branchOffices']))
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


            messageApi.open({
                type: 'error',
                content: msg,
            });
        }
    }

    return (
        <div>
            {contextHolder}
            <h1>Nuevo Contribuyente</h1>
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
                        <Input/>
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
                        <Input/>
                    </Form.Item>
                </Flex>
                {/* <Form.Item<FormFields>
                    label='Correo Electrónico'
                    name='email'
                >
                    <Input/>
                </Form.Item> */}

                <Form.Item
                    // it can be normal or special 
                    label='Tipo: '
                    name='type'
                >
                    <Select
                        defaultValue={'Normal'}
                        options={[
                            {label: "Especial", value: "Especial"},
                            {lable: "Normal", value: "Normal"}
                        ]}
                    />
                </Form.Item>

                <Flex>
                    {/* Define good names */}
                    <Form.Item
                        label='Fecha Constitución: '
                        name='a'
                    >
                        <DatePicker/>
                    </Form.Item>

                    <Form.Item
                        label='Fecha Vencimiento de la Empresa: '
                        name='b'
                    >
                        <DatePicker/>
                    </Form.Item>
                    <Form.Item
                        label='Fecha Vencimiento Junta Directiva: '
                        name='c'
                    >
                        <DatePicker/>
                    </Form.Item>
                </Flex>

                <Form.Item
                    // it can be normal or special 
                    label='Actividad Económica: '
                    name='economicActivity'
                >
                    <Select
                        //defaultValue={economicActivities[0]?.title}
                        showSearch
                        options={economicActivities.map( e => ({ label: e?.title, value: e?.title}))}
                    />
                </Form.Item>

                <Title level={3}>
                    Propietario
                </Title>
                <Space>
                    <Form.Item
                        label='Nombre: '
                        name={["owner", "firstName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Apellido: '
                        name={["owner", "lastName"]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label='Cédula'
                        name={["owner", "dni"]}
                    >
                        <Input/>
                    </Form.Item>
                </Space>
                <Form.Item
                    label='Teléfono: '
                    name={["owner", "phone"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Whatsapp: '
                    name={["owner", "whatsapp"]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    label='Correo: '
                    name={["owner", "email"]}
                >
                    <Input/>
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
                                                            <Input />
                                                        </Form.Item>

                                                        <Form.Item label="Dirección" name={[field.name, 'address']}>
                                                            <Input />
                                                        </Form.Item>

                                                        <Space>
                                                            <Form.Item label="Dimensiones (Mts2)" name={[field.name, 'dimensions']}>
                                                                <Input />
                                                            </Form.Item>

                                                            <Form.Item label="Tipo" name={[field.name, 'type']}>
                                                                <Input />
                                                            </Form.Item>
                                                        </Space>
                                                    </span>
                                                </div>
                                            )
                                        })
                                    }
                                    <Button onClick={() => add()}>Agregar Sucursal</Button>
                                    {/* <Button onClick={() => console.log({contenido: form.getFieldsValue()})}>Mostrar contenido</Button> */}
                                </div>
                            )
                        }}
                </Form.List>

                <Form.Item>
                    <Button type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default BusinessNew