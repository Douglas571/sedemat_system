import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Flex, Descriptions, DescriptionsProps, Table, TableProps } from 'antd';

const { Title } = Typography;

import { formatBolivares, CurrencyHandler } from 'util/currency';
import { IGrossIncomeInvoice, IGrossIncome, Business, CurrencyExchangeRate, Payment } from 'util/types';

import grossIncomeInvoiceService from 'services/GrossIncomesInvoiceService'
import * as paymentsApi from 'util/paymentsApi'
import * as grossIncomeService from 'util/grossIncomeApi'
import * as api from 'util/api'
import settlementService from 'services/SettlementService';
import { useParams } from 'react-router-dom';

import dayjs from 'dayjs';
import dayjs_es from 'dayjs/locale/es';

dayjs.locale(dayjs_es);

import _ from 'lodash';

import * as util from 'util'
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';


const MONTHS_NEEDED_TO_BE_A_BAD_DEBT = 1;
// is a bad debt is the current d
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
  // when months difference is greater than 1 (2, 3 4...) then it is a bad debt
  return monthsDifference > MONTHS_NEEDED_TO_BE_A_BAD_DEBT;
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

    let totalTaxes: number[] = badDebts.map( b => b.taxInBs > b.minTaxInBs ? b.taxInBs : b.minTaxInBs)

    console.log({badDebts, totalTaxes, MMVToBs, minTaxMMV})

  return totalTaxes.reduce((acc: number, curr: number) => CurrencyHandler(acc).add(curr).value, 0);
}

const getEconomicActivityTax = ({
  grossIncomes,
  paidAt,
}: {
  grossIncomes: IGrossIncome[],
  paidAt: Date | undefined,
}): number => {

  if (!grossIncomes || !paidAt) return 0;

    let badDebts = grossIncomes.filter(g => !isBadDebt({grossIncome: g, paidAt}))

    let totalTaxes = badDebts.map( b => util.getGrossIncomeTaxInBs({
      grossIncome: b
    }))


  return totalTaxes.reduce((acc: number, curr: number) => CurrencyHandler(acc).add(curr).value, 0);
}

const getWasteCollectionTax = (props: { grossIncomes: IGrossIncome[] }): number => {
  let {grossIncomes} = props

  if (!grossIncomes) return 0

  let tax = grossIncomes.map(g => g.wasteCollectionTaxInBs).reduce((acc: number, curr: number) => CurrencyHandler(acc).add(curr).value, 0)

  return tax 
}

const formatGrossIncomeDescription = (grossIncomes: IGrossIncome[]): string => {
  console.log("executing")
  const monthMap: { [key: number]: string[] } = {};

  if (grossIncomes.length === 0) return '';
  
  if (grossIncomes.length === 1) {
    const date = new Date(grossIncomes[0].period);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    const month2 = _.upperFirst(dayjs(date).format('MMMM'));

    return `impuesto sobre actividad economica correspondiente al mes de ${month2} del año ${year}`;
  }

  grossIncomes.forEach(g => {
    const date = new Date(g.period);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });

    const month2 = _.upperFirst(dayjs(date).format('MMMM'));

    if (!monthMap[year]) {
      monthMap[year] = [];
    }
    if (!monthMap[year].includes(month2)) {
      monthMap[year].push(month2);
    }
  });

  const formattedParts = Object.entries(monthMap).map(([year, months]) => {

    if (months.length === 1) {
      return `al mes de ${months[0]} del año ${year}`;
    }
    
    console.log({year, months})
    const lastMonth = months.pop();
    return `los meses de ${months.join(', ')}${months.length ? ' y ' : ''}${lastMonth} del año ${year}`;
  });

  return `Impuesto sobre actividad economica correspondiente a ${formattedParts.join(', así como ')}`;
}

const GrossIncomeInvoiceSettlement: React.FC = () => {
  const { businessId, grossIncomeInvoiceId } = useParams()

  const [business, setBusiness] = React.useState<Business>();
  const [grossIncomeInvoice, setGrossIncomeInvoice] = React.useState<IGrossIncomeInvoice>();
  const [grossIncomes, setGrossIncomes] = React.useState<IGrossIncome[]>([]);
  const [currencyExchangeRate, setCurrencyExchangeRate] = useState<CurrencyExchangeRate>()
  const [payments, setPayments] = useState<Payment[]>([])

  const paidAt = grossIncomeInvoice?.paidAt

  const MMVToBs = currencyExchangeRate ? util.getMMVExchangeRate(currencyExchangeRate) : 0

  const badDebtTax = getBadDebtTax({
    grossIncomes,
    paidAt: paidAt,
    MMVToBs: MMVToBs,
    minTaxMMV: business?.economicActivity?.minimumTax || 0,
    alicuota: business?.economicActivity?.alicuota || 0
  })

  const economicActivityTax = getEconomicActivityTax({
    grossIncomes,
    paidAt: paidAt,
    MMVToBs: MMVToBs,
    minTaxMMV: business?.economicActivity?.minimumTax || 0,
    alicuota: business?.economicActivity?.alicuota || 0
  })
  const wasteCollectionTax = getWasteCollectionTax({grossIncomes})
  const formTax = grossIncomeInvoice?.formPriceBs || 0

  const penaltiesTotalInMMVBCV = grossIncomeInvoice?.penalties?.reduce((acc: number, curr: Penalty) => CurrencyHandler(acc).add(curr.amountMMVBCV).value, 0)
  const penaltiesTotalInBs = CurrencyHandler(penaltiesTotalInMMVBCV).multiply(grossIncomeInvoice?.TCMMVBCV ?? 1).value

  let totalBs = CurrencyHandler(badDebtTax).add(economicActivityTax).add(wasteCollectionTax).add(penaltiesTotalInBs).add(formTax).value

  const REFERENCE_SEPARATOR = ' - '
  let references: string = useMemo(() => payments.reduce((acc: string, curr: Payment) => acc ? acc + REFERENCE_SEPARATOR + curr.reference : curr.reference, ''), [payments])

  const DATE_SEPARATOR = ' - '
  const paymentDate: string = useMemo(() => {

    if (payments.length === 0) return ''

    const paymentDates = payments.reduce((acc: dayjs.Dayjs[], curr: Payment) => {
      const currDate = dayjs(curr.paymentDate)
      return [
        ...acc,
        currDate,
      ]
    }, [] as dayjs.Dayjs[])

    const minDate = paymentDates.reduce((min: dayjs.Dayjs, curr: dayjs.Dayjs) => curr < min ? curr : min, paymentDates[0])
    const maxDate = paymentDates.reduce((max: dayjs.Dayjs, curr: dayjs.Dayjs) => curr > max ? curr : max, paymentDates[0])

    if (dayjs(maxDate).format('DD/MM/YYYY') === dayjs(minDate).format('DD/MM/YYYY')) {
      return dayjs(maxDate).format('DD/MM/YYYY')
    }

    return dayjs(minDate).format('DD/MM') + DATE_SEPARATOR + dayjs(maxDate).format('DD/MM/YYYY')
  }, [payments])

  const description = formatGrossIncomeDescription(grossIncomes)

  const bankNames = new Set(payments.map( p => p?.bank?.name ).filter( name => name !== undefined))
  let bankAccountNumbers = new Set(payments.map( p => p.bank?.accountNumber ).filter( num => num !== undefined))

  let displayBankName = ''
  let displayBankAccountNumber = ''

  const settledAt = dayjs(grossIncomeInvoice?.settlement?.settledAt)
  let settledAtDisplayDate = `${settledAt.format('DD')} de ${settledAt.format('MMMM')} de ${settledAt.format('YYYY')}`

  // create a set of names
  if (bankNames.size === 1) {
    displayBankName = bankNames.values().next().value ?? '';
  } else {
    displayBankName = 'Varios Bancos';
  }

  // create a set of numbers 
  if (bankAccountNumbers.size === 1) {
    displayBankAccountNumber = bankAccountNumbers.values().next().value ?? '';
  } else {
    displayBankAccountNumber = 'Varios Bancos';
  }

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
    // let currencyExchangeRate = await CurrencyExchangeRatesService.getById(cerId)
    // setCurrencyExchangeRate(currencyExchangeRate)

  }

  useEffect(() => {
    loadData()
  }, [])

  if (!business || !grossIncomeInvoice || !grossIncomes) {
    return <Flex><Typography.Text>Cargando...</Typography.Text></Flex>
  }

  let tableItems: {
    code: string;
    description: string;
    amountBs: string;
  }[] = []

  if (formTax > 0) {
    tableItems.push({
      code: '301090101',
      description: 'INGRESO POR FORMULARIOS Y GACETAS MUNICIPALES',
      amountBs: formatBolivares(formTax), // Assuming amount is not specified
    });
  }

  if (penaltiesTotalInBs > 0) {
    tableItems.push({
      code: '301110800',
      description: 'Multas Y Recargos'.toUpperCase(),
      amountBs: formatBolivares(penaltiesTotalInBs),
    })
  }

  if (wasteCollectionTax > 0) {
    tableItems.push({
      code: '301035400',
      description: 'ASEO DOMICILIARIO',
      amountBs: formatBolivares(wasteCollectionTax), // Assuming amount is not specified
    },);
  }

  if (economicActivityTax > 0) {
    tableItems.push({
      code: '301020700',
      description: 'PATENTE DE INDUSTRIA Y COMERCIO',
      amountBs: formatBolivares(economicActivityTax),
    });
  }

  if (badDebtTax > 0) {
    tableItems.push({
      code: '301021200',
      description: 'DEUDA MOROSA',
      amountBs: formatBolivares(badDebtTax),
    });
  }

  // reverse for styling purpose 
  tableItems = tableItems.reverse();

  return (
    <Flex className="printable" vertical style={{ width: '100%' }}>

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

      <Flex justify='right'><p data-testid="settlement-code">COMPROBANTE DE INGRESO <span className='bold'>N°{String(grossIncomeInvoice?.settlement.code).padStart(4, '0')}</span></p></Flex>
      <Flex justify='right'><p data-testid="settlement-date">PUERTO CUMAREBO; <span className='bold'>{settledAtDisplayDate.toUpperCase()}</span></p></Flex>

      <table>
        <tbody>
          <tr>
            <th style={{width: 50}}>RAZON SOCIAL</th>
            <td 
              data-testid="business-name"
              colSpan={2} style={{textAlign: "left", padding: 10, fontWeight: 'bold'}}
            >{grossIncomeInvoice.businessName.toUpperCase()} { grossIncomeInvoice.branchOfficeName && `(${grossIncomeInvoice.branchOfficeName})`.toUpperCase()}</td>
            <th style={{width: 40}}>RIF</th>
            <td data-testid="business-rif" style={{textAlign: "left", padding: 10, fontWeight: 'bold'}}>{grossIncomeInvoice.businessDNI.toUpperCase()}</td>
          </tr>
          <tr>
            <th>DESCRIPCIÓN DEL PAGO</th>
            <td 
              colSpan={4} 
              style={{textAlign: "left", padding: 10}}
              data-testid="description"
            >
              <strong>PAGO POR: </strong> {description.toUpperCase()}
            </td>
          </tr>
          <tr>
            <th>
              MONTO
            </th>
            <td 
              style={{textAlign: "left", padding: 10}}
              className='bold'
            >{formatBolivares(totalBs)}</td>
            <td 
              data-testid="amount-in-letters"           
              colSpan={3} 
              style={{textAlign: "left", padding: 10}}
            >
              {util.numbersToWords(totalBs).toUpperCase()}
            </td>
          </tr>
        </tbody>
      </table>

      <br/>

      <table>
        <thead>
          <tr>
            <th style={{width: 40}}>CÓDIGO</th>
            <th>DESCRIPCIÓN</th>
            <th style={{width: 40}}>IMPORTE</th>
          </tr>
        </thead>

        <tbody>
          {
            tableItems.map((item, index) => (
              <tr key={index}>
                <td>{item.code}</td>
                <td style={{textAlign: "left", paddingLeft: 10}}>{item.description}</td>
                <td data-testid={`settlement-item-amount-bs-${item.code}`}>{item.amountBs}</td>
              </tr>
            ))
          }

        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} style={{textAlign: "right", padding: 10}}>TOTAL</td>
            <td data-testid="total-bs"><span className='bold'>{formatBolivares(totalBs)}</span></td>
          </tr>
        </tfoot>
      </table>

      <br/>
      
      <table>
        <tbody>
          <tr>
            <th>BANCO</th>
            <td data-testid="bank-name">{displayBankName.toUpperCase()}</td>
            <th>FIRMA Y SELLO</th>
          </tr>
          <tr>
            <th>CUENTA</th>
            <td data-testid="bank-account-number">{displayBankAccountNumber}</td>
            <td rowSpan={5}></td>
          </tr>
          <tr>
            <th>BENEFICIARIO</th>
            <td data-testid="beneficiary">SEDEMAT</td>
          </tr>
          <tr>
            <th>FECHA</th>
            <td data-testid="payment-date">{paymentDate}</td>
          </tr>
          <tr>
            <th>REFERENCIA</th>
            <td data-testid="references">{references}</td>
          </tr>
          <tr>
            <th>LIQUIDADOR</th>
            <td data-testid="settled-by-user-person-full-name">{grossIncomeInvoice.settlement?.settledByUserPersonFullName.toUpperCase()}</td>
          </tr>
        </tbody>
      </table>
    </Flex>
  );
};

export default GrossIncomeInvoiceSettlement;

