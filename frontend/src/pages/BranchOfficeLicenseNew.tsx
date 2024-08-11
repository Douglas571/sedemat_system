import React, { useEffect, useState } from 'react'

import { FormProps } from 'antd'
import { Form, Input, Button, message, Select, TimePicker, DatePicker } from 'antd'
import type { DatePickerProps } from 'antd'

import type { EconomicActivity, Business, BranchOffice, License } from '../util/api';

import { useParams } from 'react-router-dom';

import * as api from '../util/api'

export default function BranchOfficeLicenseNew(): JSX.Element {
    const [messageApi, contextHolder] = message.useMessage()
    const [form] = Form.useForm()
    let { businessId, branchOfficeId } = useParams();

    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);
    const [business, setBusiness] = useState<Business>();
    const [branchOffice, setBranchOffice] = useState<BranchOffice>();

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            // Load economic activities
            const economicActivities = await api.getEconomicActivities();
            console.log({economicActivities})
            setEconomicActivities(economicActivities);

            // Fetch the business
            const business = await api.fetchBusinessById(Number(businessId));
            console.log({business})
            setBusiness(business);

            // Fetch the branch office
            const branchOffice = await api.getBranchOfficeById(Number(branchOfficeId));
            console.log({branchOffice})
            if (branchOffice) {
                setBranchOffice(branchOffice);
            }

            form.setFieldsValue({
                taxpayer: business.businessName,
                branchOffice: branchOffice?.address
            })

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    const establishments = [
        {
            value: 'Calle Bolívar',
            label: 'Calle Bolívar',
        },
        {
            value: 'Algarbe',
            label: 'Algarbe',
        },
    ]

    const handleIssueDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        console.log({ date })

        // Assuming you want to add one year to the date
        const expirationDate = date?.clone().add(1, 'year')
        
        form.setFieldsValue({
            expirationDate
        })
    }


    function cleanForm() {
        form.setFieldsValue({
            economicActivity: '',
            issuedDate: '',
            expirationDate: ''
        })
    }
    const registerlicense: FormProps<FiledType>['onFinish'] = async (values) => {
        // get businessId
        // get branchOfficeId
        // create a license object

        try {
            const economicActivityId = economicActivities.find( e => e.title === values.economicActivity )?.id
            console.log({economicActivityId})

            if (!branchOfficeId || !economicActivityId){
                return null
            }

            let newLicense = {
                branchOfficeId: Number(branchOfficeId),
                economicActivityId,
                issuedDate: values.issuedDate,
                expirationDate: values.expirationDate,

            }
            console.log({newLicense})
            let registeredLicense = await api.registerLicense(newLicense)
            console.log({registeredLicense})

            messageApi.open({
                type: 'success',
                content: "Licencia Otorgada Exitosamente.",
            });

            cleanForm()


        } catch (error) {
            console.error({error})

            messageApi.open({
                type: 'error',
                content: "Hubo un error.",
            });
        }
    }

    interface FormFields {
        taxpayer: string,
        branchOffice: string,
        economicActivity: string,
        issuedDate: Date,
        expirationDate: Date
    }

    return (
        <div>
            {contextHolder}
            Nueva Licencia
            <Form 
                form={form}
                onFinish={registerlicense}
            >
                <Form.Item<FormFields> 
                    label='Contribuyente: ' 
                    name='taxpayer'
                >
                    <Input
                        disabled
                    >
                    </Input>
                </Form.Item>
                <Form.Item 
                    label='Sede o Establecimiento: '
                    name="branchOffice"
                >
                    <Select
                        disabled
                        defaultValue={establishments[0].value}
                        optionFilterProp='label'
                            // onChange={onChange}
                            // onSearch={onSearch}
                        options={establishments}
                    />
                </Form.Item>
                <Form.Item<FormFields>
                    rules={[
                        {required: true,
                            message: "Por favor seleccionar una Actividad Económica"
                        }
                    ]}
                    label='Actividad Económica: '
                    name='economicActivity'>
                    <Select
                        defaultValue={economicActivities[0]?.title}
                        optionFilterProp='label'
                            // onChange={onChange}
                            // onSearch={onSearch}
                        options={economicActivities.map( e => ({ label: e?.title, value: e?.title}))}
                    />
                </Form.Item>
                {/* <Form.Item label='Horario'>
                    <TimePicker.RangePicker />
                </Form.Item> */}
                <Form.Item<FormFields>
                    rules={[
                        {required: true}
                    ]}
                    label='Fecha de Emisión'
                    name='issuedDate'
                >
                    <DatePicker onChange={handleIssueDateChange}/>
                </Form.Item>
                <Form.Item<FormFields>
                    rules={[
                        {required: true}
                    ]}
                    label='Fecha de Expiración' 
                    name='expirationDate'>
                    <DatePicker/>
                </Form.Item>

                <Form.Item>
                    <Button type='primary' htmlType='submit'>Guardar</Button>
                </Form.Item>
            </Form>
        </div>
    )
}