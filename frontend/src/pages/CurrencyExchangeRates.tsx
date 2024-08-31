import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Table, message, Modal } from 'antd';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';

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
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentRate, setCurrentRate] = useState<CurrencyExchangeRate | null>(null);

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
    },
    {
      title: 'EUR/BS (BCV)',
      dataIndex: 'eurosBCVToBs',
      key: 'eurosBCVToBs',
    },
    {
      title: 'USD/BS (Black)',
      dataIndex: 'dolarBlackToBs',
      key: 'dolarBlackToBs',
    },
    {
      title: 'EUR/BS (Black)',
      dataIndex: 'euroBlackToBs',
      key: 'euroBlackToBs',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: CurrencyExchangeRate) => (
        <>
          <Button onClick={() => editRate(record)}>Editar</Button>
          <Button danger onClick={() => deleteRate(record.id)}>
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Currency Exchange Rates</h1>
      
      <CurrencyExchangeRateEditForm form={form} onFinish={onFinish} />

      <Table
        columns={columns}
        dataSource={rates}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

function CurrencyExchangeRateEditForm({ form, onFinish }): JSX.Element {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        dolarBCVToBs: 0,
        eurosBCVToBs: 0,
        dolarBlackToBs: 0,
        euroBlackToBs: 0,
      }}
    >
      <Form.Item
        label="USD/BS (BCV)"
        name="dolarBCVToBs"
        rules={[{ required: true, message: 'Please input the USD/BS (BCV) rate!' }]}
      >
        <Input type="number" />
      </Form.Item>

      <Form.Item
        label="EUR/BS (BCV)"
        name="eurosBCVToBs"
        rules={[{ required: true, message: 'Please input the EUR/BS (BCV) rate!' }]}
      >
        <Input type="number" />
      </Form.Item>

      <Form.Item
        label="USD/BS (Black)"
        name="dolarBlackToBs"
        rules={[{ required: true, message: 'Please input the USD/BS (Black) rate!' }]}
      >
        <Input type="number" />
      </Form.Item>

      <Form.Item
        label="EUR/BS (Black)"
        name="euroBlackToBs"
        rules={[{ required: true, message: 'Please input the EUR/BS (Black) rate!' }]}
      >
        <Input type="number" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {form.getFieldValue('id') ? 'Update' : 'Submit'}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default CurrencyExchangeRatesPage;
