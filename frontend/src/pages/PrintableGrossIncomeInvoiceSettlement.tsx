import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Flex, Descriptions, DescriptionsProps, Table, TableProps } from 'antd';

const { Title } = Typography;

import { formatBolivares, CurrencyHandler } from '../util/currency';
import { IGrossIncomeInvoice, IGrossIncome, Business, CurrencyExchangeRate, Payment } from '../util/types';

import grossIncomeInvoiceService from '../services/GrossIncomesInvoiceService'
import * as paymentsApi from '../util/paymentsApi'
import * as grossIncomeService from '../util/grossIncomeApi'
import * as api from '../util/api'
import { useParams } from 'react-router-dom';

import dayjs from 'dayjs';

import * as util from '../util'
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';


const isBadDebt = ({
  grossIncome,
  paidAt
}: {
  grossIncome: IGrossIncome,
  paidAt: Date
}): boolean => {
  const grossIncomeDate = dayjs(grossIncome.period);
  const monthsDifference = dayjs(paidAt).diff(grossIncomeDate, 'month');

  // console.log({monthsDifference})

  // console.log({monthBadDeb: grossIncomeDate.get('month')})
  return monthsDifference > 2;
}

const getBadDebtTax = ({
  grossIncomes,
  paidAt,
  alicuota,
  minTaxMMV,
  MMVToBs
}: {
  grossIncomes: IGrossIncome[],
  paidAt: Date | undefined,
  alicuota: number,
  minTaxMMV: number,
  MMVToBs: number
}): number => {
    // calculate the badDebt 

    // sume the taxes for the gross incomes which are delayed by more than two months since the invoice paid at date 
      // if i have January, February and March, and i end up paying in march. January is a delayed month.
      // so being in the month 8 and having finished of paid the 6th month, will be a bad debt
    if (!grossIncomes || !paidAt) return 0;

    let badDebts = grossIncomes.filter(g => isBadDebt({grossIncome: g, paidAt}))

    let totalTaxes = badDebts.map( b => util.getGrossIncomeTaxInBs({
      grossIncomeInBs: b.amountBs,
      alicuota: alicuota,
      minTaxMMV: minTaxMMV,
      MMVToBs: MMVToBs
    }))

    console.log({badDebts, totalTaxes, MMVToBs, minTaxMMV})

  return totalTaxes.reduce((acc: number, curr: number) => CurrencyHandler(acc).add(curr).value, 0);
}

const getEconomicActivityTax = ({
  grossIncomes,
  paidAt,
  alicuota,
  minTaxMMV,
  MMVToBs
}: {
  grossIncomes: IGrossIncome[],
  paidAt: Date | undefined,
  alicuota: number,
  minTaxMMV: number,
  MMVToBs: number
}): number => {

  if (!grossIncomes || !paidAt) return 0;

    let badDebts = grossIncomes.filter(g => !isBadDebt({grossIncome: g, paidAt}))

    let totalTaxes = badDebts.map( b => util.getGrossIncomeTaxInBs({
      grossIncomeInBs: b.amountBs,
      alicuota: alicuota,
      minTaxMMV: minTaxMMV,
      MMVToBs: MMVToBs
    }))

    console.log({badDebts, totalTaxes, MMVToBs, minTaxMMV})

  return totalTaxes.reduce((acc: number, curr: number) => CurrencyHandler(acc).add(curr).value, 0);
}

const getWasteCollectionTax = (props: { grossIncomes: IGrossIncome[] }): number => {
  let {grossIncomes} = props

  if (!grossIncomes) return 0

  let tax = grossIncomes.map(g => util.getWasteCollectionTaxInBs(g)).reduce((acc: number, curr: number) => CurrencyHandler(acc).add(curr).value, 0)

  return tax 
}

  // sort gross incomes from from older to new
  // crete an Map 
    // each key is a year
    // each key contains an array of months for each year 
  // for each year, 
    // join the months 
    // the last one will have "y `${month}"
    // using this "const month = date.toLocaleString('default', { month: 'long' });"
  //
  
// nov-23, dic-23, jan-24, feb-24
// { 2023: ['noviembre', 'diciembre'], 2024: ['enero', 'febrero']}

// result: "Noviembre y Diciembre del 2023, así como Enero y Febrero del 2024"
// Function to format the description of gross incomes by year and month
const formatGrossIncomeDescription = (grossIncomes: IGrossIncome[]): string => {
  const monthMap: { [key: number]: string[] } = {};

  if (grossIncomes.length === 0) return '';
  
  if (grossIncomes.length === 1) {
    const date = new Date(grossIncomes[0].period);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    return `impuesto sobre actividad economica correspondiente al mes de ${month} del ${year}`;
  }

  grossIncomes.forEach(g => {
    const date = new Date(g.period);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    if (!monthMap[year]) {
      monthMap[year] = [];
    }
    if (!monthMap[year].includes(month)) {
      monthMap[year].push(month);
    }
  });

  const formattedParts = Object.entries(monthMap).map(([year, months]) => {
    const lastMonth = months.pop();
    return `${months.join(', ')}${months.length ? ' y ' : ''}${lastMonth} del ${year}`;
  });

  return `Impuesto sobre actividad economica correspondiente a los meses de ${formattedParts.join(', así como ')}`;
}

const GrossIncomeInvoiceSettlement: React.FC = () => {
  const { businessId, grossIncomeInvoiceId } = useParams()

  const [business, setBusiness] = React.useState<Business>();
  const [grossIncomeInvoice, setGrossIncomeInvoice] = React.useState<IGrossIncomeInvoice>();
  const [grossIncomes, setGrossIncomes] = React.useState<IGrossIncome[]>([]);
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState<CurrencyExchangeRate>()
  const [payments, setPayments] = useState<Payment[]>([])

  let MMVToBs = currencyExchangeRate ? util.getMMVExchangeRate(currencyExchangeRate) : 0

  let badDebtTax = getBadDebtTax({
    grossIncomes,
    paidAt: grossIncomeInvoice?.paidAt,
    MMVToBs: MMVToBs,
    minTaxMMV: business?.economicActivity?.minimumTax || 0,
    alicuota: business?.economicActivity?.alicuota || 0
  })
  let economicActivityTax = getEconomicActivityTax({
    grossIncomes,
    paidAt: grossIncomeInvoice?.paidAt,
    MMVToBs: MMVToBs,
    minTaxMMV: business?.economicActivity?.minimumTax || 0,
    alicuota: business?.economicActivity?.alicuota || 0
  })
  let wasteCollectionTax = getWasteCollectionTax({grossIncomes})
  let formTax = grossIncomeInvoice?.formPriceBs || 0

  let totalBs = CurrencyHandler(badDebtTax).add(economicActivityTax).add(wasteCollectionTax).add(formTax).value

  const REFERENCE_SEPARATOR = ' - '
  let references: string = useMemo(() => payments.reduce((acc: string, curr: Payment) => acc ? acc + REFERENCE_SEPARATOR + curr.reference : curr.reference, ''), [payments])

  let DATE_SEPARATOR = ' - '
  let paymentDate: string = useMemo(() => {
    let minDate = new Date()
    let maxDate = new Date()

    payments.forEach( p => {
      console.log({paymentDate: dayjs(p.paymentDate).format('DD/MM/YYYY - hh:mm:ss')})
  
      let curr = new Date(p.paymentDate)
  
      // if min and max empty, them them current 
      if (!minDate && !maxDate) {
        minDate = curr
        maxDate = curr
      }
  
      // if current is greater than max date, 
      if (curr > maxDate) {
        maxDate = curr 
      }
        // max date = current date
      // if current is less than min date, set min date = current date 
      if (minDate > curr) {
        minDate = curr 
      }
    })

    if (dayjs(maxDate).format('DD/MM/YYYY') === dayjs(minDate).format('DD/MM/YYYY')) {
      return dayjs(maxDate).format('DD/MM/YYYY')
    }

    return dayjs(minDate).format('DD/MM') + DATE_SEPARATOR + dayjs(maxDate).format('DD/MM/YYYY')
  }, [payments])

  let description = formatGrossIncomeDescription(grossIncomes)



  const loadData = async () => {
    const invoice = await grossIncomeInvoiceService.getById(Number(grossIncomeInvoiceId))
    setGrossIncomeInvoice(invoice)
    
    let grossIncomes = await grossIncomeService.getAllGrossIncomesByInvoiceId(Number(grossIncomeInvoiceId))
    setGrossIncomes(grossIncomes)

    let business = await api.fetchBusinessById(Number(businessId))
    setBusiness(business)
    console.log({business})

    let payments = await paymentsApi.findAll({grossIncomeInvoiceId: Number(grossIncomeInvoiceId)}) 
    setPayments(payments)
    console.log({payments})

    console.log({grossIncomes})
    let cerId = grossIncomes[0].currencyExchangeRatesId
    let currencyExchangeRate = await CurrencyExchangeRatesService.getById(cerId)
    setCurrencyExchangeRate(currencyExchangeRate)

    console.log({invoice, grossIncomes, business})
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!business || !grossIncomeInvoice || !grossIncomes) {
    return <Flex><Typography.Text>Cargando...</Typography.Text></Flex>
  }

  interface Settlement {
    number: number;
    business: Business;

    grossIncomeInvoice: IGrossIncomeInvoice;

    description: string;
    amountBs: number;
  }

  const settlement: Settlement = {
    number: "0001",
    grossIncomeInvoice: {
      id: 1,
      date: new Date(),
      amountBs: 1000,
      businessId: 1,
      totalBs: 1000,
    },
    description: "PAGO POR :  IMPUESTO  SOBRE ACTIVIDAD ECONOMICA CORRESPONDIENTE A LOS MESES DE ABRIL Y MAYO AÑO 2024.",
  }

  

  const headerItems: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'RAZÓN SOCIAL',
      children: business.businessName,
      span: 3,
    },
    {
      key: '2',
      label: 'RIF',
      children: business.dni,
      span: 3,
    },
    {
      key: '3',
      label: 'DESCRIPCIÓN DEL PAGO',
      children: <><strong>PAGO POR: </strong> {description.toUpperCase()}</>,
      span: 6,
    },
    {
      key: '4',
      label: 'MONTO',
      children: formatBolivares(totalBs),
      span: 2,
    },{
      key: '5',
      labelStyle: {
        display: "none",
      },
      children: 'LETRAS',
      span: 4,
    },
  ];


  const tableColumns: TableProps['columns'] = [
    {
      title: 'CÓDIGO',
      dataIndex: 'code',
      key: 'code',
      align: 'left',
    },
    {
      title: 'DESCRIPCIÓN',
      dataIndex: 'description',
      key: 'description',
      align: 'left',
    },
    {
      title: 'MONTO',
      dataIndex: 'amountBs',
      key: 'amountBs',
      align: 'right',
      render: (value) => formatBolivares(value)
    }
  ];

  const tableItems: TableProps['dataSource'] = [
    {
      code: '301021200',
      description: 'DEUDAS MOROSAS',
      amountBs: formatBolivares(badDebtTax),
    },
    {
      code: '301020700',
      description: 'PATENTE DE INDUSTRIA Y COMERCIO',
      amountBs: formatBolivares(economicActivityTax), // Assuming amount is not specified
    },
    {
      code: '301035400',
      description: 'ASEO DOMICILIARIO',
      amountBs: formatBolivares(wasteCollectionTax), // Assuming amount is not specified
    },
    {
      code: '301090101',
      description: 'INGRESO POR FORMULARIOS Y GACETAS MUNICIPALES',
      amountBs: formatBolivares(formTax), // Assuming amount is not specified
    },
  ];

  const descriptionPaymentDetails: DescriptionsProps['items'] = [
  {
    key: '1',
    label: 'BANCO',
    children: "BANCO VENEZUELA C.A",
  },
  {
    key: '2',
    label: 'CUENTA',
    children: "0102-0339...1892",
  },
  {
    key: '3',
    label: 'BENEFICIARIO',
    children: "SEDEMAT",
  },
  {
    key: '4',
    label: 'FECHA',
    children: paymentDate,
  },
  {
    key: '5',
    label: 'REFERENCIA',
    children: references,
  },
  {
    key: '6',
    label: 'VERIFICADO POR',
    children: "TRABAJADOR",
  },    
];

  return (
    <Flex vertical style={{ width: '100%' }}>

      <Flex align='center' justify='center' gap={10}>
          <img src={"/images/zamora_flag.png"} width={100} alt="Zamora Flag" />
          <img src={"/images/zamora_shield.png"} width={100} alt="Zamora Shield" />
          <Flex style={{maxWidth: "350px", textAlign: 'center', fontFamily: "Arial"}}>
              <Typography.Text>
              REPÚBLICA BOLIVARIANA DE VENEZUELA<br/>
              ALCALDIA DEL MUNICIPIO ZAMORA ESTADO FALCÓN
              </Typography.Text>
          </Flex>
          <img src={"/images/sedemat_logo.png"} width={100} alt="SEDEMAT Shield" />
      </Flex>

      <Flex justify='right'><Typography.Text>COMPROBANTE DE INGRESO N°{settlement.number}</Typography.Text></Flex>
      <Flex justify='right'><Typography.Text>PUERTO CUMAREBO; 05 DE AGOSTO 2024</Typography.Text></Flex>

      <Descriptions 
        column={6}
        size='small'
        bordered
        items={headerItems}
        style={{marginBottom: "20px"}}
      />

      <Table
        size='small'
        columns={tableColumns}
        dataSource={tableItems}
        bordered
        pagination={false}
        style={{marginBottom: "20px"}}
        summary={(pageData) => {

          // console.log(pageData)

          return (
          <Table.Summary.Row style={{ borderTop: "1px solid rgba(5, 5, 5, 0.06)"}}>
            <Table.Summary.Cell index={0} colSpan={2} align='right'>TOTAL COMPROBANTE DE INGRESO:</Table.Summary.Cell>
            <Table.Summary.Cell index={0} colSpan={2} align='right'>{formatBolivares(totalBs)}</Table.Summary.Cell>
          </Table.Summary.Row>)

        }}
      />

      <Flex>
        <Descriptions
          column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          bordered
          size='small'
          items={descriptionPaymentDetails}

          style={{
            
            flexGrow: 1,
          }}
        />

        <Flex vertical 
            style={{
              // border: "1px solid rgba(5, 5, 5, 0.06)",
              // borderRadius: "10px 10px 0px 0px",
              minWidth: "50%",

              border: "1px solid rgba(5, 5, 5, 0.06)",
        }}>
          <div style={{
              padding: `${8}px ${14}px`,
              backgroundColor: "rgba(0, 0, 0, 0.02)",
              borderBottom: "1px solid rgba(5, 5, 5, 0.06)",
            }}
          >
            <Typography.Text>FIRMA Y SELLO</Typography.Text>
          </div>
          <div style={{
            height: "100%",
          }}>
            
          </div>

        </Flex> 
        
        
      </Flex>
    </Flex>
  );
};

export default GrossIncomeInvoiceSettlement;