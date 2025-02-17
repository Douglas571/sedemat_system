import zamoraFlagUrl from '/images/zamora_flag.png'


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import { Card, Typography, Table, Descriptions, List, Flex, Watermark} from 'antd';
const { Title, Text } = Typography;

import dayjs_es from 'dayjs/locale/es';
import dayjs from 'dayjs';
import _ from 'lodash';

dayjs.locale(dayjs_es);

import { Business, IGrossIncomeInvoice, IGrossIncome, CurrencyExchangeRate } from '../../util/types';
import * as grossIncomeApi from '../../util/grossIncomeApi'
import * as api from '../../util/api'
import * as util from '../../util'
import GrossIncomesInvoiceService from 'services/GrossIncomesInvoiceService';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';
import useAuthentication from 'hooks/useAuthentication';
import { CurrencyHandler,formatBolivares, formatPercents } from 'util/currency';
import { format } from 'util';

const NOTES_COLUMN_WIDTH = 30

const GrossIncomeInvoiceDetails: React.FC = () => {

    // load business and gross income invoice id 
    const { businessId, grossIncomeInvoiceId } = useParams()
    // console.log({businessId, grossIncomeInvoiceId})

    const { userAuth } = useAuthentication()
    // console.log({userAuth})

	const [business, setBusiness] = useState<Business>()
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>()
    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()

    const hasBranchOffice = grossIncomes?.every(gi => gi.branchOfficeId) ?? false

    const createdByUser = grossIncomeInvoice?.createdByUser
    const createdByPerson = createdByUser?.person
    console.log({grossIncomeInvoice})

    const createdAt = dayjs(grossIncomeInvoice?.createdAt)
    const updatedAt = dayjs(grossIncomeInvoice?.updatedAt)
    const issuedAt = !grossIncomeInvoice?.issuedAt ? null : dayjs(grossIncomeInvoice?.issuedAt)

    let TCMMVBCV = grossIncomeInvoice?.TCMMVBCV ?? 1

    // TOTALS CALCULATION 

    const formPriceBs = grossIncomeInvoice?.formPriceBs ?? 0
    const branchOfficeMinTaxMMVBCV = util.getWasteCollectionTaxInMMV(grossIncomeInvoice?.branchOfficeDimensions)

    let totalBeforePenalties = grossIncomeInvoice?.grossIncomes.reduce((total, grossIncome) => CurrencyHandler(total).add(grossIncome.totalTaxInBs).value, 0) ?? 0

    totalBeforePenalties = CurrencyHandler(totalBeforePenalties).add(grossIncomeInvoice?.formPriceBs).value

    let TOTAL_IN_BS = grossIncomeInvoice?.penalties.reduce((total, penalty) =>{ 
        let penaltyTotal = CurrencyHandler(penalty.amountMMVBCV).multiply(TCMMVBCV).value
        return CurrencyHandler(total).add(penaltyTotal).value
    }, totalBeforePenalties)
    let TOTAL_IN_MMV = CurrencyHandler(TOTAL_IN_BS).divide(TCMMVBCV).value


    const getWeekRange = (date: Date) => {
        // being aware that Monday is the start of the week 
        const start = dayjs(date).startOf('week').add(1, 'day');
        const end = dayjs(date).endOf('week').subtract(1, 'day');

        console.log({start: String(start), end: String(end)})
        return {start, end};
    }

    // const branchOfficeDimensions = grossIncomes ? grossIncomes.branchOffices[0].dimensions : 0;
    // console.log({branchOfficeDimensions})

    const loadLastCurrencyExchangeRate = async (): Promise<CurrencyExchangeRate> => {
        const lastCurrencyExchangeRate = await CurrencyExchangeRatesService.getLastOne()
        console.log({lastCurrencyExchangeRate})

        return lastCurrencyExchangeRate
    }

    const loadBusiness = async (): Promise<Business> => {
        return api.fetchBusinessById(Number(businessId))
    }

    const loadGrossIncomeInvoice = async (): Promise<IGrossIncomeInvoice> => {
        return GrossIncomesInvoiceService.getById(Number(grossIncomeInvoiceId))
    }

    const loadGrossIncomes = async (grossIncomeInvoiceId: number): Promise<IGrossIncome[]> => {
        const fetchedGIs = await grossIncomeApi.getAllGrossIncomesByInvoiceId(grossIncomeInvoiceId)
        return fetchedGIs.sort((a, b) => new dayjs(a.period) - new dayjs(b.period))
    }

    const loadData = async () => {
        console.log("here")

        const fetchedLastCurrencyExchangeRate = await loadLastCurrencyExchangeRate()
        // load the business
        const fetchedBusiness = await loadBusiness()
        // load the invoice 
        const fetchedInvoice = await loadGrossIncomeInvoice()
        // load gross incomes 
        const fetchedGrossIncomes = await loadGrossIncomes(Number(grossIncomeInvoiceId))

        
        // console.log(JSON.stringify({fetchedBusiness, fetchedGrossIncomes, fetchedInvoice}, null, 2))
        setLastCurrencyExchangeRate(fetchedLastCurrencyExchangeRate)
        setBusiness(fetchedBusiness)
        setGrossIncomeInvoice(fetchedInvoice)
        setGrossIncomes(fetchedInvoice.grossIncomes.sort((a, b) => {
          if (dayjs(a.period).isBefore(dayjs(b.period))) {
            return -1
          } else {
            return 1
          }
        }))
        
        let branchOfficeName = fetchedInvoice?.branchOfficeName

        document.title = `Calculo - ${dayjs().format("MMMM YYYY")} - ${fetchedInvoice.businessName} ${branchOfficeName && "(" + branchOfficeName + ")"}`.toUpperCase()
    }

    useEffect(() => {
        loadData()
    }, [])

    if (!business || !grossIncomeInvoice?.id) {
        console.log("here")
        console.log({business, grossIncomeInvoice})
        return <Flex align="center" justify="center">Cargando...</Flex>
    }

    return (
      <Watermark content={grossIncomeInvoice?.settlement?.id ? "LIQUIDADO": ''} gap={[150, 150]} font={{ color: 'rgba(255, 102, 102, 0.7)', fontSize: 50}}>
        <Flex vertical
          className='printable'
        >

            <Flex align='center' justify='space-between' gap={10}>
                <Flex align="center">
                  <img src={"/images/zamora_flag.png"} width={100} alt="Zamora Flag" />
                  <img src={"/images/zamora_shield.png"} width={100} alt="Zamora Shield" />
                </Flex>
                <Flex 
                  vertical
                  style={{
                    flex: 2, 
                    alignContent: 'center',
                    textAlign: 'center',
                    fontFamily: "Arial"
                  }}
                >
                    <p>REPÚBLICA BOLIVARIANA DE VENEZUELA</p>
                    <p>ALCALDIA DEL MUNICIPIO ZAMORA ESTADO FALCÓN</p>
                    <p>SERVICIO DESCONCENTRADO DE ADMINISTRACIÓN TRIBUTARIA</p>
                </Flex>
                <Flex>
                  <img src={"/images/sedemat_logo.png"} width={100} alt="SEDEMAT Shield" />
                </Flex>
            </Flex>
            <Flex justify='right' vertical={true} align='end'>
                <p>PUERTO CUMAREBO</p>
                {/* <p>{`Fecha de Creación, ${createdAt.format('DD [de] MMMM [del] YYYY')}`.toUpperCase()}</p> */}
                <p>{`Fecha de Emisión, ${ !issuedAt ? updatedAt.format('DD [de] MMMM [del] YYYY') : issuedAt.format('DD [de] MMMM [del] YYYY')}`.toUpperCase()}</p>
            </Flex>

            <Title level={5} style={{ textAlign: 'center' }}>DESCRIPCIÓN DEL CONTRIBUYENTE</Title>

            <table>
              <thead>
                <tr style={{ background: 'lightgray' }}>
                  <th>CONTRIBUYENTE</th>

                  {
                    hasBranchOffice && (
                      <th>SEDE</th>
                    )
                  }

                  <th>RIF</th>
                  <th style={{ width: 50 }}>N°</th>
                  <th>RAMO</th>

                  {
                    hasBranchOffice && (
                      <>
                        <th style={{ width: 40 }}>MTS<sup>2</sup></th>
                        <th style={{ width: 40 }}>TIPO</th>
                      </>
                    )
                  }

                  
                </tr>
              </thead>
              <tbody>
                <tr >
                  <td>{grossIncomeInvoice.businessName.toUpperCase()}</td>
                  {
                    hasBranchOffice && (
                      <td>{grossIncomeInvoice.branchOfficeName.toUpperCase()}</td>
                    )
                  }
                  <td>{grossIncomeInvoice.businessDNI.toUpperCase()}</td>
                  <td>{grossIncomeInvoice?.economicActivityCode ?? business.economicActivity.code}</td>
                  <td>{grossIncomeInvoice?.economicActivityTitle ?? business.economicActivity.title.toUpperCase()}</td>

                  {
                    hasBranchOffice && (
                      <>
                        <td>{grossIncomeInvoice.branchOfficeDimensions}</td>
                        <td>{grossIncomeInvoice.branchOfficeType.toUpperCase()}</td>
                      </>
                    )
                  }
                  
                </tr>
              </tbody>
            </table>

            <br/>

            <Title level={5} style={{ textAlign: 'center' }}>ESTADO DE CUENTA</Title>

            <div style={{ border: '1px solid black', padding: 4, textAlign: 'center', borderBottom: 'none'  }}>
                <p>{`Tasa de cambio de la Moneda de Mayor Valor del Banco Central de Venezuela (TCMMV-BCV) = ${formatBolivares(grossIncomeInvoice.TCMMVBCV)} desde el día ${dayjs(grossIncomeInvoice?.TCMMVBCVValidSince).format('DD/MM/YYYY')} hasta el ${dayjs(grossIncomeInvoice?.TCMMVBCVValidUntil).format('DD/MM/YYYY')}.`.toUpperCase()}</p>
            </div>

            <table>
              <thead>
                <th>PERIODO</th>
                <th>INGRESOS</th>
                <th>ALICUOTA</th>
                <th>IMPUESTO</th>
                <th>MIN. TRIB</th>
                <th>ASEO</th>
                <th>SUBTOTAL</th>
              </thead>

              <tbody>
                { grossIncomeInvoice.grossIncomes && grossIncomeInvoice.grossIncomes.map( grossIncome => {

                  return (<tr>
                    <td>{_.upperFirst(dayjs(grossIncome.period).format('MMM-YY')).toUpperCase()}</td>

                    <td>{grossIncome?.supportFiles?.length > 0 ? CurrencyHandler(grossIncome.amountBs).format() : '--'}</td>

                    <td>{formatPercents(grossIncome.alicuotaTaxPercent)}</td>

                    <td>{CurrencyHandler(grossIncome.taxInBs).format()}</td>

                    <td>{
                      
                        grossIncome.minTaxInBs >= grossIncome.taxInBs
                        ? CurrencyHandler(grossIncome.minTaxInBs).format()
                        : '--'
                      }</td>

                    <td>{ grossIncome.chargeWasteCollection ? CurrencyHandler(grossIncome.wasteCollectionTaxInBs).format() : '--'}</td>

                    <td>{CurrencyHandler(grossIncome.totalTaxInBs).format()}</td>
                  </tr>)
                })}

                
                <tr>
                  <td colSpan={6} style={{ textAlign: 'left', paddingLeft: 20 }}>FORMULARIO</td>
                  <td>{CurrencyHandler(grossIncomeInvoice.formPriceBs).format()}</td>
                </tr>

                {
                  grossIncomeInvoice.penalties.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'right', paddingRight: 20 }} >SUBTOTAL EN BS.</td>
                        <td style={{ fontSize: 25 }}><strong>{CurrencyHandler(totalBeforePenalties).format()}</strong></td>
                      </tr>
                      {grossIncomeInvoice.penalties.map(penalty => {
                        return (<tr>
                          <td colSpan={6} style={{ textAlign: 'left', paddingLeft: 20 }}>MULTA {penalty.penaltyType.name.toUpperCase()} ({CurrencyHandler(penalty.amountMMVBCV).format()} TCMMV-BDV x {CurrencyHandler(grossIncomeInvoice?.TCMMVBCV ?? 0).format()} BS.)</td>
                          <td>{CurrencyHandler(penalty.amountMMVBCV).multiply(grossIncomeInvoice.TCMMVBCV).format()}</td>
                        </tr>)
                      })}
                    </>
                  )
                }

                <tr>
                  <td colSpan={6} style={{ textAlign: 'right', paddingRight: 20 }}>TOTAL A PAGAR EN BS.</td>
                  <td style={{ fontSize: 25 }}><strong>{CurrencyHandler(TOTAL_IN_BS).format()}</strong></td>
                </tr>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'right', paddingRight: 20 }}>TOTAL A PAGAR EN TCMMV-BCV</td>
                  <td style={{ fontSize: 25 }}><strong>{CurrencyHandler(TOTAL_IN_MMV).format()}</strong></td>
                </tr>
              </tbody>
            </table>


            <br/>

            <table>
              <tbody>
                <tr>
                  <th>MÍNIMO TRIBUTABLE</th>
                  <td style={{ textAlign: 'left', paddingLeft: 20 }}>TCMMV-BCV ({formatBolivares(grossIncomeInvoice.TCMMVBCV)}) TASA DEL DÍA x15</td>
                  <td style={{ width: "50%", textAlign: "left", paddingLeft: 20 }}>{formatBolivares(CurrencyHandler(15).multiply(grossIncomeInvoice.TCMMVBCV).value)}</td>
                </tr>
                <tr>
                  <th>RECOLECCIÓN DE ASEO</th>
                  <td style={{ textAlign: 'left', paddingLeft: 20 }}>TCMMV-BCV ({formatBolivares(grossIncomeInvoice.TCMMVBCV)}) TASA DEL DÍA x{branchOfficeMinTaxMMVBCV}</td>
                  <td style={{ width: "50%", textAlign: "left", paddingLeft: 20 }}>
                    {formatBolivares(CurrencyHandler(branchOfficeMinTaxMMVBCV).multiply(grossIncomeInvoice.TCMMVBCV).value)}
                  </td>
                </tr>
              </tbody>
            </table>


            <table>
              <thead>
                <th></th>
                <th>NOMBRE</th>
                <th>FIRMA</th>
                <th>SELLO</th>
              </thead>
              <tbody>
                <tr>
                  <th style={{ padding: 10}} scope="row">CREADO POR</th>
                  <td>{grossIncomeInvoice.createdByUserPersonFullName.toUpperCase() ?? ''}</td>
                  <td></td>
                  <td rowSpan={5}></td>
                </tr>
                <tr>
                  <th style={{ padding: 10}} scope="row">REVISADO POR</th>
                  <td>{grossIncomeInvoice.checkedByUserPersonFullName.toUpperCase() ?? ''}</td>
                  <td></td>
                  
                </tr>
                <tr>
                  <th colSpan={3}><strong>DATOS PARA EL DEPOSITO Y/O TRANSFERENCIA A NOMBRE DEL SEDEMAT G-20012768-6</strong></th>
                </tr>

                {
                  (!grossIncomeInvoice.firstBankAccountId || !grossIncomeInvoice.secondBankAccountId) ? (
                    // in case that there is no bank accounts
                    <>
                      <tr>
                        <td colSpan={3}>BANCO BICENTENARIO - CUENTA CORRIENTE - N° 0175-0162-3100-7494-9290</td>
                      </tr>
                      <tr>
                        <td colSpan={3}>BANCO DE VENEZUELA - CUENTA CORRIENTE - N° 0102-0339-2500-0107-1892</td>
                      </tr>
                  </>
                  )
                  : (
                    <>
                      <tr>
                        <td colSpan={3}>{grossIncomeInvoice.firstBankAccount.name.toUpperCase()} - {grossIncomeInvoice.firstBankAccount.isSavingAccount ? 'CUENTA AHORROS' : 'CUENTA CORRIENTE'} - N° {grossIncomeInvoice.firstBankAccount.accountNumber}</td>
                      </tr>
                      <tr>
                        <td colSpan={3}>{grossIncomeInvoice.secondBankAccount.name.toUpperCase()} - {grossIncomeInvoice.secondBankAccount.isSavingAccount ? 'CUENTA AHORROS' : 'CUENTA CORRIENTE'} - N° {grossIncomeInvoice.secondBankAccount.accountNumber}</td>
                      </tr>
                  </>
                  )
                }
                
              </tbody>
            </table>

            { /* the NOTES table */ }
            <table>
              <tbody>
                { grossIncomeInvoice?.note?.split('\n').map((line, index) => (
                  <tr key={index}>
                    <th style={{width: NOTES_COLUMN_WIDTH}}>NOTA</th>
                    <td colSpan={2}>{line.toUpperCase()}</td>
                  </tr>
                ))
                }

                {grossIncomeInvoice.penalties.length > 0 && (
                  <>
                    {grossIncomeInvoice.penalties.map(penalty => {
                      return (<tr>
                        <th style={{width: NOTES_COLUMN_WIDTH}}>NOTA</th>
                        <td colSpan={2}>{penalty.description.toUpperCase()}</td>
                      </tr>)
                    })}
                  </>
                )}

              
                {(() => {
                  // TODO: Study more in deep this fragment of code
                  if (!grossIncomes) return null;

                  // Step 1: Group by year and collect missing months
                  const missingDeclarations = grossIncomes
                    .filter(grossIncome => !grossIncome?.supportFiles?.length)
                    .reduce((acc, grossIncome) => {
                      const year = dayjs(grossIncome.period).format('YYYY');
                      const month = dayjs(grossIncome.period).format('MMMM');
                      
                      if (!acc[year]) {
                        acc[year] = [];
                      }
                      acc[year].push(month);
                      return acc;
                    }, {});

                  // Step 2: Sort the years and months
                  const sortedYears = Object.keys(missingDeclarations).sort((a, b) => a - b);
                  
                  sortedYears.forEach(year => {
                    missingDeclarations[year] = missingDeclarations[year].sort((a, b) => dayjs(a, 'MMMM').month() - dayjs(b, 'MMMM').month());
                  });

                  // Step 3: Render
                  return sortedYears.map(year => (
                    <tr key={year}>
                      <th style={{ width: NOTES_COLUMN_WIDTH }}>NOTA</th>
                      <td colSpan={2}>
                        FALTA DECLARACIONES DEL AÑO {year}: {missingDeclarations[year].join(', ').toUpperCase()}
                      </td>
                    </tr>
                  ));
                })()}
                
              </tbody>
            
            </table>

        </Flex>
    </Watermark>
  );
};

export default GrossIncomeInvoiceDetails;
