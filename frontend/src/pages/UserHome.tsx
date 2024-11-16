import { Typography, Table, Card, Button, Space, Popconfirm } from "antd"
import { EditOutlined, EyeOutlined } from "@ant-design/icons"
import React, { useEffect } from "react"

import { Link } from "react-router-dom"

import dayjs from "dayjs"


import * as paymentService from "../util/paymentsApi"
import useAuthentication from "../hooks/useAuthentication"

import { formatBolivares } from "util/currency"
import { completeUrl } from "util"
import { Payment } from "../util/types"

const UserHome: React.FC = () => {

    let { userAuth } = useAuthentication()
    let { user } = userAuth

    console.log({userAuth})

	return (
		<div>
            <Typography.Title>Bienvenido {user?.person?.id 
                ? `${user?.person?.firstName} ${user?.person?.lastName}` 
                : user?.username || "Usuario"}</Typography.Title>

            <PendingWorkSection />
		</div>
	)
}

export default UserHome

const PendingWorkSection = () => {
    return <Card>
        <PendingPaymentsTable />
        <PendingGrossIncomesToBeAssociated/> 
    </Card>
}

const PendingGrossIncomesToBeAssociated = () => {

    // TODO: In progress
    
    return (
        <>
            <Typography.Title level={4}>Declaraciones por asociar a una factura</Typography.Title>
            <Table
                dataSource={[]}
                columns={[]}
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
            <Typography.Title level={4}>Pagos por procesar</Typography.Title>
            <Table
                rowKey="id"
                dataSource={payments}
                columns={paymentColumns}
                // pagination={true}
            />
        </>
    )
}

