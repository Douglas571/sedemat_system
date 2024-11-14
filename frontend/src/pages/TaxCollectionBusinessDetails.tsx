import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import * as api from '../util/api';
import * as grossIncomeApi from '../util/grossIncomeApi';
import grossIncomeInvoiceService from '../services/GrossIncomesInvoiceService'
import { Business, EconomicActivity, IGrossIncome, IGrossIncomeInvoice } from '../util/types';
import { formatBolivares, CurrencyHandler, percentHandler } from '../util/currency';
import economicActivitiesService from '../services/EconomicActivitiesService';

import * as util from '../util';
import useAuthentication from '../hooks/useAuthentication';



import { Flex, Typography, Card, Descriptions, Table, Badge, Button, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import dayjs from 'dayjs';

const { Title, Text } = Typography;


const TaxCollectionBusinessDetails: React.FC = () => {
    const { userAuth } = useAuthentication();

    const [business, setBusiness] = useState<Business>();
    const { businessId } = useParams<{ businessId: string }>();
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>([]);
    const [grossIncomeInvoices, setGrossIncomeInvoices] = useState<IGrossIncomeInvoice[]>()
    const [economicActivity, setEconomicActivity] = useState<EconomicActivity>()

    const loadGrossIncomeInvoices = async () => {
        const fetchedGrossIncomeInvoices = await grossIncomeInvoiceService.getAll()

        const filtered = fetchedGrossIncomeInvoices.filter(g => g.businessId === Number(businessId))

        // console.log({ filtered })
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

            // console.log({economicActivityId, economicActivity})
        
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
            // console.log('fetchedGrossIncomes', fetchedGrossIncomes)
            setGrossIncomes(fetchedGrossIncomes);
        } catch (error) {
            console.error('Error loading gross incomes:', error);
        }
    };

    const handleGrossIncomeDelete = async (grossIncomeId: number) => {
        try {
            await grossIncomeApi.deleteGrossIncome(grossIncomeId, userAuth.token ?? null);
            message.success('Ingreso bruto eliminado exitosamente');
            // Refresh the gross incomes list
            const updatedGrossIncomes = grossIncomes.filter(income => income.id !== grossIncomeId);
            setGrossIncomes(updatedGrossIncomes);
        } catch (error) {
            console.log({error})
            message.error(error.message);
        }
    };

    const handleDeleteGrossIncomeInvoice = async (grossIncomeInvoiceId: number) => {
        try {
            await grossIncomeInvoiceService.delete(grossIncomeInvoiceId, userAuth.token ?? null);
            message.success('Factura de Ingreso Bruto eliminada exitosamente');

            // Refresh the gross income invoices list
            const updatedGrossIncomeInvoices = grossIncomeInvoices?.filter(invoice => invoice.id !== grossIncomeInvoiceId) ?? [];
            setGrossIncomeInvoices(updatedGrossIncomeInvoices);

            loadGrossIncomes()
        } catch (error) {
            message.error(error.message);
        }
    };

    return (
        <Flex vertical gap="large">

            <Card title={<Title style={{ whiteSpace: 'normal' }} level={2}>Recaudación de Impuestos</Title>}>

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

    let grossIncomesWithStatus: IGrossIncomeWithStatus[] = grossIncomes.map((grossIncome: IGrossIncome) => {

        let invoice = grossIncomeInvoices.find(i => i.id === grossIncome.grossIncomeInvoiceId)

        let {status, badgeStatus} = util.getGrossIncomeState({
            grossIncome,
            invoice,
            payments: invoice?.payments
        })

        return {
            ...grossIncome,
            status,
            badgeStatus
        }
    })


    // ! TODO: Delete this code, and implement this in the backend as a report business, this is a prove of concept for now
    let grossIncomesByBranchOffice = grossIncomesWithStatus.reduce((acc, grossIncome) => {

        acc.set(grossIncome.branchOfficeId, [...(acc.get(grossIncome.branchOfficeId) ?? []), grossIncome])

        return acc

    }, new Map<string, IGrossIncomeWithStatus[]>())

    for (const [key, value] of grossIncomesByBranchOffice) {
        let { branchOffice } = value[0]
        let periods = value.sort((a, b) => a.period.isBefore(b.period) ? 1 : -1).map( grossIncome => dayjs(grossIncome.period))

        let periodsStrings = periods.map(period => period.format('YYYY-MM'))

        let firstPeriod = periods.pop()
        let currentPeriod = firstPeriod

        while(currentPeriod.isBefore(dayjs(), 'month')) {
            !periodsStrings.includes(currentPeriod.format('YYYY-MM')) && grossIncomesWithStatus.push({
                id: Math.random().toString(16).slice(2),
                period: currentPeriod,
                amountBs: null,
                branchOfficeId: branchOffice.id,
                branchOffice: branchOffice,
                chargeWasteCollection: branchOffice.chargeWasteCollection,
                badgeStatus: 'default',
                status: 'Sin Declaración',
            })
            
            currentPeriod = currentPeriod.add(1, 'month')
        }
    }

    

    const navigate = useNavigate();

    const handleGrossIncomeDelete = async (grossIncomeId: number) => {
        onDelete(grossIncomeId);
    };

    // console.log('grossIncomes', grossIncomes)

    const columns = [
        {
            title: 'Periodo',
            dataIndex: 'period',
            key: 'year',
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            render: (period: any) => {
                return period.year() + ' - ' + monthMapper[period.month()];
            },
            sorter: (a: IGrossIncome, b: IGrossIncome) => dayjs(a.period).isBefore(dayjs(b.period)) ? 1 : -1,
            defaultSortOrder: 'descend'
        },
        {
            title: 'Ingreso Bruto',
            dataIndex: 'amountBs',
            key: 'amountBs',
            render: (value: number) => formatBolivares(value),

            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: IGrossIncomeWithStatus, b: IGrossIncomeWithStatus) => a.amountBs - b.amountBs,
        },
        {
            title: 'Sede',
            dataIndex: 'branchOffice',
            key: 'branchOffice',
            // TODO: Create a dedicated page for branch offices
            render: (value: any, record: any) => <Link to={`/business/${record.businessId}`}>{value?.nickname}</Link>,

            filters: [... new Set(grossIncomesWithStatus.map((grossIncome: IGrossIncomeWithStatus) => grossIncome.branchOffice.nickname))].map((branchOffice: string) => ({text: branchOffice, value: branchOffice})),

            onFilter(value: string, record: IGrossIncomeWithStatus) {
                return record.branchOffice.nickname === value
            },

            
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: IGrossIncomeWithStatus, b: IGrossIncomeWithStatus) => a.branchOffice.nickname.localeCompare(b.branchOffice.nickname),
        },
        {
            title: 'Cobrar Aseo',
            dataIndex: 'chargeWasteCollection',
            render: (text: string) => text ? 'SI' : 'NO',

            filters: [{text: 'SI', value: 'true'}, {text: 'NO', value: 'false'}],

            onFilter: (value: string, record: IGrossIncomeWithStatus) => String(record.chargeWasteCollection) === value,
            
            showSorterTooltip: false,
            sortDirections: ['ascend', 'descend', 'ascend'],
            sorter: (a: IGrossIncomeWithStatus, b: IGrossIncomeWithStatus) => a.chargeWasteCollection ? 1 : -1,
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
            render: (invoiceId: any, record: IGrossIncome) => {

                return (

                    <Badge
                        status={record.badgeStatus}
                        text={record.status}
                    />
                )
            },

            filters: [... new Set(grossIncomesWithStatus.map((grossIncome: IGrossIncomeWithStatus) => grossIncome.status))].map(status => ({text: status, value: status})),

            onFilter: (value: string, record: IGrossIncomeWithStatus) => {
                return record.status === value
            },

            showSorterTooltip: false,
            sorter: (a: IGrossIncomeWithStatus, b: IGrossIncomeWithStatus) => a.status.localeCompare(b.status),
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record: any) => {
                let invoice = grossIncomeInvoices?.find(i => i.id === record.grossIncomeInvoiceId)

                return (
                <Flex gap="small">

                    { record.amountBs === null
                        ? (
                            <>
                                <Button onClick={() => navigate(`gross-incomes/new?branchOfficeId=${record.branchOfficeId}&period=${record.period.format('YYYY-MM')}`)}>
                                    Registrar
                                </Button>
                            </>
                        )
                        : (
                            <>
                                <Button 
                                    onClick={() => navigate(`/tax-collection/${record.businessId}/gross-incomes/${record.id}/edit`)}
                                    disabled={invoice?.settlement}    
                                >Editar</Button>
                                
                                <Popconfirm
                                    title="¿Estás seguro de que quieres eliminar este ingreso bruto?"
                                    onConfirm={() => handleGrossIncomeDelete(record.id)}
                                    okText="Sí"
                                    cancelText="No"
                                >
                                    <Button 
                                        danger
                                        disabled={invoice?.settlement}
                                    >Eliminar</Button>
                                </Popconfirm>
            
                                <Button 
                                    onClick={() => navigate(`/tax-collection/${record.businessId}/gross-incomes/${record.id}`)}
                                    
                                >Detalles</Button>
                            </>
                        )   
                    }
                    
                    {/* <Button onClick={() => null}>Ver Factura</Button> */}
                </Flex>
            )},
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
                dataSource={grossIncomesWithStatus}
                columns={columns}
                rowKey={(record) => record.id}
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
            title: 'Fecha de Pago',
            dataIndex: 'paidAt',
            key: 'date',
            render: (paidAt: string) => paidAt
                ? <Typography.Text>{dayjs(paidAt).format('DD/MM/YYYY')}</Typography.Text>
                : <Typography.Text> -- </Typography.Text>
        },
        {
            title: 'Fecha de Liquidación',
            dataIndex: ['settlement', 'settledAt'],
            key: 'settledAt',
            render: (value: string) => value ? dayjs(value).format('DD/MM/YYYY'): '--',
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
                // console.log({invoice})

                const { state, badgeStatus } = util.getGrossIncomeInvoiceState({ invoice })
                
                return (
                    <Badge
                        status={badgeStatus}
                        text={state}
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
                    <Button 
                        onClick={() => 
                            navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${record.id}/edit`)}
                        disabled={record.settlement}
                    >Editar</Button>

                    <Popconfirm
                        title="¿Está seguro de eliminar esta factura?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button danger
                        disabled={record.settlement}
                        >Eliminar</Button>
                    </Popconfirm>

                    <Button onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${record.id}`)}>Detalles</Button>

                </Flex>
            ),
        }
    ];

    return (
        <Flex vertical>
            <Flex gap="small" align='center' justify='space-between'>
                <Title level={3}>Facturas del Impuesto sobre Ingresos Brutos</Title>
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

