import { Typography, Table, Card, Button, Space, Popconfirm } from "antd"
import { EditOutlined, EyeOutlined } from "@ant-design/icons"
import React, { useEffect } from "react"

import { Link } from "react-router-dom"

import dayjs from "dayjs"
import _ from "lodash"


import * as paymentService from "../util/paymentsApi"
import * as grossIncomeService from "../util/grossIncomeApi"
import grossIncomeInvoiceService from "../services/GrossIncomesInvoiceService"
import useAuthentication from "../hooks/useAuthentication"

import ROLES from "../util/roles"


import { formatBolivares } from "util/currency"
import { completeUrl } from "util"
import { IGrossIncome, INewGrossIncome, Payment } from "../util/types"

const UserHome: React.FC = () => {

    let { userAuth } = useAuthentication()
    let { user } = userAuth

    console.log({userAuth})

	return (
		<div>
            {/* <Typography.Title>Bienvenido {user?.person?.id 
                ? `${user?.person?.firstName} ${user?.person?.lastName}` 
                : user?.username || "Usuario"}</Typography.Title> */}

            <PendingWorkSection />

		</div>
	)
}

export default UserHome

const PendingWorkSection = () => {

    let { userAuth } = useAuthentication()

    return <Card>
        <Typography.Title level={2}>Tareas pendientes</Typography.Title>
        

        {
            [ROLES.COLLECTOR, ROLES.FISCAL].includes(userAuth.user.roleId) && (
                <>
                    <PendingPaymentsTable />
                </>
            )          
            
        }
        
        {
            [ROLES.COLLECTOR].includes(userAuth.user.roleId) && (
                <>
                <PendingGrossIncomesToBeAssociated/> 
                </>
            )          
        }

        {
            [ROLES.COLLECTOR, ROLES.FISCAL].includes(userAuth.user.roleId) && (
                <>
                    <PendingInvoiceToFix/>
                </>
            )          
        }
    </Card>
}

const PendingGrossIncomesToBeAssociated = () => {

    // TODO: In progress
    let [grossIncomes, setGrossIncomes] = React.useState<IGrossIncome[]>([])
    let { userAuth } = useAuthentication()
    
    const loadGrossIncomesToBeAssociated = async () => {
        let fetchedGrossIncomes = await grossIncomeService.getGrossIncomesWithoutInvoice(userAuth.token || "")
        setGrossIncomes([...fetchedGrossIncomes])
    }

    useEffect(() => {
        loadGrossIncomesToBeAssociated()
    }, [])
    
    const grossIncomesColumns: ColumnProps<IGrossIncome>[] = [
        {
            title: 'Periodo',
            dataIndex: 'period',
            render: (date: Date) => <Typography.Text>{_.startCase(dayjs(date).format('MMM-YYYY'))}</Typography.Text>
        },
        {
            title: 'Contribuyente',
            dataIndex: ['business', 'businessName'],
            render: (businessName: string, grossIncome: IGrossIncome) => <Link to={`/tax-collection/${grossIncome.business.id}`}>{businessName}</Link>
        },
        {
            title: 'Sede',
            dataIndex: ['branchOffice', 'nickname'],
            render: (nickname: string, grossIncome: IGrossIncome) => {
                if (nickname) {
                    return <Link to={`/tax-collection/${grossIncome.business.id}`}>{nickname}</Link>
                } else {
                    return '--'
                }
            }
        },
        {
            title: 'RIF',
            dataIndex: ['business', 'dni'],
            render: (dni: number, grossIncome: IGrossIncome) => (
                <Link to={`/tax-collection/${grossIncome.business.id}`}>{dni}</Link>
            )
        }
        
    ]
    
    return (
        <>
            <Typography.Title level={4}>Declaraciones pendientes por asociar a una factura</Typography.Title>
            <Table
                rowKey='id'
                dataSource={grossIncomes}
                columns={grossIncomesColumns}
                virtual
                // pagination={false}
            />
        </>
    )
}

const PendingPaymentsTable = () => {

    const [payments, setPayments] = React.useState<Payment[]>([])
    const { userAuth } = useAuthentication()
    

    const loadNotAssociatedPayments = async () => {
        let fetchedPayments = await paymentService.getNotAssociatedPayments(userAuth.token || "")
        setPayments([...fetchedPayments])
    }

    useEffect( () => {
        loadNotAssociatedPayments()
    }, [])

    const paymentColumns: ColumnProps<Payment>[] = [
        {
            title: 'Fecha de Pago',
            dataIndex: 'paymentDate',
            render: (date: Date) => <Typography.Text>{dayjs(date).format('DD/MM/YYYY')}</Typography.Text>
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            render: (amount: number) => <Typography.Text>{formatBolivares(amount)}</Typography.Text>
        },
        {
            title: 'Referencia',
            dataIndex: 'reference',
            render: (reference: string) => <Typography.Text>{reference}</Typography.Text>
        },
        {
            title: 'Comercio o Persona',
            dataIndex: 'business',
            render: (business: Business, payment: Payment) => {
                // if business, return business link to tax collection 
                if (payment.businessId) {
                    return <Typography.Text><Link to={`/tax-collection/${payment.businessId}`}>{business.businessName}</Link></Typography.Text>
                }

                // if person, return contact details link 
                if (payment.personId) {
                    return <Typography.Text><Link to={`/contacts/${payment.personId}`}>{business.firstName} {business.lastName}</Link></Typography.Text>
                }
            }
        },
        {
            title: 'Acciones',
            dataIndex: '',
            key: 'x',
            render: (payment: Payment) => (
                <Space size="middle">
                    <Link to={`/payments/${payment.id}/edit`}>
                        <EditOutlined /> Editar
                    </Link>
                    <a href={completeUrl('/' + payment.image)}>
                        <EyeOutlined/> Voucher
                    </a>

                    {/* TODO: Implement the payment details page */}
                    {/* <Link to={`/payments/${payment.id}`}>
                        Detalles
                    </Link> */}
                    
                </Space>
            )
        },
    ]

    return (
        <>
            <Typography.Title level={4}>Pagos pendientes por asignar a una factura</Typography.Title>
            <Table
                rowKey="id"
                dataSource={payments}
                columns={paymentColumns}
                virtual
                // pagination={true}
            />
        </>
    )
}

const PendingInvoiceToFix = () => {

    const [grossIncomeInvoiceToFix, setGrossIncomeInvoiceToFix] = React.useState<IGrossIncomeInvoice[]>([])
    const { userAuth } = useAuthentication()
    

    const loadPendingGrossIncomeInvoicesToFix = async () => {
        let grossIncomeInvoices = await grossIncomeInvoiceService.getInvoicesToBeFixed(userAuth.token || "")
        console.log({grossIncomeInvoices})
        setGrossIncomeInvoiceToFix([...grossIncomeInvoices])
    }

    useEffect( () => {
        loadPendingGrossIncomeInvoicesToFix()
    }, [])

    const grossIncomeInvoicesColumns: ColumnProps<IGrossIncomeInvoice>[] = [
        {
            title: 'Contribuyente',
            dataIndex: 'businessName',
            render: (businessName: string, record: IGrossIncomeInvoice) => <Link to={`/tax-collection/${record.businessId}`}>{businessName}</Link>
        },
        {
            title: 'Razón',
            dataIndex: 'toFixReason',
            render: (reason: string, record: IGrossIncomeInvoice) => <Link to={`/tax-collection/${record.businessId}/gross-incomes-invoice/${record.id}`}>{reason}</Link>
        },
    ]

    return (
        <>
            <Typography.Title level={4}>Facturas pendientes por corregir</Typography.Title>
            <Table
                rowKey="id"
                dataSource={grossIncomeInvoiceToFix}
                columns={grossIncomeInvoicesColumns}
                virtual
                // pagination={true}
            />
        </>
    )
}

