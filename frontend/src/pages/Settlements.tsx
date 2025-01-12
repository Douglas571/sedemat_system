import React, { useState, useEffect } from 'react';
import { Table, Flex,  Button, Card, Badge, Typography, Form, DatePicker } from 'antd';
import { FilterOutlined, FileExcelOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import settlementService from '../services/SettlementService';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import { ISettlement } from "../util/types";
import useAuthentication from 'hooks/useAuthentication';

import * as reportsService from '../services/reportsService';

const datePresetRanges: TimeRangePickerProps['presets'] = [
  { label: 'Hoy', value: [dayjs(), dayjs()] },
  { label: 'Esta Semana', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
  { label: 'Este Mes', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: 'Este Año', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];

const SettlementPage: React.FC = () => {
  const [settlements, setSettlements] = useState<ISettlement[]>([]);
  const [form] = Form.useForm();

  const { userAuth } = useAuthentication();

  const fetchSettlements = async (filters?: any) => {
    const rawFilters = filters || form.getFieldsValue();
    const filter = {
      settlementDateStart: rawFilters?.settlementDate?.[0]?.format('YYYY-MM-DD'),
      settlementDateEnd: rawFilters?.settlementDate?.[1]?.format('YYYY-MM-DD'),
    };

    const settlementsData = await settlementService.findAll(userAuth?.token, filter);
    setSettlements([...settlementsData.sort((a, b) => a.code.localeCompare(b.code) * -1)]);
  };

  useEffect(() => {
    fetchSettlements();

    form.setFieldsValue({
      settlementDate: [dayjs().get('date') < 5 ? dayjs().subtract(1, 'month').startOf('month') : dayjs().startOf('month'), dayjs()]
    })
  }, []);

  const columns: ColumnProps<ISettlement>[] = [
    {
      title: 'Contribuyente',
      dataIndex: ['grossIncomeInvoice', 'businessName'],
      key: 'businessName',
      render: (text, record) => text,
      // filters: [...new Set(settlements.map((s) => s.personName))].map((name) => ({ text: name, value: name })),
      // onFilter: (value, record) => record.personName === value,
    },
    {
      title: 'Número de comprobante',
      dataIndex: 'code',
      key: 'id',
      render: (text) => text,
      showSorterTooltip: false,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Fecha de Liquidación',
      dataIndex: 'settledAt',
      key: 'settledAt',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      showSorterTooltip: false,
      sorter: (a, b) => dayjs(a.settledAt).isBefore(dayjs(b.settledAt)) ? -1 : 1,
    },
    {
      title: 'Acciones',
      dataIndex: 'grossIncomeInvoiceId',
      key: 'grossIncomeInvoiceId',
      render: (text, record) => {
        let businessId = record.grossIncomeInvoice.businessId
        let grossIncomeInvoiceId = record.grossIncomeInvoiceId
        return (
          <Flex gap={16}>
            
            <Link to={`/tax-collection/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}`}>Factura</Link>
          
            
            <Link to={`/printable/${businessId}/gross-incomes-invoice/${grossIncomeInvoiceId}/settlement`}>Imprimir</Link>
          </Flex>
        )
      },
    },
    // {
    //   title: 'Monto (Bs)',
    //   dataIndex: 'amount',
    //   key: 'amount',
    //   render: (text) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(text),
    // },
  ];

  async function handleDonwloadExcelFiles() {
    const rawFilters = form.getFieldsValue();
    const filters = {
      settlementDateStart: rawFilters?.settlementDate?.[0]?.format('YYYY-MM-DD'),
      settlementDateEnd: rawFilters?.settlementDate?.[1]?.format('YYYY-MM-DD'),
    };

    reportsService.downloadSettlementsReport({ 
      filters,
      token: userAuth.token, 
      format: 'excel' })
  }

  return (
    <Card title={<Typography.Title level={1}>Liquidaciones</Typography.Title>}>
      <Form form={form} layout="inline" onFinish={fetchSettlements}>
        <Flex justify='space-between' style={{width: '100%'}}>
          <Flex>
            <Form.Item label="Fecha de Liquidación" name="settlementDate">
              <DatePicker.RangePicker presets={datePresetRanges} />
            </Form.Item>
            <Form.Item>
              <Button icon={<FilterOutlined />} htmlType="submit">
                Filtrar
              </Button>
            </Form.Item>
          </Flex>
          <Button 
              icon={<FileExcelOutlined />} 
              style={{ marginLeft: 8 }} 
              onClick={handleDonwloadExcelFiles}>
              Descargar
          </Button>
        </Flex>
      </Form>
      <Table rowKey="id" columns={columns} dataSource={settlements} style={{ marginTop: 16 }} />
    </Card>
  );
};

export default SettlementPage;
