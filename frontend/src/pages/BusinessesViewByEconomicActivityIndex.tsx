import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Badge, Dropdown, Space, Table, Collapse, Typography, Tree, Card} from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';

import { Link } from 'react-router-dom';

import { getBusinessEconomicActivityIndex } from '../util/businessesApi'
import useAuthentication from 'hooks/useAuthentication';


const data = {
  "sectors": [
    {
      code: "1",
      title: "Primario",
      "economicActivities": [{
        "code": "1.01",
        "title": "Fabricación de productos textiles",
        "businesses": [
          { "id": 1, "dni": "J-12345678-9", "businessName": "Fábrica Textil Caracas" },
          { "id": 2, "dni": "J-98765432-1", "businessName": "Tejidos Lara" }
        ]
      },
      {
        "code": "1.02",
        "title": "Producción de calzado",
        "businesses": [
          { "id": 3, "dni": "J-55555555-5", "businessName": "Zapatos Andinos" }
        ]
      },],
    },
    {
      "code": "2",
      "title": "Secundario",
      "economicActivities": [
        {
          "code": "2.1",
          "title": "Industria y/o manufactura",
          "economicActivities": [
            {
              "code": "2.1.01",
              "title": "Fabricación de productos textiles",
              "businesses": [
                { "id": 1, "dni": "J-12345678-9", "businessName": "Fábrica Textil Caracas" },
                { "id": 2, "dni": "J-98765432-1", "businessName": "Tejidos Lara" }
              ]
            },
            {
              "code": "2.1.02",
              "title": "Producción de calzado",
              "businesses": [
                { "id": 3, "dni": "J-55555555-5", "businessName": "Zapatos Andinos" }
              ]
            }
          ]
        },
        {
          "code": "2.2",
          "title": "Construcción",
          "economicActivities": [
            {
              "code": "2.2.01",
              "title": "Construcción de edificios",
              "businesses": [
                { "id": 4, "dni": "J-11223344-5", "businessName": "Edificios del Centro" }
              ]
            }
          ]
        },
        {
          "code": "2.3",
          "title": "Construcción y servicios a la industria petrolera, petroquímica y similares",
          "economicActivities": []
        }
      ]
    },
    {
      "code": "3",
      "title": "Terciario",
      "economicActivities": [
        {
          "code": "3.1",
          "title": "Comercio al por mayor",
          "economicActivities": [
            {
              "code": "3.1.02",
              "title": "Alimentos",
              "businesses": [
                { "id": 5, "dni": "J-11112222-3", "businessName": "Distribuidora de Alimentos C.A." }
              ]
            },
            {
              "code": "3.1.03",
              "title": "Bebidas alcohólicas y tabaco",
              "businesses": [
                { "id": 6, "dni": "J-99999999-0", "businessName": "Cavas y Licores Oriente" }
              ]
            }
          ]
        },
        {
          "code": "3.2",
          "title": "Comercio al detal",
          "economicActivities": [
            {
              "code": "3.2.01",
              "title": "Materias primas y similares",
              "businesses": []
            },
            {
              "code": "3.2.02",
              "title": "Alimentos",
              "businesses": [
                { "id": 7, "dni": "J-88888888-4", "businessName": "Supermercado Central" }
              ]
            }
          ]
        },
        {
          "code": "3.3",
          "title": "Servicios personales y no personales",
          "economicActivities": []
        },
        {
          "code": "3.4",
          "title": "Actividad no especificadas",
          "economicActivities": []
        }
      ]
    }
  ]
}
const BusinessesViewByEconomicActivityIndex: React.FC = () => {

  const [economicActivityIndex, setEconomicActivityIndex] = useState([])
  const { userAuth } = useAuthentication()

  const loadIndex = async () => {
    let index = await getBusinessEconomicActivityIndex(userAuth.token)

    console.log({index})
    setEconomicActivityIndex(index)
  }

  useEffect(() => {
    loadIndex()
  }, [])

  const mappedTreeData: TreeDataNode[] = economicActivityIndex?.map((sector) => {
    let formattedSector = {
      title: `${sector.code} - ${sector.title}`,
      value: sector.code,
      key: sector.code,

      children: sector.economicActivities.map((economicActivity) => {

        let children = []
        
        if (economicActivity.economicActivities) {
          children = economicActivity.economicActivities.map((activity) => {
            return {
              title: `${activity.code} - ${activity.title}`,
              value: activity.code,
              key: activity.code,
              children: activity?.businesses?.map((business) => {
                return {
                  title: <Link to={`/business/${business.id}`}>{business.businessName} - {business.dni} </Link>,
                  value: business.dni,
                  key: business.dni,
                }
              })
            }
          })
        } else {
          children = economicActivity.businesses.map((business) => {
            return {
              title: <Link to={`/business/${business.id}`}>{business.businessName} - {business.dni} </Link>,
              value: business.dni,
              key: business.dni,
            }
          })
        }

        return {
          title: `${economicActivity.code} - ${economicActivity.title}`,
          value: economicActivity.code,
          key: economicActivity.code,
          children: children
        }
      })
    }

    return formattedSector
  })

  return <Card>
    <Typography.Title level={3}>Indice de empresas por actividad economica</Typography.Title>
    <Tree
    
      treeData={mappedTreeData}
    />
  </Card>
}

export default BusinessesViewByEconomicActivityIndex;