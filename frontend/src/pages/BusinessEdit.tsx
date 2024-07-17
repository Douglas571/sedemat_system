import React, { useEffect } from 'react'
import { FormProps } from 'antd'
import { Form, Input, Button, message } from 'antd'
import { useParams } from 'react-router-dom';

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

            form.setFieldValue('businessName', business?.businessName)
            form.setFieldValue('dni', business?.dni)
            form.setFieldValue('email', business?.email)
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
                <Form.Item>
                    <Button type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default BusinessNew