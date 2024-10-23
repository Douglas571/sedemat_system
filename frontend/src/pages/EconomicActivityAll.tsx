import React, { useState, useEffect, useMemo } from 'react';
import { Card, Flex, Button, Table, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { EconomicActivity, IAlicuota } from '../util/types';

import economicActivitiesService from '../services/EconomicActivitiesService';
import useAuthentication from '../hooks/useAuthentication';
import { percentHandler, formatPercents } from '../util/currency';

const EconomicActivitiesTable = () => {
    const navigate = useNavigate();
    const { userAuth } = useAuthentication();

    const [economicActivities, setEconomicActivities] = useState<Array<EconomicActivity>>([]);

    
    const handleDeleteEconomicActivity = async (economicActivityId: number) => {
        try {
            await economicActivitiesService.delete(economicActivityId, userAuth.token);
            // setEconomicActivities(economicActivities.filter(e => e.id !== economicActivityId));

            message.success('Actividad económica eliminada correctamente');

            loadData(); 
        } catch (error) {
            console.log({error});
            message.error((error as Error).message);
        }

        
    }

    const loadData = async () => {
        let fetchedEconomicActivities = await economicActivitiesService.findAll();
        setEconomicActivities(fetchedEconomicActivities);
    }

    useEffect(() => {
        loadData();
    }, []);

    const codeFilterSearch = useMemo(() => {
        let primary = {
            text: "Primario",
            value: '1',
            children: economicActivities.filter(e => e.code.startsWith("1.")).map(e => ({
                text: e.code,
                value: e.code
            }))
        }

        let secondary = {
            text: "Secundario",
            value: '2',
            children: economicActivities.filter(e => e.code.startsWith("2.")).map(e => ({
                text: e.code,
                value: e.code
            }))
        }

        let tertiary = {
            text: "Terciario",
            value: '3',
            children: economicActivities.filter(e => e.code.startsWith("3.")).map(e => ({
                text: e.code,
                value: e.code
            }))
        }

        return [primary, secondary, tertiary]
    }, [economicActivities]);

    const titleFilterSearch = useMemo(() => {
        return economicActivities.map(e => ({
            text: e.title,
            value: e.title
        }))
    }, [economicActivities]);

    const columns = [
        {
            title: 'Código',
            dataIndex: 'code',
            key: 'code',

            filters: codeFilterSearch,
            filterSearch: true,

            filterMode: 'tree',

            onFilter: (value: string, record: EconomicActivity) => {

                console.log({filterCodeValue: value})
                return record.code.toLowerCase().startsWith(value.toLowerCase());
            },

            showSorterTooltip: false,
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: 'Título',
            dataIndex: 'title',
            key: 'title',

            filters: titleFilterSearch,

            filterSearch: true,

            onFilter: (value: string, record: EconomicActivity) => {
                return record.title.toLowerCase().includes(value.toLowerCase());
            },

            showSorterTooltip: false,
            sorter: (a, b) => {
                console.log("sorting")
                return a.title.localeCompare(b.title)},
        },
        {
            title: 'Alicuota',
            dataIndex: 'currentAlicuota',
            key: 'alicuota',
            render(_: string, record: EconomicActivity) {
                return formatPercents(percentHandler(record.currentAlicuota?.taxPercent).value);
            },

            showSorterTooltip: false,
            sorter: (a, b) => a.currentAlicuota?.taxPercent - b.currentAlicuota?.taxPercent,
        },
        {
            title: 'Mínimo Tributario',
            dataIndex: 'currentAlicuota.minTaxMMV',
            key: 'minimumTax',
            render(_: string, record: EconomicActivity) {
                return `${record.currentAlicuota?.minTaxMMV ?? 0} MMV-BCV`;
            }
        },
        {
            title: 'Acciones',
            dataIndex: 'actions',
            key: 'actions',
            render: (_: string, record: EconomicActivity) => (
                <Flex gap={16} align="center">
                    <Button onClick={() => navigate(`/economic-activities/${record.id}/edit`)}>Editar</Button>
                    <Popconfirm
                        title="¿Estás seguro de eliminar ésta actividad económica?"
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
