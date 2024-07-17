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
    } catch (error) {
        console.error('Error posting business data:', error.message);
        // Handle error state in your application
    }
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



    const onFinish: FormProps<FiledType>['onFinish'] = async (values) => {
        try {
            
            /*
                I need value to have a list of branch offices
                branchOffices {

                    codeName,
                    address,
                    phone,

                }


            */

            // in this case, everything is new, so the business should be send first
            // then, i will asing the branch offices to the business
            
            let response = await sendBusinessData(_.omit(values, ['branchOffices']))
            // everything fine 
            messageApi.open({
                type: 'success',
                content: "Contribuyente guardado exitosamente",
            });

            clearForm()
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