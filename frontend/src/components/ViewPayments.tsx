import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import axios from 'axios';

const IP = "node-app"
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
    let payments: Array<Payment> = [];
  
    try {
      const response = await axios.get(`${HOST}/v1/payments`);
      payments = response.data.data;
      console.log({data: response.data})
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message);
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
    }
  
    return payments;
  }

function ViewPayments(): JSX.Element {
    const [dataSource, setDataSource] = useState<Array<any>>([]);
  
    useEffect(() => {
      const fetchPayments = async () => {
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
  
    return <Table dataSource={dataSource} columns={columns} />;
  };

export default ViewPayments