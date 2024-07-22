import { Form, Input, Button, message, Select, TimePicker, DatePicker } from 'antd'
import type { DatePickerProps } from 'antd'

import * as api from '../util/api'

export default function BranchOfficeLicenseNew(): JSX.Element {
    const [form] = Form.useForm()

    const economicActivities = [
        {
            value: 'Comercio al por menor de productos alimenticios',
            label: 'Comercio al por menor de productos alimenticios',
        },
        {
            value: 'Servicios de transporte terrestre',
            label: 'Servicios de transporte terrestre',
        },
        {
            value: 'Actividades de esparcimiento y recreación',
            label: 'Actividades de esparcimiento y recreación',
        },
        {
            value: 'Servicios de comidas y bebidas',
            label: 'Servicios de comidas y bebidas',
        },
        {
            value: 'Venta de productos electrónicos',
            label: 'Venta de productos electrónicos',
        },
        {
            value: 'Consultoría en tecnología',
            label: 'Consultoría en tecnología',
        },
    ];

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

    interface FormFields {
        taxpayer: string
    }

    return (
        <div>
            Nueva Licencia
            <Form 
                form={form}
                
            >
                <Form.Item<FormFields> 
                    label='Contribuyente: ' 
                    name='taxpayer'>
                    <Input>
                    </Input>
                </Form.Item>
                <Form.Item label='Sede o Establecimiento: '>
                    <Select
                        defaultValue={establishments[0].value}
                        optionFilterProp='label'
                            // onChange={onChange}
                            // onSearch={onSearch}
                        options={establishments}
                    />
                </Form.Item>
                <Form.Item label='Actividad Económica: '>
                    <Select
                        defaultValue={economicActivities[0].value}
                        optionFilterProp='label'
                            // onChange={onChange}
                            // onSearch={onSearch}
                        options={economicActivities}
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