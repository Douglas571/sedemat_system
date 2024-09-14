import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Typography, Table, Descriptions, List, Flex, Button, Popconfirm, message} from 'antd';
const { Title, Text } = Typography;
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import { Business } from 'util/types';
import { IGrossIncomeInvoice, IGrossIncome } from '../util/types';
import * as grossIncomeApi from '../util/grossIncomeApi'
import * as api from '../util/api'
import * as util from '../util'
import * as paymentsApi from '../util/paymentsApi'
import GrossIncomesInvoiceService from 'services/GrossIncomesInvoiceService';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';


const GrossIncomeInvoiceDetails: React.FC = () => {

    // load business and gross income invoice id 
    const { businessId, grossIncomeInvoiceId } = useParams()
    const navigate = useNavigate()

	const [business, setBusiness] = useState<Business>()
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>()
    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()
    const [payments, setPayments] = useState<Payment[]>()
    const paymentsAllocated = payments?.filter(p => p.grossIncomeInvoiceId === Number(grossIncomeInvoiceId))

    const hasBranchOffice = grossIncomes?.length > 0 && grossIncomes[0]?.branchOfficeId !== undefined
    const branchOffice = hasBranchOffice && grossIncomes[0]?.branchOffice

    let totalPaymentsAllocated: number = 0

    paymentsAllocated?.forEach(p => {
        console.log({totalPaymentsAllocated})
        totalPaymentsAllocated += Number(p.amount)
    })

    console.log({paymentsAllocated})

    let MMVExchangeRate = 0 

    if (lastCurrencyExchangeRate) {
        
        MMVExchangeRate = Math.max(
            lastCurrencyExchangeRate.dolarBCVToBs, 
            lastCurrencyExchangeRate.eurosBCVToBs
        );
    }

    console.log(lastCurrencyExchangeRate)

    const loadPayments = async (): Promise<Payment[]> => {
        return paymentsApi.findAll()
    }
    

    const loadLastCurrencyExchangeRate = async (): Promise<CurrencyExchangeRate> => {
        const lastCurrencyExchangeRate = await CurrencyExchangeRatesService.getLastOne()
        console.log({lastCurrencyExchangeRate})

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

        // console.log(JSON.stringify({fetchedBusiness, fetchedGrossIncomes, fetchedInvoice}, null, 2))

        setPayments(fetchedPayments)
        setLastCurrencyExchangeRate(lastCER)
        setBusiness(fetchedBusiness)
        setGrossIncomeInvoice(fetchedInvoice)
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

    if (!business) {
        return <Flex align="center" justify="center">Cargando...</Flex>
    }

    const {formPriceBs} = grossIncomeInvoice
    const TOTAL = util.calculateTotalGrossIncomeInvoice(grossIncomes, business, formPriceBs)

    return (
        <Card title={<Flex align='center' justify='space-between'>
            <Typography.Title level={4}>Detalles del Calculo</Typography.Title>
            <Flex gap={10} align='center' justify='end'>
                <Button onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}/edit`)}>Editar</Button>
                <Button onClick={() => navigate(`/printable/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}`)}>Imprimir</Button>
            </Flex>
        </Flex>}>

            <Title level={5} style={{ textAlign: 'center' }}>Descripción del Contribuyente</Title>
            <Descriptions bordered  size='small'>
                <Descriptions.Item label="Contribuyente" style={{ maxWidth: '20%' }} >{business.businessName}</Descriptions.Item>
                <Descriptions.Item label="Rif" style={{ maxWidth: '15%' }}>{business.dni}</Descriptions.Item>
                <Descriptions.Item label="N°" style={{ maxWidth: '12%' }}>{business.economicActivity.code}</Descriptions.Item>

                {
                    branchOffice
                    ? (
                        <>
                            <Descriptions.Item label="Ramo" style={{ maxWidth: '20%' }}>{business.economicActivity.title}</Descriptions.Item>
                            <Descriptions.Item label="Mts2" style={{ maxWidth: '5%' }}>{branchOffice.dimensions}</Descriptions.Item>
                            <Descriptions.Item label="Tipo"  style={{ maxWidth: '5%' }}>{branchOffice.type}</Descriptions.Item>
                        </>
                    )
                    : (null)
                }
            </Descriptions>

            <Title level={5} style={{ textAlign: 'center' }}>Estado de Cuenta</Title>

            <Table 
                size='small'
                dataSource={grossIncomes ? grossIncomes : []} 
                pagination={false}
            >
                <Table.Column 
                    title="Periodo" 
                    dataIndex="period" 
                    key="period" 
                    render={(period: Date) => dayjs(period).format('MMM-YY')}
                />
                <Table.Column 
                    title="Ingreso" 
                    dataIndex="amountBs" 
                    key="amountBs" 
                    render={(amountBs: number) => `${amountBs} Bs.`}
                />
                <Table.Column 
                    title="Alicuota"
                    key="amountBs" 
                    render={(_: any) => `${business.economicActivity.alicuota * 100}%`}
                    width="8%"
                    align="center"
                />
                <Table.Column 
                    title="Impuesto" 
                    dataIndex="amountBs" 
                    key="tax" 
                    render={(amountBs: number, record: any) => {
                        const tax = amountBs * business.economicActivity.alicuota;
                        return `${tax.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Min. Trib." 
                    dataIndex={['business', 'economicActivity', 'minTax']} 
                    key="minTax" 
                    render={(minTax: number, record: IGrossIncome) => {
                        const cer = record.currencyExchangeRate
                        const {economicActivity} = business
                        const MMVExchangeRate = util.getMMVExchangeRate(cer)
                        const minTaxThreshold = economicActivity.minimumTax * MMVExchangeRate;
                        console.log({cer, economicActivity, MMVExchangeRate, minTax})
                        return `${minTaxThreshold.toFixed(2)} Bs.`;
                    }}
                    width="15%"
                />
                <Table.Column 
                    title="Aseo" 
                    key="aseo"
                    dataIndex='wasteCollectionTax'
                    width="15%"
                    render={(_: any, record: IGrossIncome) => {
                        if (!branchOffice) {
                            return 0
                        }
                        const tax = util.getWasteCollectionTaxInBs(record)
                        return `${tax} Bs.`
                    }}
                />
                <Table.Column 
                    title="Subtotal" 
                    key="subtotal" 
                    render={(text: any, record: any) => {
                        const tax = util.getSubTotalFromGrossIncome(record, business)
                        return `${tax.toFixed(2)} Bs.`;
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
                            <Text style={{ float: 'right' }}>{grossIncomeInvoice.formPriceBs} Bs.</Text>
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
                    render={(text: any) => <Text strong>{TOTAL} Bs.</Text>}
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
                    render={(text: any) => <Text strong>{TOTAL - totalPaymentsAllocated} Bs.</Text>}
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
                    render={(text: any) => <Text strong>{Number((TOTAL - totalPaymentsAllocated) / MMVExchangeRate).toFixed(2)} MMV</Text>}
                />
            </Table>           

            <br/>

            <PaymentsAllocatedTable 
                paymentsAllocated={payments.filter(p => p.grossIncomeInvoiceId === Number(grossIncomeInvoiceId))}
                payments={payments}
                onDelete={handleDeletePayment}
                onAdd={handleAddPayment}
            />
        </Card>
    );
};

export default GrossIncomeInvoiceDetails;

function PaymentsAllocatedTable({paymentsAllocated, payments, onDelete, onAdd}: {paymentsAllocated: Payment[], payments: Payment[], onDelete: (id: number) => void, onAdd: (id: number) => void}) {

    console.log({paymentsAllocated})
    const { grossIncomeInvoiceId } = useParams()

    const [showPaymentAssociationModal, setShowPaymentAssociationModal] = useState(false)

    const handleDelete = async (id: number) => {
        console.log({id})
        try {
            const response = await GrossIncomesInvoiceService.removePayment(Number(grossIncomeInvoiceId), id)
            console.log({response})
        } catch (error) {
            message.error('Error al eliminar el pago')
            console.log({error})
        }

        onDelete(id)
    }

    const handlePaymentAssociation = async (id: number) => {
        console.log({associatedPaymentId: id})

        try {
            const response = await GrossIncomesInvoiceService.addPayment(Number(grossIncomeInvoiceId), id)
            console.log({response})
        } catch (error) {
            message.error('Error al asociar el pago')
            console.log({error})
        }
        
        setShowPaymentAssociationModal(false)
        onAdd(id)
    }

    const columns = [
        { 
            title: "Pago", 
            dataIndex: "reference", 
            key: "payment", 
            render: (text: any) => <Text strong>{text}</Text> 
        },
        { 
            title: "Monto", 
            dataIndex: "amount", 
            key: "amount", 
            render: (text: any) => <Text strong>{text} Bs.</Text> 
        },
        {
            title: "Acciones",
            key: "actions",
            render: (text: any, record: any) => (
                <Popconfirm title="¿Estás seguro de que quieres eliminar este pago asociado?" onConfirm={() => handleDelete(record.id)}>
                    <Button danger>Eliminar</Button>
                </Popconfirm>
            ),
        },
    ];

    

    return (
        <Flex vertical gap={10}>
            <Flex align="center" justify="space-between">
                <Typography.Title level={5}>Pagos Asociados</Typography.Title>
                <Button icon={<PlusOutlined />} onClick={() => setShowPaymentAssociationModal(true)}>Agregar</Button>
            </Flex>
            <Table size='small' dataSource={paymentsAllocated} pagination={false} columns={columns} />

            <PaymentAssociationModal 
                visible={showPaymentAssociationModal} 
                onCancel={() => setShowPaymentAssociationModal(false)} 
                onOk={handlePaymentAssociation} 
                payments={payments.filter(p => p.grossIncomeInvoiceId === null)} 
            />
        </Flex>
    );
}

import { Modal, Select, Input, Form } from 'antd';

const { Option } = Select;

function PaymentAssociationModal({ visible, onCancel, onOk, payments }: { visible: boolean, onCancel: () => void, onOk: (id: number) => void, payments: Payment[] }) {
    const [form] = Form.useForm();
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    const handleOk = () => {
        form.validateFields().then(values => {
            onOk(values.paymentId);
        });
    }

    const paymentOptions = payments.map(payment => ({
        key: payment.id,
        value: payment.id,
        label: payment.reference,
    }));

    return (
        <Modal
            title="Asociar Pago"
            visible={visible}
            onOk={() => handleOk()}
            onCancel={onCancel}
        >
            <Form layout="vertical" form={form}>
                <Form.Item label="Pago" name="paymentId">
                    <Select style={{ width: '100%' }} showSearch options={paymentOptions} />
                </Form.Item>
                <Form.Item label="Monto">
                    <Typography.Text>{form.getFieldValue('paymentId')?.amount} Bs.</Typography.Text>
                </Form.Item>
            </Form>
        </Modal>
    );
}

