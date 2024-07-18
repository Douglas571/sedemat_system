import React, { useEffect } from 'react'
import { FormProps } from 'antd'
import { Form, Input, Button, message } from 'antd'
import { useParams } from 'react-router-dom';

import * as api from '../util/api'

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

type Business = {
    businessName: string
    dni: string 
    email: string 
}

type FormFields = {
    businessName: string
    dni: string
    email: string
}

async function fetchBusiness(businessId: number): Promise<Business> {
    const url = `${HOST}/v1/businesses/${businessId}`;  // Replace HOST with your actual host URL

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Business with ID ${businessId} does not exist`);
            } else {
                throw new Error(`Failed to fetch business data: ${response.statusText}`);
            }
        }

        const business: Business = await response.json();
        return business;
    } catch (error) {
        console.error('Error fetching business data:', error);
        throw error;
    }
}

async function fetchBranchOffices(businessId: number): Promise<BranchOffice[]> {
    const response = await fetch(`${HOST}/v1/branchoffices?businessid=${businessId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch branch offices: ${errorData.error?.msg || response.statusText}`);
    }

    const branchOffices = await response.json();
    return branchOffices;
}

async function updateBusinessData(id: number, business: Business) {
    const url = `${HOST}/v1/businesses/${id}`;  // Replace HOST with your actual host URL
    const requestOptions = {
        method: 'PUT',
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

async function updateBranchOffice(branchOffice: BranchOffice): Promise<BranchOffice> {
    const response = await fetch(`${HOST}/v1/branchOffices/${branchOffice.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchOffice),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update branch office: ${errorData.error?.msg || response.statusText}`);
    }

    const updatedBranchOffice = await response.json();
    return updatedBranchOffice;
}

function BusinessNew(): JSX.Element {
    const [form] = Form.useForm()
    const [messageApi, contextHolder] = message.useMessage()

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
    }, [])

    async function loadBusinessData() {
        // get the business data 
        // feed the form with the business data
        if (businessId) {
            let business = await fetchBusiness(Number(businessId))
            let branchOffices = await fetchBranchOffices(Number(businessId))

            form.setFieldValue('businessName', business?.businessName)
            form.setFieldValue('dni', business?.dni)
            form.setFieldValue('email', business?.email)

            form.setFieldValue('branchOffices', branchOffices)
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
            
            let response = await updateBusinessData(Number(businessId), updatedBusiness)

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
                    let updatedBranchOffice = await updateBranchOffice(office)
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
        <div>
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