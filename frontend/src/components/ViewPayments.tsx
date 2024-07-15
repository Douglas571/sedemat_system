import React, { useState, useEffect } from 'react';
import type { PopconfirmProps } from 'antd';
import { Table, Button, Space, message, Popconfirm, Select } from 'antd';
import axios from 'axios';

import { CheckCircleFilled, CloseCircleFilled, DeleteFilled } from '@ant-design/icons';


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
  isVerified: boolean,
  liquidationDate?: Date
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
        const mappedData = payments.map(payment => {
          const newPayment = {
            key: payment.id.toString(),
            amount: payment.amount,
            reference: payment.reference,
            dni: payment.dni,
            account: payment.account,
            paymentDate: payment.paymentDate,
            businessName: payment.business_name,
            image: payment.image,
            isVerified: payment.isVerified,
            status: '',
          }

          if (payment.isVerified) {
            newPayment.status = "Verificado"
          } else {
            newPayment.status = "Recibido"
          }

          if (payment.liquidationDate) {
            newPayment.status = "Liquidado"
          }

          console.log({newPayment})

          return newPayment
        });
        setDataSource(mappedData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    useEffect(() => {  
      fetchPayments();
    }, []);


    async function sendUpdateVerifiedStatus(paymentId: string, isVerified: boolean) {
      const url = `${HOST}/v1/payments/${paymentId}`;
  
      try {
          const response = await fetch(url, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({isVerified})
          });
  
          if (response.ok) {
              const result = await response.json();
              console.log('Payment status updated successfully:', result);
          } else {
              const error = await response.json();
              console.error('Failed to update payment status:', error);
          }
      } catch (error) {
          console.error('Error making request:', error);
      }
  }


    async function updateVerifiedStatus(id: string, isVerified: boolean){
      try {
        await sendUpdateVerifiedStatus(id, isVerified)

        fetchPayments()
      } catch (error) {
        console.log({error})
      }
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
        title: 'Razón Social',
        dataIndex: 'businessName',
        key: 'businessName',
      },
      {
        title: 'Rif o Cédula',
        dataIndex: 'dni',
        key: 'dni',
      },
      {
        title: 'Referencia',
        dataIndex: 'reference',
        key: 'reference',
      },
      {
        title: 'Monto',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Cuenta Destino',
        dataIndex: 'account',
        key: 'account',
      },
      {
        title: 'Fecha de Pago',
        dataIndex: 'paymentDate',
        key: 'paymentDate',
      },
      {
        title: 'Estado',
        dataIndex: 'status',
        key: 'status'
      },
      {
        title: 'Acciones',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            
            <Button 
              onClick={() => updateVerifiedStatus(record.key, !record.isVerified)}  
              shape="circle"
            >{record.isVerified ? <CloseCircleFilled /> : <CheckCircleFilled />}</Button>

            <Popconfirm
              title="Eliminar Pago"
              description="¿Estás seguro de que deseas eliminar el pago?"
              onConfirm={() => { 
                console.log("the payment will be deleted")
                deletePayment(record.key) }}
              //onCancel={cancel}
              okText="Si"
              cancelText="No"
            >
              <Button danger shape="circle"><DeleteFilled /></Button>
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