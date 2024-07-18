import React from 'react'
import { FormProps } from 'antd'
import { Form, Input, Button, message } from 'antd'
import _ from 'lodash'

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type BranchOfficeFormFields = {
    address: string 
    phone: string
}

type BranchOffice = {
    id?: number
    address: string 
    phone: string
    businessId: number
}

type FormFields = {
    businessName: string
    dni: string
    email: string

    branchOffices: Array<BranchOfficeFormFields>
}

async function sendBusinessData(business: FormFields) {
    const url = `${HOST}/v1/businesses/`;  // Replace HOST with your actual host URL
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(business)
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.msg || 'Failed to post business data');
        }
        console.log('Business data posted successfully');
        // Optionally handle response data here
        let data = await response.json()
        return data
    } catch (error) {
        console.error('Error posting business data:', error.message);
        // Handle error state in your application
        throw Error(error.message)
    }
}

async function registerBranchOffice(branchOffice: BranchOffice): Promise<BranchOffice> {
    console.log({branchOffice})
    const url = `${HOST}/v1/branchOffices`
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchOffice),
    });
    console.log("after fetch")

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to register branch office: ${errorData.error?.msg || response.statusText}`);
    }

    console.log('Branch office registered successfully');

    const data = await response.json()
    return data
}

function BusinessNew(): JSX.Element {
    const [form] = Form.useForm()
    const [brachOfficesForm] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

    function clearForm(){
		form.setFieldValue('businessName', '')
		form.setFieldValue('dni', '')
        form.setFieldValue('email', '')
	}



    const onFinish: FormProps<FiledType>['onFinish'] = async (values: FormFields) => {
        try {
            
            let response = await sendBusinessData(_.omit(values, ['branchOffices']))
            console.log({response})
            let businessId = response.id
            // everything fine 
            

            values.branchOffices.forEach( async (office) => {
                let officeToRegister = { ...office, businessId}
                let newOffice = await registerBranchOffice(officeToRegister)
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
                    <Input/>
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
                    <Input/>
                </Form.Item>
                <Form.Item<FormFields>
                    label='Correo Electrónico'
                    name='email'
                >
                    <Input/>
                </Form.Item>

                <Form.List<FormFields>
                    name='branchOffices'>
                        {(fields, { add, remove }) => {
                            return (
                                <div>
                                    <h3>Sucursales</h3>
                                    {
                                        fields.map(field => {
                                            return (
                                                <div>
                                                    <span>
                                                        <h4>#{ field.name + 1 } <Button onClick={() => remove(field.name)}>Eliminar</Button></h4>
                                                        <Form.Item label="Dirección" name={[field.name, 'address']}>
                                                          <Input />
                                                        </Form.Item>
                                                        <Form.Item label="Teléfono" name={[field.name, 'phone']}>
                                                          <Input />
                                                        </Form.Item>
                                                    </span>
                                                </div>
                                            )
                                        })
                                    }
                                    <Button onClick={() => add()}>Agregar Sucursal</Button>
                                    <Button onClick={() => console.log({contenido: form.getFieldsValue()})}>Mostrar contenido</Button>
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