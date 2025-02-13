import axios from 'axios';

const IP = import.meta.env.VITE_BACKEND_IP || "localhost"
const PORT = import.meta.env.VITE_BACKEND_PORT || "3000"
const HOST = "http://" + IP + ":" + PORT

import downloadFile from 'js-file-download'
import dayjs from 'dayjs'

export async function getBusinessesGrossIncomeStatusReport({token}: {token: string}) {
  try {
    
    let response = await axios.get(`${HOST}/v1/reports/businesses/gross-incomes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      params: {
        format: 'json'
      }
    })
  
    let data = await response.data
  
    return data
  } catch (error) {
    console.error({error})
  }
}

export async function downloadBusinessesGrossIncomeStatusReport({token}: {token: string}) {
  try {
    
    let response = await axios.get(`${HOST}/v1/reports/businesses/gross-incomes`, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      params: {
        format: 'excel'
      }
    })
  
    let data = await response.data

    downloadFile(data, `reporte-ingresos-brutos-${dayjs().format('DD-MM-YYYY')}.xlsx`)
  
    return data
  } catch (error) {
    console.error({error})
  }
}

export async function downloadBusinessesGrossIncomeSummary({
  token,
  year,
  month
}: {
  token: string,
  year: number,
  month: number
}) {
  try {
    
    let response = await axios.get(`${HOST}/v1/reports/businesses/gross-incomes/summary`, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      params: {
        format: 'excel',
        year, 
        month
      }
    })
  
    let data = await response.data

    downloadFile(data, `reusmen-de-declaraciones-de-iva-${dayjs().format('DD-MM-YYYY')}.xlsx`)
  
    return data
  } catch (error) {
    console.error({error})
  }
}

export async function downloadSettlementsReport({
  filters,
  token,
  format
}: {
  filters: {
    startAt: string,
    endAt: string,
  },
  token: string,
  format: 'excel' | 'json'
}): Promise<any> {
  try {
    
    let response = await axios.get(`${HOST}/v1/reports/settlements`, {
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      params: {
        format: 'excel',
        ...filters
      },
    })

    let data = await response.data 
    downloadFile(data, `reporte-liquidaciones-${dayjs().format('DD-MM-YYYY')}.xlsx`)
    
  } catch (error) {
    console.error({error})
  }
  
}