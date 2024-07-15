import React, { useState, useEffect } from 'react';
import type { PopconfirmProps } from 'antd';
import { Table, Button, Space, message, Popconfirm, Select } from 'antd';
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
  businessName: string;
  image: string;
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
  const [messageApi, contextHolder] = message.useMessage()
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
          businessName: payment.business_name,
          image: payment.image
        }));
        setDataSource(mappedData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    useEffect(() => {  
      fetchPayments();
    }, []);

    function verify(id: string ){

    }

    function liquidate(id: string ){

    }

    function showBoucher(imageUrl: string) {
      window.open(`${HOST}/${imageUrl}`, '_blank', 'noopener,noreferrer');
    }

    async function sendRequestToDeletePayment(id){
      const url = `${HOST}/v1/payments/${id}`;

      console.log('deleting payment ' + id)

      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        if (response.ok) {
          console.log('Payment deleted successfully:', result);
        } else {
          console.log({result})
          throw Error('Error al eliminar el pago');
        }
      } catch (error) {
        console.error('Error:', error);

        throw error
      }
    }


    const deletePayment = async (id: string) => {
      try {
        // send the request
        await sendRequestToDeletePayment(id)

        // deleted successfully, reload payments
        fetchPayments()
      }
      catch(error) {
        // if it fail
        // show error

        messageApi.open({
          type: "error",
          content: error.message
        })
      }
    }
  
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
        title: 'Razón Social',
        dataIndex: 'businessName',
        key: 'businessName',
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
      {
        title: 'Acciones',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            
            <Select
              defaultValue="Recibido"
              style={{ width: 120 }}
              options={[
                { value: 'received', label: 'Recibido' },
                { value: 'liquidado', label: 'Verificado' },
                { value: 'verified', label: 'Liquidado' },
              ]}
            />
            
            <Popconfirm
              title="Eliminar Pago"
              description="¿Estás seguro de que deseas eliminar el pago?"
              onConfirm={() => { 
                console.log("the payment will be deleted")
                deletePayment(record.key) }}
              //onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Eliminar</Button>
            </Popconfirm>

            
            <Button onClick={() => showBoucher(record.image)}>Boucher</Button>
          </Space>
        ),
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