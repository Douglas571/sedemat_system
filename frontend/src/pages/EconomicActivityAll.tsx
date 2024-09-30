import React, { useState, useEffect } from 'react';
import { Card, Flex, Button, Table, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { EconomicActivity } from '../util/types';

import economicActivitiesService from '../services/EconomicActivitiesService';
import useAuthentication from '../hooks/useAuthentication';

const EconomicActivitiesTable = () => {
    const navigate = useNavigate();
    const { userAuth } = useAuthentication();

    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);

    
    const handleDeleteEconomicActivity = async (economicActivityId: number) => {
        try {
            await economicActivitiesService.delete(economicActivityId, userAuth.token);
            setEconomicActivities(economicActivities.filter(e => e.id !== economicActivityId));
        } catch (error) {
            console.log({error});
            message.error('No se ha podido eliminar la actividad económica');
        }
    }

    const loadData = async () => {
        let fetchedEconomicActivities = await economicActivitiesService.findAll();
        setEconomicActivities(fetchedEconomicActivities);
    }

    useEffect(() => {
        loadData();
    }, []);

    const columns = [
        {
            title: 'Código',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Título',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Alicuota',
            dataIndex: 'alicuota',
            key: 'alicuota',
        },
        {
            title: 'Mínimo Tributario',
            dataIndex: 'minimumTax',
            key: 'minimumTax',
        },
        {
            title: 'Acciones',
            dataIndex: 'actions',
            key: 'actions',
            render: (_: string, record: EconomicActivity) => (
                <Flex gap={16} align="center">
                    <Button onClick={() => navigate(`/economic-activities/${record.id}/edit`)}>Editar</Button>
                    <Popconfirm
                        title="¿Estás seguro de eliminar esta actividad económica?"
                        onConfirm={() => handleDeleteEconomicActivity(record.id)}
                        okText="Sí"
                        cancelText="No"
                    >
                        <Button danger>Eliminar</Button>
                    </Popconfirm>
                    {/* <Button type="link" onClick={() => navigate(`/economic-activities/${record.id}`)}>Detalles</Button> */}
                </Flex>
            ),
        },
    ];

    const data = [
        {
            id: 1,
            code: '1234',
            title: 'Actividad 1',
            alicuota: 10.00,
            minimumTax: 100.00,
        },
        {
            id: 2,
            code: '5678',
            title: 'Actividad 2',
            alicuota: 20.00,
            minimumTax: 200.00,
        },
    ];

    return (
        <Card title={
            <Flex justify="space-between" align="center">
                <Typography.Title level={1}>Actividades Económicas</Typography.Title>
                <Button icon={<PlusOutlined />} onClick={() => navigate('/economic-activities/new')}>Agregar</Button>
            </Flex>
        }>
            <Table columns={columns} dataSource={economicActivities} />
        </Card>
    );
};

export default EconomicActivitiesTable;
