import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../util/api';
import * as grossIncomeApi from '../util/grossIncomeApi';
import grossIncomeInvoiceService from '../services/GrossIncomesInvoiceService'
import { Business, EconomicActivity, IGrossIncome, IGrossIncomeInvoice } from '../util/types';
import { formatBolivares, CurrencyHandler, percentHandler } from '../util/currency';
import economicActivitiesService from '../services/EconomicActivitiesService';



import { Flex, Typography, Card, Descriptions, Table, Badge, Button, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';

const { Title, Text } = Typography;


const TaxCollectionBusinessDetails: React.FC = () => {

    const [business, setBusiness] = useState<Business>();
    const { businessId } = useParams<{ businessId: string }>();
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>([]);
    const [grossIncomeInvoices, setGrossIncomeInvoices] = useState<IGrossIncomeInvoice[]>()
    const [economicActivity, setEconomicActivity] = useState<EconomicActivity>()

    const loadGrossIncomeInvoices = async () => {
        const fetchedGrossIncomeInvoices = await grossIncomeInvoiceService.getAll()

        const filtered = fetchedGrossIncomeInvoices.filter(g => g.businessId === Number(businessId))

        console.log({ filtered })
        setGrossIncomeInvoices([...filtered])
    }

    useEffect(() => {
        loadBusiness();
        loadGrossIncomes();
        loadGrossIncomeInvoices()
    }, [businessId]);

    useEffect(() => {
        if (business?.id) {
            loadEconomicActivity()
        }
    }, [business])

    if (!business) {
        return <div>Loading...</div>;
    }

    async function loadEconomicActivity() {
        if (business) {
            const {economicActivityId} = business
            const economicActivity = await economicActivitiesService.findById(economicActivityId)

            console.log({economicActivityId, economicActivity})
        
            setEconomicActivity(economicActivity)
        }
    }

    async function loadBusiness() {
        if (businessId) {
            try {
                const fetchedBusiness = await api.fetchBusinessById(Number(businessId));
                setBusiness(fetchedBusiness);
            } catch (error) {
                console.error('Error loading business:', error);
                // Handle error (e.g., show error message to user)
            }
        }
    };

    async function loadGrossIncomes() {
        try {
            const fetchedGrossIncomes = await grossIncomeApi.getAllGrossIncomesByBusinessId(Number(businessId));
            console.log('fetchedGrossIncomes', fetchedGrossIncomes)
            setGrossIncomes(fetchedGrossIncomes);
        } catch (error) {
            console.error('Error loading gross incomes:', error);
        }
    };

    const handleGrossIncomeDelete = async (grossIncomeId: number) => {
        try {
            await grossIncomeApi.deleteGrossIncome(grossIncomeId);
            message.success('Ingreso bruto eliminado exitosamente');
            // Refresh the gross incomes list
            const updatedGrossIncomes = grossIncomes.filter(income => income.id !== grossIncomeId);
            setGrossIncomes(updatedGrossIncomes);
        } catch (error) {
            message.error('Error al eliminar el ingreso bruto');
        }
    };

    const handleDeleteGrossIncomeInvoice = async (grossIncomeInvoiceId: number) => {
        try {
            await grossIncomeInvoiceService.delete(grossIncomeInvoiceId);
            message.success('Factura de Ingreso Bruto eliminada exitosamente');
            // Refresh the gross income invoices list
            const updatedGrossIncomeInvoices = grossIncomeInvoices?.filter(invoice => invoice.id !== grossIncomeInvoiceId) ?? [];
            setGrossIncomeInvoices(updatedGrossIncomeInvoices);
            loadGrossIncomes()
        } catch (error) {
            message.error('Error al eliminar la factura de Ingreso Bruto');
        }
    };

    return (
        <Flex vertical gap="large">

            <Card title={<Title level={2}>Recaudación de Impuestos</Title>}>

                <Flex vertical gap="large">
                    <Descriptions bordered title="Información de la Empresa">
                        <Descriptions.Item label="Empresa">
                            <Text>{business.businessName}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Rif">
                            <Text>{business.dni}</Text>
                        </Descriptions.Item>
                    </Descriptions>

                    <EconomicActivityDescription economicActivity={economicActivity} />

                    <GrossIncomeInvoiceTable
                        invoices={grossIncomeInvoices}
                        onDelete={handleDeleteGrossIncomeInvoice}
                        disableAdd={grossIncomes.length === 0}
                    />

                    <GrossIncomeTaxesTable
                        grossIncomes={grossIncomes}
                        grossIncomeInvoices={grossIncomeInvoices}
                        onDelete={handleGrossIncomeDelete}
                    />

                    {/* <WasteCollectionTaxesTable /> */}

                </Flex>
            </Card>

        </Flex>
    );
};

export default TaxCollectionBusinessDetails;

function EconomicActivityDescription({ economicActivity }: { economicActivity: EconomicActivity | undefined }): JSX.Element {

    if (!economicActivity) {
        return <p>Actividad Económica no registrada</p>
    }

    let { title, code, alicuota, minimumTax, currentAlicuota } = economicActivity
    const economicActivityDescriptions = [
        {
            key: '1',
            label: 'Código',
            children: code
        },
        {
            key: '2',
            label: 'Ramo',
            children: title
        },
        {
            key: '3',
            label: 'Alicuota',
            children: percentHandler((currentAlicuota?.taxPercent ?? 0))
                .multiply(100).format(),
        },
        {
            key: '4',
            label: 'Mínimo Tributario',
            children: CurrencyHandler((currentAlicuota?.minTaxMMV ?? 0))
                .format() + " TCMMV-BCV"
        },
    ]

    return (
        <Descriptions
            title="Actividad Económica"
            bordered
            items={economicActivityDescriptions}
        />

    )
}

const monthMapper: string[] = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

function GrossIncomeTaxesTable({ grossIncomes, grossIncomeInvoices, onDelete }:
    { grossIncomes: IGrossIncome[] | undefined, grossIncomeInvoices: IGrossIncomeInvoice[] | undefined, onDelete: (grossIncomeId: number) => void }): JSX.Element {

    if (!grossIncomes || !grossIncomeInvoices) {
        return <p>No hay ingresos brutos</p>
    }

    const navigate = useNavigate();

    const handleGrossIncomeDelete = async (grossIncomeId: number) => {
        onDelete(grossIncomeId);
    };

    console.log('grossIncomes', grossIncomes)

    const columns = [
        {
            title: 'Año',
            dataIndex: 'period',
            key: 'year',
            render: (period: any) => {
                return period.year()
            },
        },
        {
            title: 'Mes',
            dataIndex: 'period',
            key: 'month',
            render: (period: any) => monthMapper[period.month()],
        },
        {
            title: 'Ingreso Bruto',
            dataIndex: 'amountBs',
            key: 'amountBs',
            render: (value: number) => formatBolivares(value),
        },
        {
            title: 'Sucursal',
            dataIndex: 'branchOffice',
            key: 'branchOffice',
            // TODO: Create a dedicated page for branch offices
            render: (value: any, record: any) => <Link to={`/business/${record.businessId}`}>{value?.nickname}</Link>,
        },
        {
            title: 'Cobrar Aseo',
            dataIndex: 'wasteCollectionTaxId',
            render: (text: string) => text ? 'SI' : 'NO'
        },
        // {
        //     title: 'Factura',
        //     dataIndex: 'grossIncomeInvoiceId',
        //     render: (value: number) => <Link to={`/gross-income-invoices/${value}`}>Ver</Link>
        // },
        // {
        //     title: 'Monto del Impuesto',
        //     dataIndex: 'taxAmount',
        //     key: 'taxAmount',
        //     render: (value: number) => `$${value.toLocaleString().replace(',' , ".")} Bs.`,
        // },
        {
            title: 'Estado',
            dataIndex: 'grossIncomeInvoiceId',
            key: 'status',
            render: (invoiceId: any, record: any) => {
                const invoice = grossIncomeInvoices?.find(i => i.id === invoiceId)

                

                console.log({invoice, invoiceId, record})

                if (!invoice) {
                    return <Badge status='warning' text='Pendiente' />
                }

                return (

                    <Badge
                        status={invoice?.settlement ? 'success' : 'warning'}
                        // if it don't have a grossIncomeInvoiceId == "Sin Calculo"
                        // if grossIncomeInvoice.isPaid == "Pago"
                        // else "Pendiente"
                        text={invoice?.settlement
                            ? 'Pagado'
                            : "Pendiente"}
                    />
                )
            },
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record: any) => (
                <Flex gap="small">
                    <Button onClick={() => navigate(`/tax-collection/${record.businessId}/gross-incomes/${record.id}/edit`)}>Editar</Button>
                    <Button onClick={() => navigate(`/tax-collection/${record.businessId}/gross-incomes/${record.id}`)}>Detalles</Button>
                    <Popconfirm
                        title="¿Estás seguro de que quieres eliminar este ingreso bruto?"
                        onConfirm={() => handleGrossIncomeDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button danger>Eliminar</Button>
                    </Popconfirm>
                    {/* <Button onClick={() => null}>Ver Factura</Button> */}
                </Flex>
            ),
        }
    ];

    return (
        <Flex vertical>

            <Flex gap="small" align='center' justify='space-between'>
                <Title level={3}>Ingresos Brutos Declarados</Title>
                <Button
                    onClick={() => navigate('gross-incomes/new')}
                    style={{ alignSelf: 'end', marginBottom: '12px' }}>
                    <PlusOutlined />
                    Agregar
                </Button>
            </Flex>

            <Table
                style={{ overflow: 'scroll' }}
                dataSource={grossIncomes}
                columns={columns}
                rowKey="id"
                pagination={false}
            />

        </Flex>
    );
}


const WasteCollectionTaxesTable: React.FC = () => {

    const currencyExchangeRates = {
        dolarBCV: 35.5,
        eurosBCV: 38.2
    };

    const MMVExchangeRate = (): number => {
        if (currencyExchangeRates.dolarBCV > currencyExchangeRates.eurosBCV) {
            return currencyExchangeRates.dolarBCV;
        } else {
            return currencyExchangeRates.eurosBCV;
        }
    };

    const currentMMVExchangeRate = MMVExchangeRate(currencyExchangeRates);

    const wasteCollectionTaxTypesMMVMapper = {
        'I': 5,
        'II': 10,
        'III': 15,
    }
    const dummyData = [
        {
            id: 1,
            year: 2023,
            month: 1,
            amount: 500,
            status: 'Pendiente',
            branchOffice: {
                branchOfficeId: 1,
                nickname: 'Sucursal Principal',
                type: 'I',
            },
            businessId: 1,

        },
        {
            id: 2,
            year: 2023,
            month: 2,
            amount: 500,
            status: 'Pagado',
            branchOffice: {
                branchOfficeId: 1,
                nickname: 'Sucursal Principal',
                type: 'I',
            },
            businessId: 1,
        },
        {
            id: 3,
            year: 2023,
            month: 3,
            amount: 550,
            status: 'Pendiente',
            branchOffice: {
                branchOfficeId: 1,
                nickname: 'Sucursal Secundaria',
                type: 'I',
            },
            businessId: 1,
        },
    ];

    const columns = [
        {
            title: 'Año',
            dataIndex: 'year',
            key: 'year',
        },
        {
            title: 'Mes',
            dataIndex: 'month',
            key: 'month',
            render: (value: number) => monthMapper[value],
        },
        {
            title: 'Tipo',
            dataIndex: 'branchOffice',
            key: 'branchOffice',
            align: 'center',
            render: (value: any, record: any) => record.branchOffice.type,
        },
        {
            title: 'Monto (MMV)',
            dataIndex: 'amount',
            key: 'amount',
            align: 'center',
            render: (value: number, record: any) => `${wasteCollectionTaxTypesMMVMapper[record.branchOffice.type]}`,
        },
        {
            title: 'Monto (Bs.)',
            dataIndex: 'amount',
            key: 'amount',
            align: 'center',
            render: (value: number, record: any) => `${MMVExchangeRate() * wasteCollectionTaxTypesMMVMapper[record.branchOffice.type]}`,
        },
        {
            title: 'Sucursal',
            dataIndex: 'branchOffice',
            key: 'branchOffice',
            render: (value: any, record: any) => <Link to={`/business/${record.businessId}`}>{record.branchOffice.nickname}</Link>,
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Badge
                    status={status === 'Pagado' ? 'success' : 'warning'}
                    text={status}
                />
            ),
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_: any, record: any) => (
                <Flex gap="small">
                    <Button onClick={() => null}>Editar</Button>
                    <Button onClick={() => null}>Detalles</Button>
                    <Button onClick={() => null}>Ver Factura</Button>
                </Flex>
            ),
        }
    ];

    return (
        <Flex vertical gap="middle">
            <Flex gap="small" align='center' justify='space-between'>
                <Title level={3}>Impuestos de Recolección de Desechos</Title>
                <Button style={{ alignSelf: 'end', marginBottom: '12px' }}>
                    <PlusOutlined />
                    Agregar
                </Button>
            </Flex>
            <Table
                style={{ overflow: 'scroll' }}
                dataSource={dummyData}
                columns={columns}
                rowKey="id"
                pagination={false}
            />
        </Flex>
    );
}

function GrossIncomeInvoiceTable({ invoices, disableAdd, onDelete }): JSX.Element {
    const navigate = useNavigate();

    const { businessId } = useParams()

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Fecha de Pago',
            dataIndex: 'paidAt',
            key: 'date',
            render: (paidAt: string) => paidAt
                ? <Typography.Text>{dayjs(paidAt).format('DD/MM/YYYY')}</Typography.Text>
                : <Typography.Text> -- </Typography.Text>
        },
        {
            title: 'Monto Total',
            dataIndex: 'totalBs',
            key: 'grossIncome',
            render: (value: number) => formatBolivares(value),
        },
        {
            title: 'Estado',
            dataIndex: 'paidAt',
            key: 'paidAt',

            render: (paidAt: string, invoice: IGrossIncomeInvoice) => {
                console.log({invoice})
                return (

                
                    <Badge
                        status={invoice?.settlement ? 'success' : 'warning'}
                        text={invoice?.settlement ? 'Pagado' : 'Pendiente'}
                    />
                )
            },
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_: any, record: any) => (
                <Flex gap="small">

                    {/* <Button onClick={() => null}>Descargar PDF</Button> */}
                    <Button onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${record.id}/edit`)}>Editar</Button>
                    <Button onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${record.id}`)}>Detalles</Button>


                    <Popconfirm
                        title="¿Está seguro de eliminar esta factura?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button danger>Eliminar</Button>
                    </Popconfirm>

                </Flex>
            ),
        }
    ];

    return (
        <Flex vertical>
            <Flex gap="small" align='center' justify='space-between'>
                <Title level={3}>Calculos del Impuesto sobre Ingresos Brutos</Title>
                <Button
                    disabled={disableAdd}
                    style={{ alignSelf: 'end', marginBottom: '12px' }}
                    onClick={() => navigate('gross-incomes-invoice/new')}
                >
                    <PlusOutlined />
                    Agregar
                </Button>
            </Flex>
            <Table
                style={{ overflow: 'scroll' }}
                dataSource={invoices}
                columns={columns}
                rowKey="id"
                pagination={false}
            />
        </Flex>
    );
}

