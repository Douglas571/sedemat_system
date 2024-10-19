import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Flex, Typography } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { IGrossIncome } from '../util/types';
import * as grossIncomeService from '../util/grossIncomeApi';
import { formatBolivares } from '../util/currency';

import dayjs_es from 'dayjs/locale/es';
import dayjs from 'dayjs';
import _ from 'lodash';

dayjs.locale(dayjs_es);

import * as util from '../util';
import { useNavigate, Link } from 'react-router-dom';

interface IGrossIncomeWithStatus extends IGrossIncome {
  status: string, 
  badgeStatus: string
}

const GrossIncomeTable = () => {
  
  const [grossIncomes, setGrossIncomes] = useState<IGrossIncomeWithStatus[]>([]);

  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [finalDate, setFinalDate] = useState<Date | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGrossIncomes = async () => {
      const filter = {
        initialDate: initialDate ? initialDate.toISOString() : undefined,
        finalDate: finalDate ? finalDate.toISOString() : undefined,
    };
      let grossIncomes = await grossIncomeService.getAllGrossIncomes();

      let grossIncomesWithStatus: IGrossIncomeWithStatus[] = grossIncomes.map((grossIncome: IGrossIncome) => {

        let {status, badgeStatus} = util.getGrossIncomeState({grossIncome})
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

    fetchGrossIncomes();
  }, []);

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
      title: 'Sucursal',
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
            <Button type="default" onClick={() => navigate(`/tax-collection/${grossIncome.businessId}/gross-incomes/${grossIncome.id}`)}>
              Detalles
            </Button>
            {grossIncome.grossIncomeInvoiceId && (
              <Button type="default" onClick={() => navigate(`/tax-collection/${grossIncome.businessId}/gross-incomes-invoice/${grossIncome.grossIncomeInvoiceId}`)} >
                Factura
              </Button>
            )}
          </Flex>
        )
      }
    },
  ];

  return (<>
    <Card title={<Typography.Title level={1}>Ingresos Brutos Declarados</Typography.Title>}>
      <Table columns={columns} dataSource={grossIncomes} />
    </Card>
  
  </>);
};

export default GrossIncomeTable;

