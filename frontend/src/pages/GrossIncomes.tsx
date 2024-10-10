import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge, Flex } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { IGrossIncome } from '../util/types';
import * as grossIncomeService from '../util/grossIncomeApi';
import { formatBolivares } from '../util/currency';
import dayjs from 'dayjs';

import * as util from '../util';
import { useNavigate } from 'react-router-dom';

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


        return ({
        ...grossIncome,
        period: dayjs(grossIncome.period).format('YYYY-MM'),

        status, 
        badgeStatus

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
        return dayjs(grossIncome.period).format('MMMM');
      },

      filters: [...new Set(grossIncomes.map(grossIncome => dayjs(grossIncome.period).format('MMMM')))].map(month => ({text: month, value: month})),

      onFilter: (value: string, record: IGrossIncome) => {
        return dayjs(record.period).format('MMMM') === value
      }
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
      }
    },
    {
      title: 'Total',
      dataIndex: 'totalTaxInBs',
      key: 'total',
      render: (text: any, grossIncome: IGrossIncome) => {
        return formatBolivares(text)
      }
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
    <Card title="Ingresos Brutos Declarados">
      <Table columns={columns} dataSource={grossIncomes} />

    </Card>
  
  </>);
};

export default GrossIncomeTable;

