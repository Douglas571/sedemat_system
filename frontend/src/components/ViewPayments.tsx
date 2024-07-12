import React, { useState, useEffect } from 'react';
import { Table, Button } from 'antd';
import axios from 'axios';

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

interface Payment {
  id: number;
  amount: number;
  reference: string;
  dni: string;
  account: string;
  paymentDate: string;
}

async function getPayments(): Promise<Array<Payment>> {
  console.log({HOST})
  let payments: Array<Payment> = [];

  try {
    const response = await fetch(`${HOST}/v1/payments`);
    if (!response.ok) {
      throw new Error(`Error fetching payments: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('I got the data...');
    payments = data.data;
    console.log({ data });
  } catch (error) {
    console.log("I got an error...");
    console.error('Fetch error:', error);
    throw error;
  }

  return payments;
}

function ViewPayments(): JSX.Element {
    const [dataSource, setDataSource] = useState<Array<any>>([]);

    const fetchPayments = async () => {
      console.log("Cargando pagos...")
      try {
        const payments = await getPayments();
        const mappedData = payments.map(payment => ({
          key: payment.id.toString(),
          amount: payment.amount,
          reference: payment.reference,
          dni: payment.dni,
          account: payment.account,
          paymentDate: payment.paymentDate,
        }));
        setDataSource(mappedData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    useEffect(() => {  
      fetchPayments();
    }, []);
  
    const columns = [
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Reference',
        dataIndex: 'reference',
        key: 'reference',
      },
      {
        title: 'DNI',
        dataIndex: 'dni',
        key: 'dni',
      },
      {
        title: 'Account',
        dataIndex: 'account',
        key: 'account',
      },
      {
        title: 'Payment Date',
        dataIndex: 'paymentDate',
        key: 'paymentDate',
      },
    ];
  
    return (
      <div>
        <Button onClick={() => fetchPayments()}>
          Cargar pagos
        </Button>
        <Table dataSource={dataSource} columns={columns} />;
      </div>
    )
    
    
  };

export default ViewPayments