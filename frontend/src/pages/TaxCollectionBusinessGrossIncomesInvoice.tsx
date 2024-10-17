
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { 
    Card, 
    Typography, 
    Table, 
    Descriptions, 
    List, 
    Flex, 
    Button, 
    Popconfirm, 
    message, 
    Modal, 
    Select, 
    Input, 
    Form, 
    InputNumber,
    Divider,
    Alert,
    DatePicker,
    Badge,
    Tooltip
} from 'antd';

const { Title, Text } = Typography;
import { PlusOutlined, PrinterOutlined, FileDoneOutlined, UndoOutlined, DeleteOutlined} from '@ant-design/icons';

import dayjs from 'dayjs'
import dayjs_es from 'dayjs/locale/es';

dayjs.locale(dayjs_es);

import _ from 'lodash';


import { IGrossIncomeInvoice, IGrossIncome, Business, CurrencyExchangeRate, Payment, ISettlement } from '../util/types';
import { EditOutlined } from '@ant-design/icons';


import * as grossIncomeApi from '../util/grossIncomeApi'
import * as paymentsApi from '../util/paymentsApi'
import * as api from '../util/api'
import * as util from '../util'

import GrossIncomesInvoiceService from 'services/GrossIncomesInvoiceService';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';
import settlementService from 'services/SettlementService';

import { CurrencyHandler, formatBolivares, formatPercents, percentHandler } from 'util/currency';
import useAuthentication from 'hooks/useAuthentication';

import { ROLES } from 'util/constants'
import GrossIncomeInvoice from './GrossIncomeInvoiceEdit';
import create from '@ant-design/icons/lib/components/IconFont';


const GrossIncomeInvoiceDetails: React.FC = () => {

    // load business and gross income invoice id 
    const { businessId, grossIncomeInvoiceId } = useParams()
    const navigate = useNavigate()

	const [business, setBusiness] = useState<Business>()
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>()
    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()
    const [payments, setPayments] = useState<Payment[]>()

    const [showSettlementModal, setShowSettlementModal] = useState(false)

    const paymentsAllocated = payments?.filter(p => p.grossIncomeInvoiceId === Number(grossIncomeInvoiceId))

    const createdByUser = grossIncomeInvoice?.createdByUser
    const checkedByUser = grossIncomeInvoice?.checkedByUser
    const settledByUser = grossIncomeInvoice?.settledByUser

    const hasBranchOffice = grossIncomes?.length > 0 && grossIncomes[0]?.branchOfficeId !== undefined
    const branchOffice = hasBranchOffice && grossIncomes[0]?.branchOffice

    const authContext = useAuthentication()
    const token = authContext.userAuth.token || ''
    const user = authContext.userAuth.user

    let totalPaymentsAllocated: number = 0

    paymentsAllocated?.forEach(p => {
        // console.log({totalPaymentsAllocated})
        totalPaymentsAllocated += Number(p.amount)
    })

    // console.log({paymentsAllocated})

    let MMVExchangeRate = grossIncomeInvoice?.TCMMVBCV ?? 1

    const formPriceBs = grossIncomeInvoice?.formPriceBs ?? 0
    let TOTAL = grossIncomeInvoice?.grossIncomes.reduce((total, grossIncome) => CurrencyHandler(total).add(grossIncome.totalTaxInBs).value, 0) ?? 0
    TOTAL = CurrencyHandler(TOTAL).add(grossIncomeInvoice?.formPriceBs).value

    const totalLessPaymentsAllocatedBs = CurrencyHandler(TOTAL).subtract(totalPaymentsAllocated).value
    const totalLessPaymentsAllocatedMMV = CurrencyHandler(totalLessPaymentsAllocatedBs).divide(MMVExchangeRate).value

    const grossIncomeInvoiceIsPaid = grossIncomeInvoice?.settlement !== null; 
    const canBeMarkedAsPaid = grossIncomeInvoice?.canBeSettled
    const isSettled = grossIncomeInvoiceIsPaid


    const loadPayments = async (): Promise<Payment[]> => {
        return paymentsApi.findAll()
    }
    

    const loadLastCurrencyExchangeRate = async (): Promise<CurrencyExchangeRate> => {
        const lastCurrencyExchangeRate = await CurrencyExchangeRatesService.getLastOne()
        // console.log({lastCurrencyExchangeRate})

        return lastCurrencyExchangeRate
    }

    const loadBusiness = async (): Promise<Business> => {
        return api.fetchBusinessById(Number(businessId))
    }

    const loadGrossIncomeInvoice = async (): Promise<IGrossIncomeInvoice> => {
        return GrossIncomesInvoiceService.getById(Number(grossIncomeInvoiceId))
    }

    const loadGrossIncomes = async (grossIncomeInvoiceId: number): Promise<IGrossIncome[]> => {
        const fetchedGIs = await grossIncomeApi.getAllGrossIncomesByInvoiceId(grossIncomeInvoiceId)
        return fetchedGIs
    }

    const loadData = async () => {

        const lastCER = await loadLastCurrencyExchangeRate()

        const fetchedPayments = await loadPayments()

        // load the business
        const fetchedBusiness = await loadBusiness()
        // load the invoice 
        const fetchedInvoice = await loadGrossIncomeInvoice()
        // load gross incomes 
        const fetchedGrossIncomes = await loadGrossIncomes(Number(grossIncomeInvoiceId))

        // console.log(JSON.stringify({fetchedInvoice}, null, 2))

        setPayments(fetchedPayments)
        setLastCurrencyExchangeRate(lastCER)
        setBusiness(fetchedBusiness)
        setGrossIncomeInvoice({...fetchedInvoice})
        setGrossIncomes(fetchedGrossIncomes)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleDeletePayment = (id: number) => {
        loadData()
    }

    const handleAddPayment = (id: number) => {
        loadData()
    }

    const toggleIsSettled = async () => {
        // console.log('mark as settled')

        // try {
        //     let response
        //     if (grossIncomeInvoice?.paidAt) {
        //         response = await settlementService.create({
                    
        //         }, token)
        //     } else {
        //         response = await GrossIncomesInvoiceService.markAsPaid(Number(grossIncomeInvoiceId), token)
        //     }
            
        //     // console.log({response})

        //     loadData()

        //     if (response.paidAt) {
        //         message.success('Factura marcados como pagados')
        //     } else {
        //         message.success('Factura desmarcados como pagados')
        //     }

        // } catch (error) {
        //     message.error('Error al marcar como pagado')
        //     console.log({error})
        // }

        
    }


    const handleNewSettlement = async (data) => {
        let createdSettlement = {
            ...data,
            settledByUserId: user?.id,
            grossIncomeInvoiceId: Number(grossIncomeInvoiceId)
        }

        let resultCreatedSettlement = await settlementService.create(createdSettlement, token)

        setShowSettlementModal(false)
        console.log({createdSettlement})	
        loadData()
    }

    const handleEditSettlement = async (data) => {
        console.log({editSettlement: data})

        setShowSettlementModal(false)
        loadData()
    }

    const handleDeleteSettlement = async (data) => {
        console.log({deleteSettlement: data})

        try {
            let result = await settlementService.delete(data, token)
        } catch (error) {
            console.log({error})
            message.error(error.message)
        }

        setShowSettlementModal(false)
        loadData()
    }

    if (!business) {
        return <Flex align="center" justify="center">Cargando...</Flex>
    }


    let markAsSettledButton = <Button 
        onClick={() => setShowSettlementModal(true)} 
        disabled={ !canBeMarkedAsPaid }
        icon={<FileDoneOutlined />}
        >
            Marcar como liquidado
        </Button>

    if (!canBeMarkedAsPaid) {
        markAsSettledButton = <Tooltip title="La factura sólo puede ser liquidada por un liquidador cuándo haya sido pagada y todos los pagos estén verificados">
            {markAsSettledButton}
        </Tooltip>
    }

    const canEdit = [ROLES.ADMINISTRATOR, ROLES.RECAUDADOR].includes(user?.roleId)

    const unmarkAsSettledButton = <Popconfirm
        title="Desmarcando como liquidado"
        onConfirm={() => handleDeleteSettlement(grossIncomeInvoice?.settlement?.id)}
        description="Esta acción no es reversible, se aliminará la liquidación, permitiendo editar el contenido de la factura."
        okText="Sí"
        cancelText="No"
    >
        <Button icon={<UndoOutlined />}>Desmarcar como liquidado</Button>
    </Popconfirm>
    
    return (
        <Card title={
            <Flex align='center' justify='space-between' wrap>
                <Typography.Title level={4}>Detalles de la Factura</Typography.Title>
                <Flex gap={10} align='center' justify='end' wrap>                    
                    { canEdit 
                        && <Button 
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}/edit`)}
                            disabled={isSettled}
                        >Editar</Button>
                    }
                    
                    {
                        grossIncomeInvoiceIsPaid 
                        ? unmarkAsSettledButton
                        : markAsSettledButton
                    }
                    <Button icon={<PrinterOutlined />} onClick={() => navigate(`/printable/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}`)}>Imprimir Recibo</Button>
                    {
                        isSettled && <Button icon={<PrinterOutlined />} onClick={() => navigate(`/printable/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}/settlement`)}>Imprimir Liquidación</Button>
                    }
                </Flex>
            </Flex>
        }>
                
            {
                grossIncomeInvoiceIsPaid ? (
                    <Alert message={`Esta factura fue liquidada el día ${dayjs(grossIncomeInvoice?.settlement?.settledAt).format('DD/MM/YYYY')}`}	 type="success" showIcon />
                )
                : (
                    <Alert message="Esta factura no ha sido liquidada" type="warning" showIcon />
                )
            }

            <Title level={5} style={{ textAlign: 'center' }}>Descripción del Contribuyente</Title>
            <Descriptions bordered  size='small'>
                <Descriptions.Item label="Contribuyente" style={{ maxWidth: '20%' }} >{grossIncomeInvoice.businessName}</Descriptions.Item>
                <Descriptions.Item label="Rif" style={{ maxWidth: '15%' }}>{grossIncomeInvoice.businessDNI}</Descriptions.Item>
                <Descriptions.Item label="N°" style={{ maxWidth: '12%' }}>{business.economicActivity.code}</Descriptions.Item>

                {
                    branchOffice
                    ? (
                        <>
                            <Descriptions.Item label="Ramo" style={{ maxWidth: '20%' }}>{business.economicActivity.title}</Descriptions.Item>
                            <Descriptions.Item label="Mts2" style={{ maxWidth: '5%' }}>{grossIncomeInvoice.branchOfficeDimensions}</Descriptions.Item>
                            <Descriptions.Item label="Tipo"  style={{ maxWidth: '5%' }}>{grossIncomeInvoice.branchOfficeType}</Descriptions.Item>
                        </>
                    )
                    : (null)
                }
            </Descriptions>


            { /** TABLE OF GROSS INCOMES */}
            <Title level={5} style={{ textAlign: 'center' }}>Estado de Cuenta</Title>

            <Table 
                size='small'
                dataSource={grossIncomes ? grossIncomes : []} 
                pagination={false}

                style={{
                    overflow: 'scroll'
                }}
            >
                <Table.Column 
                    title="Acciones" 
                    dataIndex="actions" 
                    key="actions" 
                    render={(period: Date, record: IGrossIncome) => {
                        return (
                            <Button
                                icon={<EditOutlined />}
                                disabled={!canEdit || isSettled}
                                onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes/${record.id}/edit`)}
                            >Editar</Button>
                        )
                    }}
                />
                <Table.Column 
                    title="Periodo" 
                    dataIndex="period" 
                    key="period" 
                    render={(period: Date) => _.upperFirst(dayjs(period).format('MMM-YY'))}
                />
                <Table.Column 
                    title="Ingreso" 
                    dataIndex="amountBs" 
                    key="amountBs" 
                    render={(amountBs: number) => formatBolivares(amountBs)}
                />
                <Table.Column 
                    title="Alicuota"
                    key="amountBs" 
                    render={(_: any, grossIncome: IGrossIncome) => {
                        console.log({grossIncome})
                        let {alicuotaTaxPercent} = grossIncome
                        return `${formatPercents(alicuotaTaxPercent)}`;
                    }}
                    width="8%"
                    align="center"
                />
                <Table.Column 
                    title="Impuesto" 
                    dataIndex="amountBs" 
                    key="tax" 
                    render={(amountBs: number, record: IGrossIncome) => {
                        const {taxInBs} = record
                        return formatBolivares(taxInBs);
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Min. Trib." 
                    dataIndex={['business', 'economicActivity', 'minTax']} 
                    key="minTax" 
                    render={(minTax: number, grossIncome: IGrossIncome) => {
                        // const cer = record.currencyExchangeRate
                        // const {minTaxMMV} = record.alicuota
                        // const {economicActivity} = business
                        // const MMVExchangeRate = util.getMMVExchangeRate(cer)
                        // const minTaxThreshold = minTaxMMV * MMVExchangeRate;
                        // // console.log({cer, economicActivity, MMVExchangeRate, minTax})
                        // return formatBolivares(minTaxThreshold);
                        
                        let minTaxInBs = grossIncome.minTaxInBs

                        return formatBolivares(minTaxInBs)
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Aseo" 
                    key="aseo"
                    dataIndex='wasteCollectionTax'
                    width="15%"
                    render={(_: any, record: IGrossIncome) => {
                        if (!record.chargeWasteCollection) {
                            return 0
                        }
                        const tax = record.wasteCollectionTaxInBs
                        return formatBolivares(tax)
                    }}
                />
                <Table.Column 
                    title="Subtotal" 
                    key="subtotal" 
                    render={(text: any, record: any) => {
                        const tax = record.totalTaxInBs
                        return formatBolivares(tax);
                    }}
                    width="15%"
                    align="right"
                />
            </Table>

            <Table 
                size='small'
                dataSource={[{ formularyPrice: 1 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Formulary Price" 
                    key="formularyPrice" 
                    render={() => (
                        <>
                            <Text>Formulario</Text>
                            <Text style={{ float: 'right' }}>{formatBolivares(formPriceBs)}</Text>
                        </>
                    )}
                />
            </Table>
            
            <Table 
                size='small'
                dataSource={[{ total: 1 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Total" 
                    key="total" 
                    render={(text: any) => <Text strong>Total en Bs</Text>}
                    align="right"
                />
                <Table.Column 
                    title="Total en Bs" 
                    key="total" 
                    align="right"
                    width="15%"
                    render={(text: any) => <Text strong>{formatBolivares(TOTAL)}</Text>}
                />
            </Table>
            <Table 
                size='small'
                dataSource={[{ allocated: 1 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Allocated" 
                    key="allocated" 
                    render={(text: any) => <Text strong>Menos Total Abonado</Text>}
                    align="right"
                />
                <Table.Column 
                    title="Payment Allocation" 
                    key="allocated" 
                    align="right"
                    width="15%"
                    render={(text: any) => <Text strong>{formatBolivares(totalLessPaymentsAllocatedBs)}</Text>}
                />
            </Table>

            <Table 
                size='small'
                dataSource={[{ total: 40 }]} 
                pagination={false}
                showHeader={false}
            >
                <Table.Column 
                    title="Total" 
                    key="total" 
                    render={(text: any) => <Text strong>Total en MMV</Text>}
                    align="right"
                />
                <Table.Column 
                    title="Total en Bs" 
                    key="total" 
                    align="right"
                    width="15%"
                    render={(text: any) => <Text strong>{CurrencyHandler(totalLessPaymentsAllocatedMMV).format()} MMV</Text>}
                />
            </Table>           

            <Divider />

            <br/>

            <PaymentsAllocatedTable 
                paymentsAllocated={payments.filter(p => p.grossIncomeInvoiceId === Number(grossIncomeInvoiceId))}
                payments={payments}
                onDelete={handleDeletePayment}
                onAdd={handleAddPayment}

                paidAt={grossIncomeInvoice?.paidAt}

                disabled={isSettled}
            />

            <br/>

            <UsersInvolved grossIncomeInvoice={grossIncomeInvoice} />

            <br/>

            

            {
                isSettled && (
                    <Settlement
                        settlement={grossIncomeInvoice?.settlement}
                    />
                )
            }
            
            <SettlementEditModal 
                open={showSettlementModal}
                onCancel={() => setShowSettlementModal(false)}
                onEdit={handleEditSettlement}
                onNew={handleNewSettlement}/>
                
        </Card>
    );
};

function UsersInvolved({grossIncomeInvoice}: {grossIncomeInvoice: IGrossIncomeInvoice}) {

    if (grossIncomeInvoice === undefined) {
        return <></>;
    }

    const { createdByUser, checkedByUser, settledByUser } = grossIncomeInvoice
    

    let items: DescriptionsProps['items'] = [];
    
    items.push({
        key: '1',
        label: 'Creado por',
        children: grossIncomeInvoice?.createdByUserPersonFullName,
    });

    items.push({
        key: '2',
        label: 'Revisado por',
        children: grossIncomeInvoice?.checkedByUserPersonFullName,
    });


    return (
        <Descriptions title="Usuarios involucrados" bordered size="small" items={items} />
    );
}

function Settlement({settlement}: {settlement: ISettlement}) {

    const settledByUser = settlement?.settledByUser

    const items = [
        {
            key: 1,
            label: 'Código',
            children: settlement.code,
        },
        {
            key: 2,
            label: 'Fecha',
            children: dayjs(settlement.settledAt).format('DD/MM/YYYY'),
        },
        {
            key: 3,
            label: 'Liquidado por: ',
            children: settlement?.settledByUserPersonFullName,
        }
    ]

    return (
        <Descriptions title="Liquidación" bordered size="small" items={items}/>
    )
}

export default GrossIncomeInvoiceDetails;

function PaymentsAllocatedTable(
    {paidAt, paymentsAllocated, payments, onDelete, onAdd, disabled} : 
    {paidAt: Date, paymentsAllocated: Payment[], payments: Payment[], onDelete: (id: number) => void, onAdd: (id: number) => void, disabled: boolean}
) {

    // console.log({paymentsAllocated})
    const { grossIncomeInvoiceId } = useParams()
    const navigate = useNavigate()

    const [showPaymentAssociationModal, setShowPaymentAssociationModal] = useState(false)

    const handleDelete = async (id: number) => {
        // console.log({id})
        try {
            const response = await GrossIncomesInvoiceService.removePayment(Number(grossIncomeInvoiceId), id)
            // console.log({response})
        } catch (error) {
            message.error('Error al eliminar el pago')
            console.log({error})
        }

        onDelete(id)
    }

    const handlePaymentAssociation = async (id: number) => {
        // console.log({associatedPaymentId: id})

        try {
            const response = await GrossIncomesInvoiceService.addPayment(Number(grossIncomeInvoiceId), id)
            // console.log({response})
        } catch (error) {
            message.error('Error al asociar el pago')
            console.log({error})
        }
        
        setShowPaymentAssociationModal(false)
        onAdd(id)
    }

    const columns = [
        
        { 
            title: "Referencia", 
            dataIndex: "reference", 
            key: "payment", 
            render: (text: any) => <Text strong>{text}</Text> 
        },
        { 
            title: "Monto", 
            dataIndex: "amount", 
            key: "amount", 
            render: (amount: number) => <Text strong>{formatBolivares(amount)}</Text> 
        },
        {
            title: "Fecha",
            dataIndex: "paymentDate",
            key: "paymentDate",
            render: (date: Date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: "Verificado",
            dataIndex: "isVerified",
            key: "isVerified",
            render: (isVerified: boolean) => (
                <Badge status={isVerified ? 'success' : 'warning'} text={isVerified ? 'Si' : 'No'} />
            ),
        },
        {
            title: "Acciones",
            key: "actions",
            render: (text: any, record: any) => (
                <Flex gap={16}>
                    <Button 
                        disabled={disabled}
                        onClick={() => navigate(`/payments/${record.id}`)}>
                        <EditOutlined/>
                        Editar
                    </Button>
                    <Popconfirm title="¿Estás seguro de que quieres eliminar este pago asociado?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger disabled={disabled}>Remover</Button>
                    </Popconfirm>
                </Flex>
            ),
        },
    ];

    

    return (
        <Flex vertical gap={10}>
            <Flex align="center" justify="space-between">
                <Typography.Title level={5}>Pagos Asociados</Typography.Title>
                <Button 
                    icon={<PlusOutlined />} 
                    onClick={() => setShowPaymentAssociationModal(true)}
                    disabled={disabled}
                >Agregar</Button>
            </Flex>
            
            { paidAt
            ? (<Alert message={`Esta factura fue pagada el día ${dayjs(paidAt).format('DD/MM/YYYY')}`} type="success" showIcon />)
            : (<Alert message="Esta factura no ha sido pagada" type="warning" showIcon />)}
            <Table size='small' dataSource={paymentsAllocated} pagination={false} columns={columns} />

            <PaymentAssociationModal
                open={showPaymentAssociationModal} 
                onCancel={() => setShowPaymentAssociationModal(false)} 
                onOk={handlePaymentAssociation} 
                payments={payments.filter(p => p.grossIncomeInvoiceId === null)} 
            />
        </Flex>
    );
}


function PaymentAssociationModal(
    { open, onCancel, onOk, payments }
    : { open: boolean, onCancel: () => void, onOk: (id: number) => void, payments: Payment[] }
) {
    const [form] = Form.useForm();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const handleOk = () => {
        
        const ref = form.getFieldValue('paymentReference');
        // console.log({ref})
        let paymentId = payments.find(p => p.reference === ref)?.id;

        if (!paymentId) {
            message.error('No se encontró el pago');
            return;
        }

        onOk(paymentId);

        form.resetFields()
    }

    const paymentOptions = payments.map(payment => ({
        key: payment.id,
        value: payment.reference,
        label: payment.reference,
    }));

    const handlePaymentChange = (reference: string) => {
        const payment = payments.find(p => p.reference === reference);
        if (payment) {
            form.setFieldsValue({ amount: payment.amount });
        }
    };

    return (
        <Modal
            title="Asociar Pago"
            open={open}
            onOk={() => handleOk()}
            onCancel={onCancel}
        >
            <Form layout="vertical" form={form}>
                <Flex gap={16} align='center'>
                    <Form.Item label="Pago" 
                        name="paymentReference"
                    >
                        <Select 
                            style={{ minWidth: '150px' }} 
                            showSearch options={paymentOptions} 
                            onChange={(value) => handlePaymentChange(value)}
                        />
                    </Form.Item>
                    <Form.Item label="Monto" name="amount">
                        <InputNumber disabled suffix="Bs." style={{ minWidth: '200px' }} />
                    </Form.Item>
                </Flex>
            </Form>
        </Modal>
    );
}

function SettlementEditModal(
    { 
        settlement,
        onNew, 
        onEdit,
        open,
        onCancel
    }
    : { 
        settlement?: ISettlement,
        onNew: (settlement: ISettlement) => void, 
        onEdit: (settlement: ISettlement) => void,
        open: boolean,
        onCancel: () => void

    }
) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const {userAuth} = useAuthentication()
    console.log({userAuth})
    const userPerson = userAuth?.user?.person
    const fullName = userPerson?.firstName + ' ' + userPerson?.lastName

    const isEditing = !!settlement;

    if (!userPerson) {
        console.error("User don't have a contact data asigned");
        message.error('El usuario no tiene datos de contacto asignados');
        onCancel();
    }

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                setLoading(true);
                try {
                    if (isEditing) {
                        await onEdit({
                            ...settlement,
                            ...values,
                            // i don't know if i should add this here
                            // settledByUserPersonFullName: fullName
                        });
                    } else {
                        await onNew({
                            ...values,
                            settledByUserPersonFullName: fullName
                        });
                    }
                } catch (error) {
                    message.error(error.message);
                    console.log({ error });
                } finally {
                    setLoading(false);
                }
            })
            .catch((error) => {
                console.log({ error });
            });
    }

    return (
        <Modal
            title={isEditing ? 'Editar Liquidación' : 'Nueva Liquidación'}
            open={open}
            onOk={handleOk}
            confirmLoading={loading}
            onCancel={onCancel}
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="Código"
                    name="code"
                    rules={[{ required: true, message: 'Por favor, ingrese el código de conciliación' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Fecha"
                    name="settledAt"
                    rules={[{ required: true, message: 'Por favor, ingrese la fecha' }]}
                >
                    <DatePicker />
                </Form.Item>
            </Form>
        </Modal>
    );
}

