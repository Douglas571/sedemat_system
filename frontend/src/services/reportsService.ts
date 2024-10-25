import axios from 'axios';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

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
