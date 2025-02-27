import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Flex, Typography, Form, DatePicker, message} from 'antd';
import { FilterOutlined, FormatPainterOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import { IGrossIncome } from '../util/types';
import * as grossIncomeService from '../util/grossIncomeApi';
import { formatBolivares } from '../util/currency';

import dayjs_es from 'dayjs/locale/es';
import dayjs from 'dayjs';
import _ from 'lodash';

import ROLES from '../util/roles';

import useAuthentication from 'hooks/useAuthentication';

dayjs.locale(dayjs_es);

import * as util from '../util';
import { useNavigate, Link } from 'react-router-dom';

import GrossIncomesEmptyFillerGeneralModal from './components/GrossIncomesEmptyFillerGeneralModal'

interface IGrossIncomeWithStatus extends IGrossIncome {
  status: string, 
  badgeStatus: string
}

const datePresetRanges: TimeRangePickerProps['presets'] = [
  { label: 'Hoy', value: [dayjs(), dayjs()] },
  { label: 'Esta Semana', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
  { label: 'Este Mes', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
  { label: 'Este Año', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
];


const GrossIncomeTable = () => {
  
  const [grossIncomes, setGrossIncomes] = useState<IGrossIncomeWithStatus[]>([]);

  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [finalDate, setFinalDate] = useState<Date | null>(null);

  const [showFillEmptyGrossIncomesModal, setShowFillEmptyGrossIncomesModal] = useState(false)

  const navigate = useNavigate();

  const [form] = Form.useForm();

  const { userAuth } = useAuthentication();
  const user = userAuth.user
  const userIsAdmin = user?.roleId === ROLES.ADMIN

  console.log({user})

  const fetchGrossIncomes = async (rawFilters?: any) => {

    if (!rawFilters) {
      rawFilters = form.getFieldsValue()
    }
   
    let filter = {
      period: rawFilters?.period?.format('YYYY-MM-[03]'),
    }
    
    if (rawFilters?.declaredAt?.length == 2) {
      filter.declaredAtStart = rawFilters.declaredAt[0].format('YYYY-MM-DD');
      filter.declaredAtEnd = rawFilters.declaredAt[1].format('YYYY-MM-DD');
    }
    
    let grossIncomes = await grossIncomeService.getAllGrossIncomes(null, filter);

    let grossIncomesWithStatus: IGrossIncomeWithStatus[] = grossIncomes.map((grossIncome: IGrossIncome) => {

      let {status, badgeStatus} = util.getGrossIncomeState({
        grossIncome,
        invoice: grossIncome?.grossIncomeInvoice,
        payments: grossIncome?.grossIncomeInvoice?.payments
      })
      let branchOffice = grossIncome?.branchOffice?.nickname ?? '--'


      return ({
      ...grossIncome,
      period: dayjs(grossIncome.period).format('YYYY-MM'),

      status, 
      badgeStatus,
      branchOfficeNickName: branchOffice

    })});

    setGrossIncomes(grossIncomesWithStatus);
  };

  useEffect(() => {
    fetchGrossIncomes();
  }, []);

  const handleFillEmptyGrossIncomes = async (values: {
    period: string
  }) => {
    try {
      let result = await grossIncomeService.fillEmptyBulkGrossIncomes({
        filters: {},
        period: values.period,
        token: userAuth.token || ''
      })
      
    } catch (error) {
      message.error("Error al generar las declaraciones vacías")
    }
  }

  const filtersSelectedYear = (grossIncomes: IGrossIncome[]) => {
    return [...new Set(grossIncomes.map(grossIncome => dayjs(grossIncome.period).format('YYYY')))].map(year => ({text: year, value: year}))
  }

  const columns: ColumnProps<IGrossIncome>[] = [
    {
      title: 'Año',
      dataIndex: 'year',
      key: 'year',
      render: (text: any, grossIncome: IGrossIncome) => {
        return dayjs(grossIncome.period).format('YYYY');
      },

      showSorterTooltip: false,
      sorter: (a: IGrossIncome, b: IGrossIncome) => dayjs(a.period).isBefore(dayjs(b.period)) ? -1 : 1,

      filterSearch: true,

      filters: [...new Set(grossIncomes.map(grossIncome => dayjs(grossIncome.period).format('YYYY')))].map(year => ({text: year, value: year})),

      onFilter: (value: string, record: IGrossIncome) => {
        return dayjs(record.period).format('YYYY') === value
      }
    },

    {
      title: 'Mes',
      dataIndex: 'month',
      key: 'month',
      render: (text: any, grossIncome: IGrossIncome) => {
        return _.startCase(dayjs(grossIncome.period).format('MMMM'));
      },

      filterSearch: true,

      filters: [...new Set(grossIncomes.map(grossIncome => _.startCase(dayjs(grossIncome.period).format('MMMM'))))].map(month => ({text: month, value: month})),

      onFilter: (value: string, record: IGrossIncome) => {
        return dayjs(record.period).format('MMMM') === value.toLowerCase()
      },

      showSorterTooltip: false,
      sorter: (a: IGrossIncome, b: IGrossIncome) => dayjs(a.period).isBefore(dayjs(b.period)) ? -1 : 1,
    },
    {
      title: "Empresa",
      dataIndex: "business",
      key: "business",

      filterSearch: true,

      filters: [... new Set(grossIncomes.map(grossIncome => grossIncome.business.businessName))].map(business => ({text: business, value: business})),

      onFilter: (value: string, record: IGrossIncome) => {
        return record.business.businessName === value
      },

      showSorterTooltip: false,
      sorter: (a: IGrossIncome, b: IGrossIncome) => a.business.businessName.localeCompare(b.business.businessName),

      render: (text: any, grossIncome: IGrossIncome) => {
        return <Link to={`/tax-collection/${grossIncome?.business.id}`}>{grossIncome?.business.businessName}</Link>;
      }
    },
    {
      title: 'Sede',
      dataIndex: 'branchOffice',
      key: 'branchOffice',

      filters: [... new Set(grossIncomes.map(grossIncome => grossIncome.branchOfficeNickName))].map(branchOffice => ({text: branchOffice, value: branchOffice})),

      onFilter: (value: string, record: IGrossIncome) => {
        return record.branchOfficeNickName === value
      },

      render: (text: any, grossIncome: IGrossIncome) => {
        return grossIncome.branchOfficeNickName;
      },

      showSorterTooltip: false,
      sorter: (a: IGrossIncome, b: IGrossIncome) => a.branchOfficeNickName.localeCompare(b.branchOfficeNickName),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (text: any, grossIncome: IGrossIncomeWithStatus) => {
        let {badgeStatus} = grossIncome

        return <Badge status={badgeStatus} text={text} />
      },

      filters: [... new Set(grossIncomes.map(grossIncome => grossIncome.status))].map(status => ({text: status, value: status})),

      onFilter: (value: string, record: IGrossIncomeWithStatus) => {
        return record.status === value
      },

      showSorterTooltip: false,
      sorter: (a: IGrossIncomeWithStatus, b: IGrossIncomeWithStatus) => a.status.localeCompare(b.status),
      
    },
    {
      title: 'Total',
      dataIndex: 'totalTaxInBs',
      key: 'total',
      render: (text: any, grossIncome: IGrossIncome) => {
        return formatBolivares(text)
      },

      showSorterTooltip: false,
      sorter: (a: IGrossIncome, b: IGrossIncome) => a.totalTaxInBs - b.totalTaxInBs
    },
    {
      title: 'Acciones',
      dataIndex: 'actions',
      key: 'actions',
      render: (text: any, grossIncome: IGrossIncome) => {
        
        return (
          <Flex gap={16}>
            <Link to={`/tax-collection/${grossIncome.businessId}/gross-incomes/${grossIncome.id}`}>
              Detalles
            </Link>
            {grossIncome.grossIncomeInvoiceId && (
              <Link to={`/tax-collection/${grossIncome.businessId}/gross-incomes-invoice/${grossIncome.grossIncomeInvoiceId}`} >
                Factura
              </Link>
            )}
          </Flex>
        )
      }
    },
  ];

  return (<>
    <Card title={<Typography.Title level={1}>Ingresos Brutos Declarados</Typography.Title>}>
      <Form
        onFinish={fetchGrossIncomes}

        form={form}

        initialValues={{
          period: dayjs().subtract(1, 'month'),
          declaredAt: datePresetRanges[2].value,
        }}
      >
        <Flex wrap gap={10}>
          <Form.Item name="period" label="Periodo" >
            <DatePicker.MonthPicker />
          </Form.Item>

          <Form.Item name="declaredAt" label="Fecha de Declaración" >
            <DatePicker.RangePicker 
              format="DD/MM/YYYY"
              presets={datePresetRanges}
            />
          </Form.Item>

          <Form.Item>
            <Button icon={<FilterOutlined/>} htmlType="submit">
              Filtrar
            </Button>
          </Form.Item>

          {
            userIsAdmin && (
              <Button icon={<FormatPainterOutlined />} onClick={() => setShowFillEmptyGrossIncomesModal(true)}>
                Rellenar
              </Button>)
          }
          

        </Flex>
      </Form>

      <br/>
      
      <Table 
        // virtual
        rowKey="id"
        style={{ overflow: 'auto' }}
        columns={columns} 
        dataSource={grossIncomes} />

      
      <GrossIncomesEmptyFillerGeneralModal
        visible={showFillEmptyGrossIncomesModal}
        onSubmit={handleFillEmptyGrossIncomes}
        onCancel={() => setShowFillEmptyGrossIncomesModal(false)}
      />
    </Card>
  </>);
};

export default GrossIncomeTable;

