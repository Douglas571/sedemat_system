
import React, { Children, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'
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
    Tooltip,
    Switch,
    Tabs,
    Statistic
    
} from 'antd';

const { Title, Text } = Typography;


import dayjs from 'dayjs'
import dayjs_es from 'dayjs/locale/es';

dayjs.locale(dayjs_es);

import _ from 'lodash';

import ROLES from '../util/roles';


import { IBranchOffice, IGrossIncomeInvoice, IGrossIncome, Business, CurrencyExchangeRate, Payment, ISettlement, IUser, IPenaltyType, IPenalty } from '../util/types';

import { PlusOutlined, PrinterOutlined, FileDoneOutlined, UndoOutlined, DeleteOutlined, EditOutlined, CheckCircleFilled, CloseCircleFilled, ToolOutlined, AlertFilled, WalletFilled} from '@ant-design/icons';


import * as grossIncomeApi from '../util/grossIncomeApi'
import * as paymentsApi from '../util/paymentsApi'
import * as api from '../util/api'
import * as util from '../util'

import * as penaltyService from '../services/penaltyService'

import GrossIncomesInvoiceService from 'services/GrossIncomesInvoiceService';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';
import settlementService from 'services/SettlementService';

import { CurrencyHandler, formatBolivares, formatPercents, percentHandler } from 'util/currency';
import useAuthentication from 'hooks/useAuthentication';

import GrossIncomeInvoice from './GrossIncomeInvoiceEdit';

import EditGrossIncomeModal from './components/GrossIncomeEditModal';
import EditFormPriceModal from './components/GrossIncomeInvoiceFormPriceEditModal';

const GrossIncomeInvoiceDetails: React.FC = () => {

    // load business and gross income invoice id 
    const { grossIncomeInvoiceId } = useParams()
    const navigate = useNavigate()

    const [businessId, setBusinessId] = useState<number>()
	const [business, setBusiness] = useState<Business>()
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>()
    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()
    const [payments, setPayments] = useState<Payment[]>()

    const [editingGrossIncome, setEditingGrossIncome] = useState<IGrossIncome | null >(null)

    const [showSettlementModal, setShowSettlementModal] = useState(false)
    const [showEditFormPriceModal, setShowEditFormPriceModal] = useState(false)

    const [showToFixModal, setShowToFixModal] = useState(false)    

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
    let totalBeforePenalties = grossIncomeInvoice
        ?.grossIncomes.reduce(
            (total, grossIncome) => CurrencyHandler(total)
                .add(grossIncome.totalTaxInBs).value, 0) ?? 0

    totalBeforePenalties = CurrencyHandler(totalBeforePenalties).add(grossIncomeInvoice?.formPriceBs).value

    let TOTAL = grossIncomeInvoice
        ?.penalties
            .reduce((total, penalty) => {   
                let penaltyTotalInBs = CurrencyHandler(penalty.amountMMVBCV)
                    .multiply(grossIncomeInvoice.TCMMVBCV).value
                return CurrencyHandler(total)
                    .add(penaltyTotalInBs).value
            }, totalBeforePenalties) ?? 0

    

    const totalLessPaymentsAllocatedBs = CurrencyHandler(TOTAL).subtract(totalPaymentsAllocated).value
    const totalLessPaymentsAllocatedMMV = CurrencyHandler(totalLessPaymentsAllocatedBs).divide(MMVExchangeRate).value

    const grossIncomeInvoiceIsPaid = grossIncomeInvoice?.settlement !== null; 
    const canBeMarkedAsPaid = grossIncomeInvoice?.canBeSettled
    const isSettled = grossIncomeInvoiceIsPaid

    const handleToggleToFix = async () => {
        if (grossIncomeInvoice !== undefined && grossIncomeInvoice.toFix) {
            let result = await GrossIncomesInvoiceService.updateToFixStatus(grossIncomeInvoice.id, token, { toFix: false })

            loadData()

        } else {
            setShowToFixModal(true)
        }
    }

    const handleEditToFix = async (data: { toFixReason: string }) => {
        try {
            console.log(JSON.stringify(data))
            
            if (grossIncomeInvoice) {
                let result = await GrossIncomesInvoiceService.updateToFixStatus(grossIncomeInvoice.id, token, { ...data, toFix: true })

                loadData()
            }
            
        } catch (error: any) {
            // show alerts

        } finally {
            setShowToFixModal(false)
        }
    }

    const loadPayments = async (): Promise<Payment[]> => {
        return paymentsApi.findAll()
    }
    

    const loadLastCurrencyExchangeRate = async (): Promise<CurrencyExchangeRate> => {
        const lastCurrencyExchangeRate = await CurrencyExchangeRatesService.getLastOne()
        // console.log({lastCurrencyExchangeRate})

        return lastCurrencyExchangeRate
    }

    const loadBusiness = async (businessId: number): Promise<Business> => {
        return api.fetchBusinessById(businessId)
    }

    const loadGrossIncomeInvoice = async (): Promise<IGrossIncomeInvoice> => {
        return GrossIncomesInvoiceService.getById(Number(grossIncomeInvoiceId))
    }

    const loadGrossIncomes = async (grossIncomeInvoiceId: number): Promise<IGrossIncome[]> => {
        const fetchedGIs = await grossIncomeApi.getAllGrossIncomesByInvoiceId(grossIncomeInvoiceId)
        return fetchedGIs.sort((a, b) => dayjs(b.period).isBefore(dayjs(a.period)) ? 1 : -1)
    }

    const loadData = async () => {

        const lastCER = await loadLastCurrencyExchangeRate()

        const fetchedPayments = await loadPayments()

        // load the invoice 
        const fetchedInvoice = await loadGrossIncomeInvoice()

        // load the business
        const fetchedBusiness = await loadBusiness(fetchedInvoice.businessId)

        setBusinessId(fetchedInvoice.businessId)
        
        // load gross incomes 
        const fetchedGrossIncomes = await loadGrossIncomes(Number(grossIncomeInvoiceId))

        // console.log(JSON.stringify({fetchedInvoice}, null, 2))
        // console.log({
        //     businessId,

        //     payments: fetchedPayments,
        //     paymentsFiltered: fetchedPayments.filter( p => p.businessId === businessId )})

        // TODO: Implement filter by businessId in payments api 
        setPayments(fetchedPayments.filter( p => p.businessId === Number(businessId) ))
        setLastCurrencyExchangeRate(lastCER)
        setBusiness(fetchedBusiness)
        setGrossIncomeInvoice({...fetchedInvoice})
        setGrossIncomes(fetchedGrossIncomes)
    }

    function handleOpenModalToEditGrossIncome(grossIncomeId: number) {
        
        let editingGrossIncome = grossIncomes?.find(gi => gi.id === grossIncomeId)

        if (editingGrossIncome) {
            setEditingGrossIncome(editingGrossIncome)
        }        
    }

    async function handleEditingGrossIncome(newGrossIncomeData: IGrossIncome) {
        setEditingGrossIncome(null)
        console.log({newGrossIncomeData})

        let updatedGrossIncome = await grossIncomeApi.updateGrossIncome(newGrossIncomeData, token)

        loadData()
    }

    async function handleFormPriceEdit(formPriceBs: number) {
        if (grossIncomeInvoice?.id) {
            let newGrossIncomeInvoice = await GrossIncomesInvoiceService.update(
                {
                    ...grossIncomeInvoice,
                    formPriceBs
                }, 
                token
            )

            loadData()
        }
        setShowEditFormPriceModal(false)
    }

    useEffect(() => {
        loadData()
    }, [businessId])

    const handleDeletePayment = (id: number) => {
        loadData()
    }

    const handleAddPayment = (id: number) => {
        loadData()
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


    // ! TODO: Refactor this whole thing around settling button
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

    const canEdit = [ROLES.COLLECTOR].includes(user?.roleId)

    const cadEditPenalties = [ROLES.COLLECTOR].includes(user?.roleId) && !grossIncomeInvoice?.settlement?.id

    const unmarkAsSettledButton = <Popconfirm
        title="Desmarcando como liquidado"
        onConfirm={() => handleDeleteSettlement(grossIncomeInvoice?.settlement?.id)}
        description="Esta acción no es reversible, se aliminará la liquidación, permitiendo editar el contenido de la factura."
        okText="Sí"
        cancelText="No"
    >
        <Button icon={<UndoOutlined />}>Desmarcar como liquidado</Button>
    </Popconfirm>

    let canSettleInvoice = [ROLES.LIQUIDATOR].includes(user?.roleId)
    
    // ! TODO: Refactor this whole thing around settling button

    const pageTabs = [
        
        {
            key: '1',
            label: <span><WalletFilled style={{fontSize: '1.5rem'}}/> PAGOS</span>,
            children: (<PaymentsAllocatedTable 
                paymentsAllocated={payments.filter(p => p.grossIncomeInvoiceId === Number(grossIncomeInvoiceId))}
                payments={payments}
                onDelete={handleDeletePayment}
                onAdd={handleAddPayment}

                paidAt={grossIncomeInvoice?.paidAt}

                disabled={isSettled}
                onUpdate={() => loadData()}

                totalAllocatedInBs={totalPaymentsAllocated}
                differenceInBs={totalLessPaymentsAllocatedBs}
            />)
        },
        {
            key: '2',
            label: <span><AlertFilled style={{fontSize: '1.5rem'}}/> MULTAS</span>,
            children: (<PenaltiesTable 
                TCMMVBCV={grossIncomeInvoice?.TCMMVBCV || 1}
                grossIncomeInvoiceId={Number(grossIncomeInvoiceId)}
                penalties={grossIncomeInvoice?.penalties}
                onUpdate={() => {
                    loadData()
                }}

                canEdit={cadEditPenalties}
            />)
        }
    ]
    
    return (
        <Card title={
            <Flex align='center' justify='space-between' gap={10} wrap>
                <Typography.Title level={4}>Detalles de la Factura</Typography.Title>
                <Flex gap={10} align='center' justify='end' wrap>        
                    {
                        <Button 
                            icon={<ToolOutlined />}
                            onClick={handleToggleToFix}
                        >
                            { grossIncomeInvoice?.toFix
                                ? 'Marcar como arreglado'
                                : 'Marcar como pendiente'
                            }
                        </Button>
                    }            
                    { canEdit 
                        && <Button 
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}/edit`)}
                            disabled={isSettled}
                        >Editar</Button>
                    }
                    
                    { canSettleInvoice &&
                        (grossIncomeInvoiceIsPaid
                            ? unmarkAsSettledButton
                            : markAsSettledButton
                        )
                    }
                    <Button icon={<PrinterOutlined />} onClick={() => navigate(`/printable/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}`)}>Imprimir Recibo</Button>
                    {
                        isSettled && <Button icon={<PrinterOutlined />} onClick={() => navigate(`/printable/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}/settlement`)}>Imprimir Liquidación</Button>
                    }
                </Flex>
            </Flex>
        }>
            <Flex vertical gap={10}>
                {
                    totalLessPaymentsAllocatedBs < 0
                    && (
                        <Alert message={`El contribuyente ha pagado ${formatBolivares(totalLessPaymentsAllocatedBs * -1)} demás`} type="error" showIcon />
                    )
                }
                {
                    grossIncomeInvoice?.toFix
                    && (
                        <Alert message={`Arreglar: ${grossIncomeInvoice?.toFixReason}`} type="warning" showIcon />
                    )
                }
                {
                    grossIncomeInvoiceIsPaid ? (
                        <Alert message={`Esta factura fue liquidada el día ${dayjs(grossIncomeInvoice?.settlement?.settledAt).format('DD/MM/YYYY')}`}	 type="success" showIcon />
                    )
                    : (
                        <Alert message="Esta factura no ha sido liquidada" type="info" showIcon />
                    )
                }
            </Flex>

            <Title level={5} style={{ textAlign: 'center' }}>Descripción del Contribuyente</Title>
            <Descriptions bordered  size='small'>
                <Descriptions.Item label="Contribuyente" style={{ maxWidth: '20%' }} >{grossIncomeInvoice.businessName}</Descriptions.Item>
                <Descriptions.Item label="Rif" style={{ maxWidth: '15%' }}>{grossIncomeInvoice.businessDNI}</Descriptions.Item>
                <Descriptions.Item label="N°" style={{ maxWidth: '12%' }}>{business.economicActivity.code}</Descriptions.Item>
                <Descriptions.Item label="Ramo" style={{ maxWidth: '20%' }}>{grossIncomeInvoice.economicActivityTitle ?? business.economicActivity.title}</Descriptions.Item>

                {
                    branchOffice
                    ? (
                        <>
                            <Descriptions.Item label="Mts2" style={{ maxWidth: '5%' }}>{grossIncomeInvoice.branchOfficeDimensions}</Descriptions.Item>
                            <Descriptions.Item label="Tipo"  style={{ maxWidth: '5%' }}>{grossIncomeInvoice.branchOfficeType}</Descriptions.Item>

                            <Descriptions.Item label="Sucursal" style={{ maxWidth: '5%' }}>{branchOffice.nickname}</Descriptions.Item>

                            <Descriptions.Item label="Dirección" style={{ maxWidth: '20%' }}>{branchOffice.address}</Descriptions.Item>

                            
                        </>
                    )
                    : (null)
                }
            </Descriptions>

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


            { /** TABLE OF GROSS INCOMES */}
            <div style={{ overflow: 'auto' }}>
                <div style={{ minWidth: 800}}>
                    <Title level={5} style={{ textAlign: 'center' }}>Estado de Cuenta</Title>

                    <Table 
                        size='small'
                        dataSource={grossIncomes ?? []} 
                        pagination={false}
                        rowKey={'id'}
                    >
                        {
                            canEdit && (
                                <Table.Column 
                                    title="Acciones" 
                                    dataIndex="actions" 
                                    key="actions" 
                                    width={10}
                                    render={(_: any, record: IGrossIncome) => {
                                        return (
                                            <Button
                                                icon={<EditOutlined />}
                                                disabled={!canEdit || isSettled}
                                                onClick={() => {
                                                    //navigate(`/tax-collection/${businessId}/gross-incomes/${record.id}/edit`)
                                                    handleOpenModalToEditGrossIncome(record.id)
                                                }}
                                            >Editar</Button>
                                        )
                                    }}
                                />
                            )
                        }
                        
                        <Table.Column 
                            title="Periodo" 
                            dataIndex="period" 
                            key="period" 
                            width={100}
                            render={(period: Date, record: IGrossIncome) => {
                                
                                    let textPeriod = _.upperFirst(dayjs(period).format('MMM-YY'))

                                    return <Link 
                                        to={`/tax-collection/${record.businessId}/gross-incomes/${record.id}`}
                                        
                                    >{textPeriod}</Link>
                                }}
                        />
                        <Table.Column 
                            title="Ingreso" 
                            dataIndex="amountBs" 
                            key="amountBs" 
                            width={100}
                            render={(amountBs: number, record: IGrossIncome) => {
                                if (!record?.supportFiles?.length) {
                                    return '--'
                                }

                                return formatBolivares(amountBs)
                            }}
                        />
                        <Table.Column 
                            title="Alicuota"
                            key="amountBs" 
                            render={(_: any, grossIncome: IGrossIncome) => {
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

                                let minTaxInBs = record.minTaxInBs

                                let itApply = taxInBs >= minTaxInBs

                                return <span style={{ color: itApply ? 'black' : 'red'}}>
                                    {formatBolivares(taxInBs)}
                                </span>
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
                                
                                let taxInBs = grossIncome.taxInBs
                                let minTaxInBs = grossIncome.minTaxInBs

                                let itApply = taxInBs <= minTaxInBs

                                return <span>{ itApply ? formatBolivares(minTaxInBs) : '--' }</span>
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
                                    return '--'
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

                    {/* table for form price */}
                    <Table 
                        size='small'
                        dataSource={[{ formularyPrice: 1 }]} 
                        pagination={false}
                        showHeader={false}

                        rowKey={() => 'formularyPrice'}

                        style={{ width: '100%'}}
                    >

                        {
                            canEdit && (
                                <Table.Column 
                                    title="Acciones" 
                                    dataIndex="actions" 
                                    key="actions" 
                                    width={100}
                                    render={(_: any, record: IGrossIncome) => {
                                        return (
                                            <Button
                                                icon={<EditOutlined />}
                                                disabled={!canEdit || isSettled}
                                                onClick={() => {
                                                    // navigate(`/tax-collection/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}/edit`)
                                                    setShowEditFormPriceModal(true)
                                                }}
                                            >Editar</Button>
                                        )
                                    }}
                                />
                            )
                        }
                       
                        <Table.Column 
                            title="Formulary Price" 
                            key="formularyPrice" 
                            colSpan={6}
                            textAlign="left"
                            render={() => (
                                <>
                                    <Text>Formulario</Text>
                                </>
                            )}
                        />
                        <Table.Column 
                            title="Formulary Price" 
                            key="formularyPrice" 
                            render={() => (
                                <>
                                    <Text style={{ float: 'right' }}>{formatBolivares(formPriceBs)}</Text>
                                </>
                            )}
                        />
                    </Table>

                    {/* table for penalties */}
                    { grossIncomeInvoice?.penalties?.length > 0 && 
                        (<Flex vertical>
                            <Table 
                                size='small'
                                dataSource={grossIncomeInvoice?.penalties ?? []} 
                                pagination={false}
                                showHeader={false}
                                rowKey={() => 'penalties'}
                            >
                                <Table.Column 
                                    title="Formulary Price"
                                    key="formularyPrice" 
                                    render={(_, record: IPenalty) => (
                                        <>
                                            <Text>Multa {record.penaltyType.name} ({CurrencyHandler(record.amountMMVBCV).format()} x {CurrencyHandler(grossIncomeInvoice?.TCMMVBCV ?? 0).format()})</Text>
                                            <Text style={{ float: 'right' }}>{formatBolivares(CurrencyHandler(record.amountMMVBCV).multiply(grossIncomeInvoice?.TCMMVBCV ?? 0).value)}</Text>
                                        </>
                                    )}
                                />
                            </Table>

                            {/* table for total before penalties */}
                            <Table 
                                size='small'
                                dataSource={[{ total: 1 }]} 
                                pagination={false}
                                showHeader={false}
                                rowKey={() => 'subtotal'}
                            >
                                <Table.Column 
                                    title="Total" 
                                    key="total" 
                                    render={(text: any) => <Text strong>Subtotal Bs (sin multas)</Text>}
                                    align="right"
                                />
                                <Table.Column 
                                    title="Total en Bs" 
                                    key="total" 
                                    align="right"
                                    width="15%"
                                    render={(text: any) => <Text strong>{formatBolivares(totalBeforePenalties)}</Text>}
                                />
                            </Table>
                        </Flex>)
                    }

                    
                    
                    {/* table for total */}
                    <Table 
                        size='small'
                        dataSource={[{ total: 1 }]} 
                        pagination={false}
                        showHeader={false}
                        rowKey={() => 'totalMMV'}
                    >
                        <Table.Column 
                            title="Total" 
                            key="total" 
                            render={(text: any) => <Text strong>Total a Pagar en Bs</Text>}
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

                    {/* table for total less payments allocated */}
                    <Table 
                        size='small'
                        dataSource={[{ allocated: 1 }]} 
                        pagination={false}
                        showHeader={false}
                        rowKey={() => 'allocated'}
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

                    {/* table for total less payments allocated in MMV */}
                    <Table 
                        size='small'
                        dataSource={[{ total: 40 }]} 
                        pagination={false}
                        showHeader={false}
                        rowKey={() => 'totalMMV'}
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
                </div>
            </div>

            <br/>

            <Tabs
                defaultActiveKey='1'
                items={pageTabs}
                size='large'
            />

            <SettlementEditModal 
                open={showSettlementModal}
                onCancel={() => setShowSettlementModal(false)}
                onEdit={handleEditSettlement}
                onNew={handleNewSettlement}/>
                
            <ToFixEditModal
                open={showToFixModal}
                onCancel={() => setShowToFixModal(false)}
                onOk={handleEditToFix}

            />

            {   editingGrossIncome !== null && grossIncomeInvoice &&
                <EditGrossIncomeModal
                    open={editingGrossIncome !== null}
                    grossIncome={editingGrossIncome}
                    grossIncomeInvoice={grossIncomeInvoice}
                    onCancel={() => setEditingGrossIncome(null)}
                    onFinish={(grossIncome) => handleEditingGrossIncome(grossIncome)}
                />
            }

            <EditFormPriceModal
                open={showEditFormPriceModal}
                onCancel={() => setShowEditFormPriceModal(false)}
                onFinish={handleFormPriceEdit}
                formPriceBs={formPriceBs}
            />
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

    items.push(...[
        {
            key: '3',
            label: 'Fecha de Creación',
            children: dayjs(grossIncomeInvoice?.createdAt).format('DD [de] MMMM [del] YYYY')
        },
        {
            key: '4',
            label: 'Fecha de Actualización',
            children: dayjs(grossIncomeInvoice?.updatedAt).format('DD [de] MMMM [del] YYYY')
        },
        {
            key: '5',
            label: 'Fecha de Emisión',
            children: dayjs(grossIncomeInvoice?.issuedAt).format('DD [de] MMMM [del] YYYY')
        }
    ])


    return (
        <Descriptions 
            layout='vertical' 
            title="Información de la factura" 
            bordered size="small" 
            items={items} />
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
        <Descriptions 
            layout='vertical'
            title="Liquidación" 
            bordered size="small" items={items}/>
    )
}

export default GrossIncomeInvoiceDetails;

function PenaltiesTable({
    TCMMVBCV,
    penalties = [],
    grossIncomeInvoiceId,
    onUpdate,
    canEdit
}:{
    TCMMVBCV: number,
    penalties: IPenalty[],
    grossIncomeInvoiceId: number,
    onUpdate: () => void,
    canEdit: boolean
}) {

    // TODO: Delete when everything is ready
    // penalties = [
    //     {
    //         id: 1,
    //         penaltyType: {
    //             id: 1,
    //             name: 'Baja',
    //             defaultAmountMMVBCV: 20
    //         },
    //         penaltyTypeId: 0,
    //         amountMMVBCV: 20,
    //         description: 'La contribuyente adeuda 6 meses de impuesto de renta',
    //         createdAt: dayjs().format(),
    //         updatedAt: dayjs().format()
    //     },
    //     {
    //         id: 2,
    //         penaltyType: {
    //             id: 2,
    //             name: 'Media',
    //             defaultAmountMMVBCV: 40
    //         },
    //         penaltyTypeId: 1,
    //         amountMMVBCV: 30,
    //         description: ' dummy penalty 2',
    //         createdAt: dayjs().add(1, 'day').format(),
    //         updatedAt: dayjs().add(1, 'day').format()
    //     },
    //     {
    //         id: 3,
    //         penaltyType: {
    //             id: 3,
    //             name: 'Alta',
    //             defaultAmountMMVBCV: 60
    //         },
    //         penaltyTypeId: 2,
    //         amountMMVBCV: 60,
    //         description: ' dummy penalty 3',
    //         createdAt: dayjs().add(2, 'day').format(),
    //         updatedAt: dayjs().add(2, 'day').format()
    //     },
    // ]


    const [showPenaltyEditModal, setShowPenaltyEditModal] = useState(false)
    let [selectedPenaltyId, setSelectedPenaltyId] = useState<(null | number)>(null)
    let selectedPenalty = penalties.find( penalty => penalty.id === selectedPenaltyId)
    const { userAuth } = useAuthentication()

    const handleToggleShowPenaltyEditModal = () => {
        setShowPenaltyEditModal(!showPenaltyEditModal)
    }

    const columns: ColumnsType<IPenalty> = [
        {
            title: 'Tipo',
            dataIndex: ['penaltyType', 'name'],
            key: 'type',
        },
        {
            title: 'Monto (TCMMVBCV)',
            dataIndex: 'amountMMVBCV',
            key: 'amountMMVBCV',
            render: (text: string, record: IPenalty) => {
                return CurrencyHandler(text).format()
            }
        },
        {
            title: 'Monto (Bs.)',
            dataIndex: 'amountBs',
            key: 'amountBs',
            render: (text: string, record: IPenalty) => CurrencyHandler(record.amountMMVBCV).multiply(TCMMVBCV).format()
        },
        {
            title: 'Fecha',
            dataIndex: 'createdAt',
            key: 'date',
            width: 200,
            render: (text: string) => dayjs(text).format('DD-MM-YYYY')
        },
        {
            title: 'Motivo',
            dataIndex: 'description',
            key: 'description',

            render: (text: string) => {
                return (
                    <Typography.Paragraph ellipsis={true}>
                        {text}
                    </Typography.Paragraph>
                )
            }
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (text, record: IPenalty) => (
                <Flex gap={16}>
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditPenalty(record.id)}
                        disabled={!canEdit}
                    >
                        Editar
                    </Button>
                    <Popconfirm
                        title="¿Estás seguro de eliminar la multa?"
                        onConfirm={() => handleDeletePenalty(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button 
                            icon={<DeleteOutlined />}
                            danger
                            disabled={!canEdit}
                            >
                            Eliminar
                        </Button>
                    </Popconfirm>
                </Flex>
            )
        },
    ];

    function handleEditPenalty(id: number) {
        setSelectedPenaltyId(id)
        handleToggleShowPenaltyEditModal()
    }

    const onCancel = () => {
        // Implement cancellation logic here
        handleToggleShowPenaltyEditModal()
        setSelectedPenaltyId(null)
    };

    const onEdit = async ({id, penalty}: {id: number, penalty: IPenalty}) => {

        try {
            let createdPenalty = await penaltyService.updatePenalty({
                id: id,
                penalty,
                token: userAuth.token ?? ''
            })
            handleToggleShowPenaltyEditModal()
            onUpdate()
        } catch(error) {
            console.log({error})
            message.error(error.message)
        }
    };

    const onNew = async (penalty: IPenalty) => {
        // Implement new penalty creation logic here

        console.log({penalty})

        try {
            let createdPenalty = await penaltyService.createPenalty({
                penalty: {
                    ...penalty,
                    grossIncomeInvoiceId
                },
                token: userAuth.token ?? ''
            })
            handleToggleShowPenaltyEditModal()
            onUpdate()
        } catch(error) {
            console.log({error})
            message.error(error.message)
        }

        
    };

    async function handleDeletePenalty(id: number) {
        try {
            await penaltyService.deletePenalty({
                id,
                token: userAuth.token ?? ''
            })
            onUpdate()
        } catch(error) {
            console.log({error})
            message.error(error.message)
        }
    }

    return (
        <Flex vertical gap='small'>
            <Flex align='center' gap='large'>
                <Typography.Title level={4} style={{margin: 0}}>Multas</Typography.Title>
                <Button 
                    icon={<PlusOutlined />} 
                    onClick={() => handleToggleShowPenaltyEditModal()}
                    disabled={!canEdit}    
                >
                    Agregar
                </Button>
            </Flex>
            <Alert message={`El monto de la multa se calcula en base a la TCMMV-BCV (${formatBolivares(TCMMVBCV)}) grabada en la factura.`} type="info" showIcon/>
            <Table 
                dataSource={penalties} 
                columns={columns} 
                pagination={false}
                style={{}}
                rowKey={(record) => record.id}

                style={{overflow: 'auto'}}
            />

            {/* add a component called PenaltyEditModal */}
            <PenaltyEditModal
                open={showPenaltyEditModal}
                
                onCancel={onCancel}
                onEdit={onEdit}
                onNew={onNew}

                penalty={selectedPenalty}
            />
        </Flex>
    )
}

function PenaltyEditModal({
    open,
    penalty,
    onCancel,
    onEdit,
    onNew
}: {
    open: boolean,
    penalty?: IPenalty
    onCancel: () => void,
    onEdit: ({id, penalty}: {id: number, penalty: IPenalty}) => Promise<void>,
    onNew: (penalty: IPenalty) => Promise<void>
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [penaltyTypes, setPenaltyTypes] = useState<IPenaltyType[]>([]);

    const {userAuth} = useAuthentication()
    
    const userPerson = userAuth?.user?.person
    const fullName = userPerson?.firstName + ' ' + userPerson?.lastName

    const isEditing = !!penalty;

    
    let typeOfPenaltyOptions: {label: string, value: number}[] = []

    typeOfPenaltyOptions = penaltyTypes?.map((penaltyType) => ({
        label: penaltyType.name,
        value: penaltyType.id,
    })) ?? []

    const selectedPenaltyTypeId = Form.useWatch('penaltyTypeId', form)

    if (!userAuth) {
        console.error("User don't have a contact data asigned");
        message.error('El usuario no tiene datos de contacto asignados');
        onCancel();
    }

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
                            id: penalty.id,
                            penalty: {
                                ...penalty,
                                ...values,
                            }
                        });
                    } else {
                        await onNew({
                            ...values,
                            createdByUserId: userAuth?.user.id
                        });
                    }

                    resetForm()
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

    async function loadPenaltyTypes() {
        let fetchedPenaltyTypes = await penaltyService.getAllPenaltyTypes()
        setPenaltyTypes(fetchedPenaltyTypes)
    }

    function resetForm() {
        form.setFieldsValue({
            penaltyTypeId: penaltyTypes[0]?.id,
            createdAt: dayjs(),
            description: ''
        })
    }

    useEffect(() => {
        loadPenaltyTypes()
    }, [])

    useEffect(() => {
        if (!isEditing) {
            resetForm()
        }
    }, [penaltyTypes])

    useEffect(() => {
        if (penalty) {
            form.setFieldsValue({
                ...penalty,
                createdAt: dayjs(penalty.createdAt),
            })
        }
    }, [penalty])

    useEffect(() => {
        form.setFieldsValue({
            amountMMVBCV: penaltyTypes.find((penaltyType) => penaltyType.id === selectedPenaltyTypeId)?.defaultAmountMMVBCV,
        })
    }, [selectedPenaltyTypeId])

    return (
        <Modal
            title={isEditing ? 'Editar Liquidación' : 'Nueva Liquidación'}
            open={open}
            onOk={handleOk}
            confirmLoading={loading}
            onCancel={() => {
                resetForm()
                onCancel()
            }}
        >
            <Form layout="vertical" form={form}>
                <Flex gap={16}>
                    <Form.Item
                        style={{ flex: 1 }}
                        label="Tipo"
                        name="penaltyTypeId"
                        rules={[{ required: true, message: 'Por favor, seleccione el tipo de multa' }]}
                    >
                        <Select options={typeOfPenaltyOptions}/>
                    </Form.Item>
                    <Form.Item
                        style={{ flex: 1 }}
                        label="Monto"
                        name="amountMMVBCV"
                        rules={[{ required: true, message: 'Por favor, ingrese el monto de la multa en TCMMVBCV' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            addonAfter='TCMMV-BCV'
                            min={0}
                            step={0.01}
                            decimalSeparator=','
                        />
                    </Form.Item>
                </Flex>
                <Form.Item
                    label="Motivo"
                    name="description"
                    rules={[{ required: true, message: 'Por favor, ingrese el motivo de la multa' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Fecha"
                    name="createdAt"
                    rules={[{ required: true, message: 'Por favor, ingrese la fecha' }]}
                >
                    <DatePicker />
                </Form.Item>
            </Form>
        </Modal>
    );
}

function PaymentsAllocatedTable(
    {
        paidAt, 
        paymentsAllocated, 
        payments, 
        onDelete, 
        onAdd, 
        disabled, 
        onUpdate,

        totalAllocatedInBs,
        differenceInBs,
    } : 
    {
        paidAt: Date, 
        paymentsAllocated: Payment[], 
        payments: Payment[], 
        onDelete: (id: number) => void, onAdd: (id: number) => void, disabled: boolean,
        onUpdate: () => void,

        totalAllocatedInBs: number,
        differenceInBs: number,
    }
) {

    // console.log({paymentsAllocated})
    const { grossIncomeInvoiceId } = useParams()
    const navigate = useNavigate()
    const {userAuth} = useAuthentication()

    const [showPaymentAssociationModal, setShowPaymentAssociationModal] = useState(false)

    const totalAllocated = formatBolivares(paymentsAllocated.reduce((acc, curr) => acc + curr.amount, 0))

    const handleDelete = async (id: number) => {
        // console.log({id})
        try {
            const response = await GrossIncomesInvoiceService.removePayment(Number(grossIncomeInvoiceId), id, userAuth.token ?? null)
            // console.log({response})
        } catch (error) {
            message.error(error.message)
            console.log({error})
        }

        onDelete(id)
    }

    const handlePaymentAssociation = async (id: number) => {
        // console.log({associatedPaymentId: id})

        try {
            const response = await GrossIncomesInvoiceService.addPayment(Number(grossIncomeInvoiceId), id, userAuth.token ?? null)
            // console.log({response})
        } catch (error) {
            message.error('Error al asociar el pago')
            console.log({error})
        }
        
        setShowPaymentAssociationModal(false)
        onAdd(id)
    }

    async function updateVerifiedStatus(id: string, isVerified: boolean) {
        try {            
            // TODO: Implement a controle to set this information manually

            let checkedAt: dayjs.Dayjs | null = dayjs().utc()
            let receivedAt: dayjs.Dayjs | null = dayjs().utc()

            if (isVerified) {
                checkedAt = null
                receivedAt = null
            }

            console.log({ isVerified, checkedAt, receivedAt })
            
            // let paymentUpdated = await paymentService.updatePayment({id: Number(id), checkedAt, receivedAt}, userAuth.token)

            let paymentUpdatedStatus = await paymentsApi.updateVerifiedStatus(Number(id), {checkedAt, receivedAt}, userAuth.token)

            onUpdate()
        } catch (error) {
            console.log({ error })
            message.error(error.message)
        }
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
            width: 200,
            render: (text: any, record: any) => (
                <Flex gap={16} align="center">
                    
                    { [ROLES.LIQUIDATOR, ROLES.COORDINATOR].includes(userAuth?.user?.roleId) && (<Button
                        onClick={() => updateVerifiedStatus(record.id, record.isVerified)}
                        shape="circle"
                    >{record.isVerified ? <CloseCircleFilled /> : <CheckCircleFilled />}</Button>) }

                    <Button 
                        disabled={disabled}
                        onClick={() => navigate(`/payments/${record.id}`)}>
                        <EditOutlined/>
                        Editar
                    </Button>
                    <Popconfirm title="¿Estás seguro de que quieres eliminar este pago asociado?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger disabled={disabled}>Remover</Button>
                    </Popconfirm>
                    <a href={util.completeUrl('/' + record?.image) ?? ''} target="_blank" rel="noopener noreferrer">Voucher</a>
                </Flex>
            ),
        },
    ];

    

    return (
        <Flex vertical gap={10}>
            <Flex align="center" gap='large'>
                <Typography.Title level={4} style={{margin: 0}}>Pagos Asociados</Typography.Title>
                <Button 
                    icon={<PlusOutlined />} 
                    onClick={() => setShowPaymentAssociationModal(true)}
                    disabled={disabled}
                >Agregar</Button>
            </Flex>
            
            { paidAt
            ? (<Alert message={`Esta factura fue pagada el día ${dayjs(paidAt).format('DD/MM/YYYY')}`} type="success" showIcon />)
            : (<Alert message="Esta factura no ha sido pagada" type="warning" showIcon />)}

            <Flex gap='middle'>
                <Card 
                    key={0} 
                    // bordered={false} 
                    style={{
                        minWidth: '150px',
                        minHeight: '150px',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        maxWidth: '200px',
                    }}
                    >
                    <Statistic
                        style={{fontSize: '2px',}}
                        title={'Total Abonado'}
                        value={formatBolivares(totalAllocatedInBs)}
                        precision={0}
                    />
                </Card>

                <Card 
                    key={0} 
                    // bordered={false} 
                    style={{
                        minWidth: '150px',
                        minHeight: '150px',
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',

                        maxWidth: '200px',
                    }}
                    >
                    <Statistic
                        title={'Diferencia'}
                        value={formatBolivares(differenceInBs)}
                        valueStyle={{ color: differenceInBs < 0 ? 'red' : 'inherit'}}
                        precision={0}
                    />
                </Card>
            </Flex>

            <Table 
                size='small' 
                dataSource={paymentsAllocated} 
                pagination={false} 
                columns={columns} 
                style={{ overflow: 'auto'}}
                rowKey={(record) => record.id}
            />

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
    const userPerson = userAuth?.user?.person
    const fullName = userPerson?.firstName + ' ' + userPerson?.lastName

    const isEditing = !!settlement;

    useEffect(() => {
        if (isEditing) {
            form.setFieldsValue(settlement);
        } else {
            form.setFieldsValue({
                settledByUserPersonFullName: fullName
            })
        }
    }, [settlement, form, isEditing]);

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
                            // settledByUserPersonFullName: fullName
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
                <Form.Item label="Liquidado Por" name="settledByUserPersonFullName">
                    <Input/>
                </Form.Item>
            </Form>
        </Modal>
    );
}

function ToFixEditModal({ 
    open, 
    onOk, 
    onCancel
}: { 
    open: boolean, 
    onOk: (toFixData: { toFixReason: string }) => void, 
    onCancel: () => void }
) {

    const [form] = Form.useForm();

    const handleOk  = () => {
        form.validateFields().then(values => {
            onOk(values)
            form.setFieldsValue({ toFixReason: '' })
        })

        
    }

    return <Modal
        title='Razón para marcar como pendiente por arreglar'
        open={open}
        onCancel={onCancel}
        onOk={() => {
            handleOk()
        }}
    >
        <Form form={form}>
            <Form.Item 
                // label="Razón" 
                name='toFixReason'
            >
                <Input/>
            </Form.Item>
        </Form>
    </Modal>
}