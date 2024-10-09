import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Typography } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import bankAccountService from '../services/bankAccountService'
import useAuthentication from '../hooks/useAuthentication'

interface BankAccountFormProps {
    
}

const BankAccountForm: React.FC<BankAccountFormProps> = () => {
    const [form] = Form.useForm()
    const { bankAccountId } = useParams()
    const navigate = useNavigate()
    const isEditing = Number.isInteger(Number(bankAccountId))
    const [bankAccount, setBankAccount] = useState<IBankAccount | null>(null)

    const { userAuth } = useAuthentication()
    const token = userAuth.token

    useEffect(() => {
        if (isEditing) {
            loadBankAccount()
        }
    }, [])

    const loadBankAccount = async () => {
        try {
            const bankAccount = await bankAccountService.findById({id: Number(bankAccountId)})

            if (!bankAccount) {
              throw new Error('Bank account not found')
            }
            setBankAccount(bankAccount)
            form.setFieldsValue({
                bankAccountName: bankAccount.name,
                bankAccountNumber: bankAccount.accountNumber
            })
        } catch (error) {
            console.error(error)
        }
    }

    const onFinish = async (values: any) => {
        try {
            if (isEditing) {
                await bankAccountService.update({
                    id: Number(bankAccountId),
                    data: {
                        name: values.bankAccountName,
                        accountNumber: values.bankAccountNumber
                    }, 
                    token
                })
            } else {
                await bankAccountService.create({
                  data: {
                    name: values.bankAccountName,
                    accountNumber: values.bankAccountNumber
                  },
                  token
                })
            }
            navigate('/bank-accounts')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Card title={<Typography.Title level={1}>{isEditing ? 'Editando Cuenta de Banco' : 'Registrando Nueva Cuenta de Banco'}</Typography.Title>}>
            <Form
                form={form}
                name="bank-account-form"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    label="Nombre del Banco"
                    name="bankAccountName"
                    rules={[{ required: true, message: 'El nombre del banco es requerido' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Numero de cuenta"
                    name="bankAccountNumber"
                    rules={[{ required: true, message: 'El numero de cuenta es requerido' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Guardar
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    )
}

export default BankAccountForm
