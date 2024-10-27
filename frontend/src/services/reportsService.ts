import axios from 'axios';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
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