// react related libraries 
import {useState, useEffect} from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';

// third party libraries
import dayjs from 'dayjs';

// component libraries 
import {PlusOutlined} from '@ant-design/icons';
import { 
    Form, 
    FormProps,
    Input, 
    InputNumber, 
    Typography, 
    Button, 
    message, 
    Card, 
    Flex, 
    Table, Popconfirm, DatePicker, Modal} from 'antd';
// own libraries 
import { EconomicActivity } from '../util/types';
import economicActivitiesService from '../services/EconomicActivitiesService';
import useAuthentication from '../hooks/useAuthentication';


interface IAlicuota {
    id: number;
    taxPercent: number;
    minTax: number;
    createdAt: Date;
    updatedAt: Date;
}

interface IEconomicActivityForm {
    code: string;
    title: string;
    firstAlicuota?: number;
    firstMinTaxMMV?: number;
}

export default function EconomicActivityForm() {
    const { economicActivityId } = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const { userAuth } = useAuthentication()

    const [showEditAlicuotaModal, setShowEditAlicuotaModal] = useState(false);
    const [selectedAlicuota, setSelectedAlicuota] = useState(null);

    // data from api
    const [economicActivity, setEconomicActivity] = useState<EconomicActivity>({} as EconomicActivity);

    const isEdit = !!Number(economicActivityId);
    const title = isEdit ? 'Editando Actividad Económica' : 'Nueva Actividad Económica';

    const dummyAlicuotas: IAlicuota[] = [
        {id: 1, taxPercent: 0.10, minTax: 100, createdAt: new Date(), updatedAt: new Date()},
        {id: 2, taxPercent: 0.20, minTax: 200, createdAt: new Date(), updatedAt: new Date()},
        {id: 3, taxPercent: 0.30, minTax: 300, createdAt: new Date(), updatedAt: new Date()},
        {id: 4, taxPercent: 0.40, minTax: 400, createdAt: new Date(), updatedAt: new Date()},
        {id: 5, taxPercent: 0.50, minTax: 500, createdAt: new Date(), updatedAt: new Date()},
    ];

    // component functions 
    const onFinish: FormProps<IEconomicActivityForm>['onFinish'] = async (values: IEconomicActivityForm) => {
        console.log('Received values:', values);
        try {
            // if is new 
                // this will only load the general information 
                // if first alicuota is filled, send it together 

            // if is editing 
                // just update the code and title with economic activities service
                // it require a token 

                if (isEdit) {
                    let updatedEconomicActivity = await economicActivitiesService.update(Number(economicActivityId), {...values}, userAuth.token);

                    console.log({updatedEconomicActivity})
                } else {
                    let createdEconomicActivity = await economicActivitiesService.create({...values}, userAuth.token);
                    console.log({createdEconomicActivity})
                    
                }

                message.success(`Actividad Económica ${isEdit ? 'editada' : 'creada'} con éxito`);

                navigate('/economic-activities')

        } catch (error) {
            console.log({error})


            message.error((error as Error).message);
        }
        
    }

    // loading data
    const loadEconomicActivityData = async () => {
        if (isEdit) {
            const fetchedEconomicActivity = await economicActivitiesService.findById(Number(economicActivityId));
            setEconomicActivity({...fetchedEconomicActivity});

            form.setFieldsValue({code: fetchedEconomicActivity.code, title: fetchedEconomicActivity.title})
        } else {
            setEconomicActivity({} as EconomicActivity);
        }
    }

    // use effects 
    useEffect(() => {
        loadEconomicActivityData();
    }, []);

    const firstAlicuotaInputFields = (
        <>
            <Flex gap={16}>
                <Form.Item<IEconomicActivityForm>
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
                <Form.Item<IEconomicActivityForm>
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

    const openEditAlicuotaModal = (id: number) => {
        console.log("new alicuota")
        setShowEditAlicuotaModal(true);
        setSelectedAlicuota(id);
    }

    const deleteAlicuota = (id: number) => {
        console.log(`Deleting alicuota ${id}`)
    }

    return (
        <Flex vertical gap={16}>
            <Card title={<Typography.Title level={1}>{title}</Typography.Title>}>                
                <Form
                    form={form}
                    name="basic"
                    layout="vertical"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={(error) => console.log(error)}
                >
                    <Flex gap={16}>
                        <Form.Item<IEconomicActivityForm>
                            label="Código"
                            name="code"
                            rules={[{ required: true, message: 'Introduzca un código' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item<IEconomicActivityForm>
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

            {
                isEdit && (
                    <>
                        <EconomicActivityAlicuotaHistory alicuotas={dummyAlicuotas}
                        onNewAlicuota={() => openEditAlicuotaModal(dummyAlicuotas.length + 1)}
                        onEditAlicuota={(id) => openEditAlicuotaModal(id)}
                        onDeleteAlicuota={(id) => deleteAlicuota(id)}
                    />

                    <EditAlicuotaModal
                        open={showEditAlicuotaModal}
                        onSubmit={(values) => console.log(values)}
                        onCancel={() => setShowEditAlicuotaModal(false)}
                    />
                    </>
                )
            }

        </Flex>
    );
}

function EditAlicuotaModal({open, onSubmit, onCancel}) {
    const [form] = Form.useForm();
    const submit = () => {
        form.validateFields().then((values) => {
            onSubmit(values);
            form.resetFields();
        })
    }
    return (
        <Modal
            open={open}
            title="Editar o crear una alicuota"
            okText="Guardar"
            cancelText="Cancelar"
            onOk={submit}
            onCancel={onCancel}
        >
            <Form form={form} layout="vertical">
                <Flex gap={16}>
                    <Form.Item
                        label="Alicuota"
                        name="newAlicuota"
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
                        name="newMinTaxMMV"
                        rules={[{ required: true, message: 'Introduzca un monto' }]}
                    >
                        <InputNumber min={0} step={0.01} 
                            style={{ minWidth: '100px' }}
                            addonAfter="MMV-BCV"
                            decimalSeparator=','
                        />
                    </Form.Item>
                </Flex>
                <Form.Item
                    name="createdAt"
                    label="Fecha de creación"
                    rules={[{ required: true, message: 'Debe introducir una fecha de creación' }]}
                >
                    <DatePicker />
                </Form.Item>
            </Form>
        </Modal>
    );
}

function EconomicActivityAlicuotaHistory({ alicuotas, onNewAlicuota, onEditAlicuota, onDeleteAlicuota }) {

    const columns = [
        {
            title: 'Alicuota',
            dataIndex: 'taxPercent',
            sorter: (a, b) => a.taxPercent - b.taxPercent,
            showSorterTooltip: false,
            render: (value: string) => `${value}%`,
        },
        {
            title: 'Mínimo Tributario TCMMV-BCV',
            dataIndex: 'minTax',
            sorter: (a, b) => a.minTax - b.minTax,
            showSorterTooltip: false,
            render: (value: string) => `${value} MMV-BCV`,
        },
        {
            title: 'Fecha de Creación',
            dataIndex: 'createdAt',
            showSorterTooltip: false,
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            render: (value: string) => dayjs(value).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: '',
            key: 'actions',
            render: (text: string, record: IAlicuota) => (
                <Flex gap={16}>
                    <Button onClick={() => onEditAlicuota(record.id)}>
                        Editar
                    </Button>
                    <Popconfirm
                        title="¿Estás seguro de eliminar esta alicuota?"
                        onConfirm={() => onDeleteAlicuota(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button danger>
                            Eliminar
                        </Button>
                    </Popconfirm>
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
                    <Button  onClick={() => onNewAlicuota()}>
                        <PlusOutlined />
                        Agregar
                    </Button>
                </Flex>
            }
        >
            <Table columns={columns} dataSource={alicuotas}/>
        </Card>
    );
}
