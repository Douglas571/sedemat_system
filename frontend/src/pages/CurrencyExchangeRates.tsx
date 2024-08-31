import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, message, Modal, Flex } from 'antd';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';

import { useNavigate } from 'react-router-dom';

interface CurrencyExchangeRate {
  id: number;
  dolarBCVToBs: number;
  eurosBCVToBs: number;
  dolarBlackToBs: number;
  euroBlackToBs: number;
  createdAt: string;
  updatedAt: string;
}

const CurrencyExchangeRatesPage: React.FC = () => {
  const [rates, setRates] = useState<CurrencyExchangeRate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  
  const [currentRate, setCurrentRate] = useState<CurrencyExchangeRate | null>(null);

  const navigate = useNavigate()

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const data = await CurrencyExchangeRatesService.getAll();
      setRates(data);
    } catch (error) {
      message.error('Failed to fetch currency exchange rates');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyUpdateFromBCV = async () => {
    try {
      // Call the service to fetch the latest rates from BCV
      const updatedRates = await CurrencyExchangeRatesService.fetchFromBCV();

      console.log({theNewRate: updatedRates})
  
      // Update the list of currency entries in the frontend
      if (updatedRates) {
        setRates(prevRates => [...prevRates, updatedRates]);
        message.success('Currency exchange rates updated successfully');
      } else {
        message.error('Failed to update currency exchange rates');
      }
    } catch (error) {
      console.error('Error updating currency exchange rates:', error);
      message.error('An error occurred while updating currency exchange rates');
    }
  }

  const onFinish = async (values: any) => {
    try {
      if (isEditing && currentRate) {
        await CurrencyExchangeRatesService.update(currentRate.id, values);
        message.success('Currency exchange rate updated successfully');
      } else {
        await CurrencyExchangeRatesService.create(values);
        message.success('Currency exchange rate created successfully');
      }
      form.resetFields();
      setCurrentRate(null);
      setIsEditing(false);
      fetchRates();
    } catch (error) {
      message.error('Failed to save currency exchange rate');
    }
  };

  const deleteRate = async (id: number) => {
    try {
      await CurrencyExchangeRatesService.delete(id);
      message.success('Currency exchange rate deleted successfully');
      fetchRates();
    } catch (error) {
      message.error('Failed to delete currency exchange rate');
    }
  };

  const editRate = (rate: CurrencyExchangeRate) => {
    setCurrentRate(rate);
    form.setFieldsValue(rate);
    setIsEditing(true);
  };

  const columns = [
    {
      title: 'USD/BS (BCV)',
      dataIndex: 'dolarBCVToBs',
      key: 'dolarBCVToBs',
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.dolarBCVToBs - b.dolarBCVToBs,
    },
    {
      title: 'EUR/BS (BCV)',
      dataIndex: 'eurosBCVToBs',
      key: 'eurosBCVToBs',
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.eurosBCVToBs - b.eurosBCVToBs,
    },
    {
      title: 'USD/BS (Negro)',
      dataIndex: 'dolarBlackToBs',
      key: 'dolarBlackToBs',
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.dolarBlackToBs - b.dolarBlackToBs,
    },
    {
      title: 'EUR/BS (Negro)',
      dataIndex: 'euroBlackToBs',
      key: 'euroBlackToBs',
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.euroBlackToBs - b.euroBlackToBs,
    },
    {
      title: 'Creado el',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    },
    {
      title: 'Actualizado el',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    },
    {
      title: 'Acciones',
      key: 'action',
      render: (text: string, record: CurrencyExchangeRate) => (
        <>
          <Button 
            onClick={() => navigate(`edit/${record.id}`)}
            // onClick={() => editRate(record)}
          >Editar</Button>
          <Button 
            danger onClick={() => deleteRate(record.id)}>
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Flex wrap justify='space-between' align='center'>
        <h1>Currency Exchange Rates</h1>
        <Button onClick={handleCurrencyUpdateFromBCV}>
          Actualizar
        </Button>
      </Flex>
      
      {/* <CurrencyExchangeRateEditForm form={form} onFinish={onFinish} /> */}

      <Table
        columns={columns}
        dataSource={rates}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

export default CurrencyExchangeRatesPage;
