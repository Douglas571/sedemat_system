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
    Table, Popconfirm, DatePicker, Modal,
    Descriptions} from 'antd';
// own libraries 
import { EconomicActivity, IAlicuota } from '../util/types';
import economicActivitiesService from '../services/EconomicActivitiesService';
import alicuotaService from '../services/alicuotaService';
import useAuthentication from '../hooks/useAuthentication';

import { percentHandler, formatPercents } from '../util/currency';

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
    const [selectedAlicuota, setSelectedAlicuota] = useState<IAlicuota | undefined>();

    // data from api
    const [economicActivity, setEconomicActivity] = useState<EconomicActivity>({} as EconomicActivity);

    const isEdit = !!Number(economicActivityId);
    const title = isEdit ? 'Editando Actividad Económica' : 'Nueva Actividad Económica';

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

                let economicActivityData = {
                    code: values.code,
                    title: values.title,
                }

                if (isEdit) {
                    let updatedEconomicActivity = await economicActivitiesService.update(Number(economicActivityId), economicActivityData, userAuth.token);

                    console.log({updatedEconomicActivity})
                } else {

                    economicActivityData.firstAlicuota = percentHandler(values.firstAlicuota).divide(100).value;
                    economicActivityData.firstMinTaxMMV = values.firstMinTaxMMV;

                    let createdEconomicActivity = await economicActivitiesService.create(economicActivityData, userAuth.token);
                    console.log({createdEconomicActivity})
                }

                message.success(`Actividad Económica ${isEdit ? 'editada' : 'creada'} con éxito`);

                navigate('/economic-activities')

        } catch (error) {
            console.log({error})


            message.error((error as Error).message);
        }
        
    }

    const handleNewAlicuota = async (alicuota: IAlicuota) => {
        try {
            console.log({NewAlicuota: alicuota})


            setShowEditAlicuotaModal(false);

            let newAlicuota = await alicuotaService.create({
                ...alicuota,
                economicActivityId: economicActivity.id
            }, userAuth.token)
            console.log({newAlicuota})

            loadEconomicActivityData();

            message.success('Alicuota registrada correctamente');
        } catch (error) {
            message.error((error as Error).message);
        }
    }

    const handleEditAlicuota = async (id: number, alicuota: IAlicuota) => {
        try {
            console.log({EditedAlicuota: alicuota})

            

            let updatedAlicuota = await alicuotaService.update(id, alicuota, userAuth.token);

            setShowEditAlicuotaModal(false);
            setSelectedAlicuota(undefined);

            loadEconomicActivityData();

            message.success('Alicuota actualizada correctamente');
        } catch (error) {
            message.error((error as Error).message);
        }
    }

    const handleCancelEditAlicuota = () => {
        setShowEditAlicuotaModal(false);
        setSelectedAlicuota(undefined);
    }

    // loading data
    const loadEconomicActivityData = async () => {
        if (isEdit) {
            const fetchedEconomicActivity = await economicActivitiesService.findById(Number(economicActivityId));
            setEconomicActivity({...fetchedEconomicActivity});

            console.log({fetchedEconomicActivity})

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

    const openEditAlicuotaModal = (id?: number) => {
        if (id) {
            console.log(`Editing alicuota ${id}`)
            setShowEditAlicuotaModal(true);
            setSelectedAlicuota(economicActivity.alicuotaHistory?.find(a => a.id === id));
            
        } else {
            console.log("new alicuota")
            setShowEditAlicuotaModal(true);
            
        }
        
    }

    const deleteAlicuota = async (id: number) => {
        try {
            console.log(`Deleting alicuota ${id}`)

            let deleted = await alicuotaService.delete(id, userAuth.token);
            
            message.success('Alicuota eliminada correctamente');

            loadEconomicActivityData();
        } catch (error) {
            console.log({error})
            message.error((error as Error).message);
        }
    }

    const alicuotaCurrentData = (
        <>
        
            <Form.Item
                label="Alicuota actual"
                
                
            >
                <Input disabled value={`${(economicActivity.currentAlicuota?.taxPercent ?? 0) * 100}%`} />
            </Form.Item>

            <Form.Item
                label="Min. Tributario actual"
                
                
            >
                <Input disabled value={`${economicActivity.currentAlicuota?.minTaxMMV ?? 0} MMV-BCV`} />
            </Form.Item>
        
        </>
    )

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
                    <Flex vertical gap={16}>
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

                            { !isEdit ? firstAlicuotaInputFields : null }

                            { isEdit ? alicuotaCurrentData : null }

                        </Flex>

                        


                        
                        

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                {economicActivityId ? 'Guardar cambios' : 'Registrar'}
                            </Button>
                        </Form.Item>
                    </Flex>
                </Form>
            </Card>

            {
                isEdit && (
                    <>
                        <EconomicActivityAlicuotaHistory 
                            alicuotas={economicActivity.alicuotaHistory}
                            onNewAlicuota={() => openEditAlicuotaModal()}
                            onEditAlicuota={(id) => openEditAlicuotaModal(id)}
                            onDeleteAlicuota={(id) => deleteAlicuota(id)}
                        />

                        <EditAlicuotaModal
                            alicuota={selectedAlicuota}
                            open={showEditAlicuotaModal}
                            onNew={handleNewAlicuota}
                            onEdit={handleEditAlicuota}
                            onCancel={() => handleCancelEditAlicuota()}
                        />
                    </>
                )
            }

        </Flex>
    );
}

interface EditAlicuotaModalProps {
    alicuota?: IAlicuota;
    open: boolean;
    onNew: (values: EditAlicuotaFormValues) => void;
    onEdit: (id: number, values: EditAlicuotaFormValues) => void;
    onCancel: () => void;
}

interface EditAlicuotaFormValues extends IAlicuota {

}

function EditAlicuotaModal({alicuota, open, onNew, onEdit, onCancel}: EditAlicuotaModalProps) {
    const [form] = Form.useForm();

    const isEditing = alicuota !== undefined || alicuota !== null;

    const submit = () => {
        console.log("submiting")
        form.validateFields().then((values) => {

            let taxPercent = percentHandler(values.taxPercent).divide(100).value
            
            let alicuotaData = {
                ...values,
                taxPercent
            }

            if(isEditing && alicuota) {
                onEdit(alicuota.id,alicuotaData);
            } else {
                onNew(alicuotaData);
            }
    
            form.resetFields();
        })
    }


    const loadData = () => {
        if (alicuota?.id) {
            form.setFieldsValue({
                taxPercent: percentHandler(alicuota.taxPercent).multiply(100).value,
                minTaxMMV: alicuota.minTaxMMV,
                createdAt: dayjs(alicuota.createdAt),
            });
            console.log({alicuota})
        }
    }

    const handleCancelEditAlicuota = () => {
        form.resetFields();
        onCancel();
    }

    useEffect(() => {
        loadData();
    }, [alicuota]) 
    
    return (
        <Modal
            open={open}
            title="Editar o crear una alicuota"
            okText="Guardar"
            cancelText="Cancelar"
            onOk={submit}
            onCancel={handleCancelEditAlicuota}
        >
            <Form form={form} layout="vertical">
                <Flex gap={16}>
                    <Form.Item<EditAlicuotaFormValues>
                        label="Alicuota"
                        name="taxPercent"
                        rules={[{ required: true, message: 'Introduzca una alicuota' }]}
                    >
                        <InputNumber 
                            min={0} 
                            step={0.01} 
                            style={{ minWidth: '150px' }}
                            addonAfter="%"
                            decimalSeparator=','       

                        />
                    </Form.Item>
                    <Form.Item<EditAlicuotaFormValues>
                        label="Mínimo Tributario MMV-BCV"
                        name="minTaxMMV"
                        rules={[{ required: true, message: 'Introduzca un monto' }]}
                    >
                        <InputNumber min={0} step={0.01} 
                            style={{ minWidth: '100px' }}
                            addonAfter="MMV-BCV"
                            decimalSeparator=','
                        />
                    </Form.Item>
                </Flex>
                <Form.Item<EditAlicuotaFormValues>
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
            render: (value: number) => formatPercents(percentHandler(value).value),
        },
        {
            title: 'Mínimo Tributario TCMMV-BCV',
            dataIndex: 'minTaxMMV',
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
