import React, { useEffect, useState } from 'react'

import { FormProps } from 'antd'
import { Form, Input, Button, message, Select, TimePicker, DatePicker } from 'antd'
import type { DatePickerProps } from 'antd'

import type { EconomicActivity, Business, BranchOffice } from '../util/api';

import { useParams } from 'react-router-dom';

import * as api from '../util/api'

export default function BranchOfficeLicenseNew(): JSX.Element {
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

    const registerlicense: FormProps<FiledType>['onFinish'] = async (values) => {

    }

    interface FormFields {
        taxpayer: string
    }

    return (
        <div>
            Nueva Licencia
            <Form 
                form={form}
                onSubmit={registerLicense}
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
                <Form.Item label='Actividad Económica: '>
                    <Select
                        defaultValue={economicActivities[0]?.value}
                        optionFilterProp='label'
                            // onChange={onChange}
                            // onSearch={onSearch}
                        options={economicActivities.map( e => ({ label: e?.title, value: e?.title}))}
                    />
                </Form.Item>
                {/* <Form.Item label='Horario'>
                    <TimePicker.RangePicker />
                </Form.Item> */}
                <Form.Item 
                    label='Fecha de Emisión'
                >
                    <DatePicker onChange={handleIssueDateChange}/>
                </Form.Item>
                <Form.Item 
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