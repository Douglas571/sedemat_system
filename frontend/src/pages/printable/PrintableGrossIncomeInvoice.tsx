import zamoraFlagUrl from '/images/zamora_flag.png'


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import { Card, Typography, Table, Descriptions, List, Flex} from 'antd';
const { Title, Text } = Typography;

import dayjs_es from 'dayjs/locale/es';
import dayjs from 'dayjs';
import _ from 'lodash';

dayjs.locale(dayjs_es);

import { Business } from 'util/types';
import { IGrossIncomeInvoice, IGrossIncome, CurrencyExchangeRate } from '../util/types';
import * as grossIncomeApi from '../../util/grossIncomeApi'
import * as api from '../../util/api'
import * as util from '../../util'
import GrossIncomesInvoiceService from 'services/GrossIncomesInvoiceService';
import CurrencyExchangeRatesService from 'services/CurrencyExchangeRatesService';
import useAuthentication from 'hooks/useAuthentication';
import { CurrencyHandler,formatBolivares, formatPercents } from 'util/currency';

const GrossIncomeInvoiceDetails: React.FC = () => {

    // load business and gross income invoice id 
    const { businessId, grossIncomeInvoiceId } = useParams()
    console.log({businessId, grossIncomeInvoiceId})

    const { userAuth } = useAuthentication()
    console.log({userAuth})

	const [business, setBusiness] = useState<Business>()
    const [grossIncomeInvoice, setGrossIncomeInvoice] = useState<IGrossIncomeInvoice>()
    const [grossIncomes, setGrossIncomes] = useState<IGrossIncome[]>()
    const [lastCurrencyExchangeRate, setLastCurrencyExchangeRate] = useState<CurrencyExchangeRate>()

    const hasBranchOffice = grossIncomes?.every(gi => gi.branchOfficeId) ?? false

    const createdByUser = grossIncomeInvoice?.createdByUser
    const createdByPerson = createdByUser?.person
    console.log({grossIncomeInvoice})

    const updatedAt = dayjs(grossIncomeInvoice?.updatedAt)

    let TCMMVBCV = grossIncomeInvoice?.TCMMVBCV ?? 1

    // TOTALS CALCULATION 

    const formPriceBs = grossIncomeInvoice?.formPriceBs ?? 0

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
        setGrossIncomes(fetchedGrossIncomes)
        
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
        <Flex vertical
          className='printable'
        >

            <Flex align='center' justify='center' gap={10}>
                <img src={"/images/zamora_flag.png"} width={100} alt="Zamora Flag" />
                <img src={"/images/zamora_shield.png"} width={100} alt="Zamora Shield" />
                <Flex style={{maxWidth: "350px", textAlign: 'center', fontFamily: "Arial"}}>
                    REPÚBLICA BOLIVARIANA DE VENEZUELA<br/>
                    ALCALDIA DEL MUNICIPIO ZAMORA ESTADO FALCÓN
                </Flex>
                <img src={"/images/sedemat_logo.png"} width={100} alt="SEDEMAT Shield" />
            </Flex>
            <Flex justify='right'>
                <Text>{`Puerto Cumarebo, ${updatedAt.format('DD [de] MMMM [del] YYYY')}`}</Text>
            </Flex>

            <Title level={5} style={{ textAlign: 'center' }}>Descripción del Contribuyente</Title>

            <table>
              <thead>
                <tr style={{ background: 'lightgray' }}>
                  <th>Contribuyente</th>

                  {
                    hasBranchOffice && (
                      <th>SUCURSAL</th>
                    )
                  }

                  <th>Rif</th>
                  <th>N°</th>
                  <th>Ramo</th>

                  {
                    hasBranchOffice && (
                      <>
                        <th>Mts2</th>
                        <th>Tipo</th>
                      </>
                    )
                  }

                  
                </tr>
              </thead>
              <tbody>
                <tr >
                  <td>{grossIncomeInvoice.businessName}</td>
                  {
                    hasBranchOffice && (
                      <td>{grossIncomeInvoice.branchOfficeName}</td>
                    )
                  }
                  <td>{grossIncomeInvoice.businessDNI}</td>
                  <td>{business.economicActivity.code}</td>
                  <td>{business.economicActivity.title}</td>

                  {
                    hasBranchOffice && (
                      <>
                        <td>{grossIncomeInvoice.branchOfficeDimensions}</td>
                        <td>{grossIncomeInvoice.branchOfficeType}</td>
                      </>
                    )
                  }
                  
                </tr>
              </tbody>
            </table>

            <Title level={5} style={{ textAlign: 'center' }}>Estado de Cuenta</Title>

            <div style={{ border: '1px solid black', padding: 4, textAlign: 'center', borderBottom: 'none'  }}>
                <p>Tasa de cambio de la Moneda de Mayor Valor del Banco Central de Venezuela (TCMMV-BCV) = {formatBolivares(grossIncomeInvoice.TCMMVBCV)} desde el día {dayjs(grossIncomeInvoice?.TCMMVBCVValidSince).format('DD/MM/YYYY')} hasta el {dayjs(grossIncomeInvoice?.TCMMVBCVValidUntil).format('DD/MM/YYYY')}.</p>
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
                { grossIncomes && grossIncomes.map( grossIncome => {
                  return (<tr>
                    <td>{_.upperFirst(dayjs(grossIncome.period).format('MMM-YY')).toUpperCase()}</td>
                    <td>{grossIncome.declarationImage ? CurrencyHandler(grossIncome.amountBs).format() : '--'}</td>
                    <td>{formatPercents(grossIncome.alicuotaTaxPercent)}</td>
                    <td>{CurrencyHandler(grossIncome.taxInBs).format()}</td>
                    <td>{CurrencyHandler(grossIncome.minTaxInBs).format()}</td>
                    <td>{CurrencyHandler(grossIncome.wasteCollectionTaxInBs).format()}</td>
                    <td>{CurrencyHandler(grossIncome.totalTaxInBs).format()}</td>
                  </tr>)
                })}

                
                <tr>
                  <td colSpan={6} style={{ textAlign: 'left', paddingLeft: 20 }}>Formulario</td>
                  <td>{CurrencyHandler(grossIncomeInvoice.formPriceBs).format()}</td>
                </tr>

                {
                  grossIncomeInvoice.penalties.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={6} >SUBTOTAL EN BS</td>
                        <td><strong>{CurrencyHandler(totalBeforePenalties).format()}</strong></td>
                      </tr>
                      {grossIncomeInvoice.penalties.map(penalty => {
                        return (<tr>
                          <td colSpan={6} style={{ textAlign: 'left', paddingLeft: 20 }}>Multa {penalty.penaltyType.name} ({CurrencyHandler(penalty.amountMMVBCV).format()} x {CurrencyHandler(grossIncomeInvoice?.TCMMVBCV ?? 0).format()})</td>
                          <td>{CurrencyHandler(penalty.amountMMVBCV).multiply(grossIncomeInvoice.TCMMVBCV).format()}</td>
                        </tr>)
                      })}
                    </>
                  )
                }

                <tr>
                  <td colSpan={6} style={{ textAlign: 'right', paddingRight: 20 }}>TOTAL A PAGAR EN BS</td>
                  <td><strong>{CurrencyHandler(TOTAL_IN_BS).format()}</strong></td>
                </tr>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'right', paddingRight: 20 }}>TOTAL A PAGAR EN TCMMV-BCV</td>
                  <td><strong>{CurrencyHandler(TOTAL_IN_MMV).format()}</strong></td>
                </tr>
              </tbody>
            </table>


            <br/>

            <table>
              <thead>
                <th></th>
                <th>Nombre</th>
                <th>Firma</th>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Creado por</th>
                  <td>{grossIncomeInvoice.createdByUserPersonFullName}</td>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row">Revisado por</th>
                  <td>{grossIncomeInvoice.checkedByUserPersonFullName}</td>
                  <td></td>
                  
                </tr>
                <tr>
                  <td colSpan={3}>DATOS PARA EL DEPOSITO Y/O TRANSFERENCIA A NOMBRE DEL SEDEMAT</td>
                </tr>

                {
                  (!grossIncomeInvoice.firstBankAccountId || !grossIncomeInvoice.secondBankAccountId) ? (
                    // in case that there is no bank accounts
                    <>
                      <tr>
                        <td colSpan={3}>BANCO BICENTENARIO - CUENTA CORRIENTE 0175-0162-3100-7494-9290</td>
                      </tr>
                      <tr>
                        <td colSpan={3}>BANCO DE VENEZUELA - CUENTA CORRIENTE 0102-0339-2500-0107-1892</td>
                      </tr>
                  </>
                  )
                  : (
                    <>
                      <tr>
                        <td colSpan={3}>{grossIncomeInvoice.firstBankAccount.name.toUpperCase()} - {grossIncomeInvoice.firstBankAccount.isSavingAccount ? 'CUENTA AHORROS' : 'CUENTA CORRIENTE'} N° {grossIncomeInvoice.firstBankAccount.accountNumber}</td>
                      </tr>
                      <tr>
                        <td colSpan={3}>{grossIncomeInvoice.secondBankAccount.name.toUpperCase()} - {grossIncomeInvoice.secondBankAccount.isSavingAccount ? 'CUENTA AHORROS' : 'CUENTA CORRIENTE'} N° {grossIncomeInvoice.secondBankAccount.accountNumber}</td>
                      </tr>
                  </>
                  )
                }
                
              </tbody>
            </table>

            <br/>

            { /* the NOTES table */ }
            <table>
              <tbody>
                { grossIncomeInvoice?.note?.split('\n').map((line, index) => (
                  <tr key={index}>
                    <td style={{width: 40}}>NOTA</td>
                    <td colSpan={2}>{line.toUpperCase()}</td>
                  </tr>
                ))
                }

                {grossIncomeInvoice.penalties.length > 0 && (
                  <>
                    {grossIncomeInvoice.penalties.map(penalty => {
                      return (<tr>
                        <td style={{width: 40}}>NOTA</td>
                        <td colSpan={2}>{penalty.description.toUpperCase()}</td>
                      </tr>)
                    })}
                  </>
                )}

                {grossIncomes?.filter(grossIncome => !grossIncome.declarationImage).map(grossIncome => {
                  return (<tr>
                    <td style={{width: 40}}>NOTA</td>
                    <td colSpan={2}>FALTA LA DECLARACIÓN DEL MES DE {dayjs(grossIncome.period).format('MMMM [DEL AÑO] YYYY').toUpperCase()}</td>
                  </tr>)
                })}
                
              </tbody>
            
            </table>

        </Flex>
    );
};

export default GrossIncomeInvoiceDetails;
