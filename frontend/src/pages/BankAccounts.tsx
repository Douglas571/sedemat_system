import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Space, Popconfirm, Flex, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import bankAccountService from '../services/bankAccountService';
import { IBankAccount } from '../util/types';
import useAuthentication from '../hooks/useAuthentication';

const BankAccounts = () => {
  
  const [bankAccounts, setBankAccounts] = useState<IBankAccount[]>([]);

  const { userAuth } = useAuthentication();
  const token = userAuth.token;
  const navigate = useNavigate();

  const loadBankAccounts = async () => {
    const fetchedBankAccounts = await bankAccountService.findAll();
    setBankAccounts(fetchedBankAccounts);
  };

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const handleDeleteBankAccount = async (id: number) => {
    try {
      await bankAccountService.delete({ id, token });
      loadBankAccounts();
      message.success('Cuenta de Banco eliminada exitosamente');
    } catch (error) {
      message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Banco',
      dataIndex: 'name',
      key: 'bankName',
    },
    {
      title: 'Cuenta',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: IBankAccount) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => navigate(`/bank-accounts/${record.id}/edit`)}>Editar</Button>
          <Popconfirm
            title="¿Estás seguro de eliminar esta cuenta de banco?"
            onConfirm={() => handleDeleteBankAccount(record.id)}
            okText="Sí"
            cancelText="Cancelar"
          >
            <Button icon={<DeleteOutlined />} danger>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title={
      <Flex justify="space-between">
        Cuentas de Banco
        <Button icon={<PlusOutlined />} onClick={() => navigate('/bank-accounts/new')}>
          Agregar
        </Button>
      </Flex>
    }>
      <Table columns={columns} dataSource={bankAccounts} />
    </Card>
  );
};

export default BankAccounts;
