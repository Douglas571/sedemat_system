import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, message, Modal, Flex, Row, Col, Statistic, Card, StatisticProps, Typography, Alert } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'; 


import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';

import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { formatBolivares } from '../util/currency';

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
      message.error('Error al consultar tasas de cambio');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyUpdateFromBCV = async () => {
    try {
      setLoading(true);
      // Call the service to fetch the latest rates from BCV
      const updatedRates = await CurrencyExchangeRatesService.fetchFromBCV();

      console.log({theNewRate: updatedRates})
  
      // Update the list of currency entries in the frontend
      if (updatedRates) {
        if (!rates.some( r => r.id === updatedRates.id)) {
          setRates(prevRates => [...prevRates, updatedRates]);
        }
        message.success('Tasas de cambio actualizadas correctamente');
      } else {
        message.error('Error al consultar tasas del BCV');
      }
    } catch (error) {
      console.error('Error updating currency exchange rates:', error);
      message.error('Ocurrió un error al actualizar las tasas de cambio');
    } finally {
      setLoading(false);
    }
  }

  const deleteRate = async (id: number) => {
    try {
      await CurrencyExchangeRatesService.delete(id);
      message.success('Tasas de cambio eliminadas correctamente');
      fetchRates();
    } catch (error) {
      message.error('Error al eliminar tasas de cambio');
    }
  };

  const editRate = (rate: CurrencyExchangeRate) => {
    setCurrentRate(rate);
    form.setFieldsValue(rate);
    setIsEditing(true);
  };

  const columns = [
    {
      title: 'Dólar (BCV)',
      dataIndex: 'dolarBCVToBs',
      key: 'dolarBCVToBs',
      render: (text: string) => formatBolivares(text),
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.dolarBCVToBs - b.dolarBCVToBs,
    },
    {
      title: 'Euro (BCV)',
      dataIndex: 'eurosBCVToBs',
      key: 'eurosBCVToBs',
      render: (text: string) => formatBolivares(text),
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.eurosBCVToBs - b.eurosBCVToBs,
    },
    {
      title: 'Dólar (Negro)',
      dataIndex: 'dolarBlackToBs',
      key: 'dolarBlackToBs',
      render: (text: string) => text ? formatBolivares(text) : '',
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.dolarBlackToBs - b.dolarBlackToBs,
    },
    {
      title: 'Euro (Negro)',
      dataIndex: 'euroBlackToBs',
      key: 'euroBlackToBs',
      render: (text: string) => text ? formatBolivares(text) : '',
      sorter: (a: CurrencyExchangeRate, b: CurrencyExchangeRate) => a.euroBlackToBs - b.euroBlackToBs,
    },
    {
      title: 'Creado el',
      dataIndex: 'createdAt',
      key: 'createdAt',
      defaultSortOrder: 'descend',
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
        <Flex gap={10} wrap>
          <Button 
            onClick={() => navigate(`edit/${record.id}`)}
            // onClick={() => editRate(record)}
          >Editar</Button>
          <Button 
            danger onClick={() => deleteRate(record.id)}>
            Eliminar
          </Button>
        </Flex>
      ),
    },
  ];

  let lastRate
  let MMV
  if (rates.length > 0) {
    lastRate = rates.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    if (lastRate) {
      MMV = {
        exchangeRate: lastRate.dolarBCVToBs > lastRate.eurosBCVToBs ? lastRate.dolarBCVToBs : lastRate.eurosBCVToBs,
        symbol: lastRate.dolarBCVToBs > lastRate.eurosBCVToBs ? '$' : '€',
      }
    }
    
  }
  

  return (
    <Flex vertical gap={20}>
      <Card title={
        <Flex wrap justify='space-between' align='center' style={{ marginBottom: '10px'}}>
          <Typography.Title level={1}>Tasas de Cambio</Typography.Title>
          <Flex gap={20} wrap>
            <Button onClick={handleCurrencyUpdateFromBCV}
              loading={loading}
              disabled={loading}
              icon={<ReloadOutlined />}>
              Actualizar
            </Button>
          </Flex>
        </Flex>
      }>
        

        <ResumeCards lastRate={lastRate} MMV={MMV} />
      </Card>

      {/* <CurrencyExchangeRateEditForm form={form} onFinish={onFinish} /> */}

      <Card title={
        <Flex justify='space-between' align='center' wrap style={{marginBottom: '10px'}}>
          <Typography.Title level={3}>Historial</Typography.Title>
          <Button onClick={() => navigate('new')} icon={<PlusOutlined />}>
            Agregar
          </Button>
        </Flex>
      }>
        

        <Table
          columns={columns}
          dataSource={rates}
          rowKey="id"
          loading={loading}

          style={{
            overflow:'scroll'
          }}
        />
      </Card>
    </Flex>
  );
};

const formatter: StatisticProps['formatter'] = (value) => (
  <CountUp 
    end={value} 
    separator="," 
    duratino={0.3}
    decimals={2}
    decimal=","
  />
);

// TODO: Add typing to this functional component
const ResumeCards: React.FC = ({lastRate, MMV}) => {

  if (!lastRate) return <Alert message="No hay registros" type="info" />

  async function copyToClipboard(number: number): Promise<void> {
    const data: string = number.toString().replace('.', ',')

    if (window.isSecureContext) {
      await navigator.clipboard.writeText(data)
      message.success(`${data} copied to clipboard`)

    } else {
      message.error(`No se pudo copiar al porta papeles`)
    }    
  }

  const cardData = [
    [lastRate.dolarBCVToBs, "Dólar"],
    [lastRate.eurosBCVToBs, "Euro"],
    [MMV.exchangeRate, `MMV (${MMV.symbol})`]
  ];

  return (
    <Flex wrap gap={15}>
      {cardData.map(([value, title], index) => (
        <Card 
          key={index} 
          // bordered={false} 
          onClick={() => copyToClipboard(value)}
          style={{
            minWidth: '150px',
            minHeight: '150px',
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Statistic
            title={title}
            value={value}
            precision={2}
            suffix="Bs."
            formatter={formatter}
          />
        </Card>
      ))}
    </Flex>
  );
}
  

export default CurrencyExchangeRatesPage;
