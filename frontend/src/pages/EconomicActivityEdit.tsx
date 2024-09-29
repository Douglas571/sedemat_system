// this will be the form for economic activities 

import {useState, useEffect} from 'react'; 
import { useParams } from 'react-router-dom';
import {PlusOutlined} from '@ant-design/icons';
import { Form, Input, InputNumber, Typography, Button, message, Card, Flex, Table} from 'antd';
import dayjs from 'dayjs';


interface IAlicuota {
    id: number;
    taxPercent: number;
    minTax: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function EconomicActivityForm() {
    const { economicActivityId } = useParams();
    const isEdit = !!Number(economicActivityId);
    const title = isEdit ? 'Editando Actividad Económica' : 'Nueva Actividad Económica';

    const dummyAlicuotas: IAlicuota[] = [
        {id: 1, taxPercent: 0.10, minTax: 100, createdAt: new Date(), updatedAt: new Date()},
        {id: 2, taxPercent: 0.20, minTax: 200, createdAt: new Date(), updatedAt: new Date()},
        {id: 3, taxPercent: 0.30, minTax: 300, createdAt: new Date(), updatedAt: new Date()},
        {id: 4, taxPercent: 0.40, minTax: 400, createdAt: new Date(), updatedAt: new Date()},
        {id: 5, taxPercent: 0.50, minTax: 500, createdAt: new Date(), updatedAt: new Date()},
    ];

    const firstAlicuotaInputFields = (
        <>
            <Flex gap={16}>
                <Form.Item
                    label="Alicuota"
                    name="firstAlicuota"
                    rules={[{ required: true, message: 'Introduzca una alicuota' }]}
                >
                    <InputNumber min={0} step={0.01} 
                        style={{ minWidth: '150px' }}
                        addonAfter="%"
                        decimalSeparator=','
                    
                    />
                </Form.Item>
                <Form.Item
                    label="Mínimo Tributario TCMMV-BCV"
                    name="firstMinTaxMMV"
                    rules={[{ required: true, message: 'Introduzca un monto' }]}
                >
                    <InputNumber min={0} step={0.01} 
                        style={{ minWidth: '100px' }}
                        addonAfter="MMV-BCV"
                        decimalSeparator=','
                    />
                </Form.Item>
            </Flex>
        </>
    )

    return (
        <>
            <Card title={<Typography.Title level={1}>{title}</Typography.Title>}>                
                <Form
                    name="basic"
                    layout="vertical"
                    initialValues={{ remember: true }}
                    onFinish={(values) => console.log(values)}
                    onFinishFailed={(error) => console.log(error)}
                >
                    <Flex gap={16}>
                        <Form.Item
                            label="Código"
                            name="code"
                            rules={[{ required: true, message: 'Introduzca un código' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Título"
                            name="title"
                            rules={[{ required: true, message: 'Introduzca un título' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Flex>

                    { !isEdit ? firstAlicuotaInputFields : null }
                    

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {economicActivityId ? 'Guardar cambios' : 'Registrar'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <EconomicActivityAlicuotaHistory alicuotas={dummyAlicuotas}/>
        </>
    );
}

function EconomicActivityAlicuotaHistory({ alicuotas }) {
    const [showEditAlicuotaModal, setShowEditAlicuotaModal] = useState(false);
    const [selectedAlicuota, setSelectedAlicuota] = useState(null);

    const openEditAlicuotaModal = (id: number) => {
        console.log("new alicuota")
        setShowEditAlicuotaModal(true);
        setSelectedAlicuota(id);
    }

    const deleteAlicuota = (id: number) => {
        console.log(`Deleting alicuota ${id}`)
    }

    const columns = [
        {
            title: 'Alicuota',
            dataIndex: 'taxPercent',
            sorter: (a, b) => a.taxPercent - b.taxPercent,
            render: (value: string) => `${value}%`,
        },
        {
            title: 'Mínimo Tributario TCMMV-BCV',
            dataIndex: 'minTax',
            sorter: (a, b) => a.minTax - b.minTax,
            render: (value: string) => `${value} MMV-BCV`,
        },
        {
            title: 'Fecha de Creación',
            dataIndex: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: '',
            key: 'actions',
            render: (text: string, record: IAlicuota) => (
                <Flex gap={16}>
                    <Button onClick={() => openEditAlicuotaModal(record.id)}>
                        Editar
                    </Button>
                    <Button danger onClick={() => deleteAlicuota(record.id)}>
                        Eliminar
                    </Button>
                </Flex>
            ),
        },
    ];

    return (
        <Card
            title={
                <Flex justify="space-between" align="center">
                    <Typography.Title level={3}>
                        Historial de Alicuotas
                    </Typography.Title>
                    <Button  onClick={() => openEditAlicuotaModal()}>
                        <PlusOutlined />
                        Agregar
                    </Button>
                </Flex>
            }
        >
            <Table columns={columns} dataSource={alicuotas} />
        </Card>
    );
}
