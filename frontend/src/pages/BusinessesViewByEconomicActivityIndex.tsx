import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Badge, Dropdown, Space, Table, Collapse, Typography, Tree, Card} from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';

import { Link } from 'react-router-dom';

import { getBusinessEconomicActivityIndex } from '../util/businessesApi'
import useAuthentication from 'hooks/useAuthentication';

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
            let children = []

            if (activity.economicActivities) {
              children = activity.economicActivities.map((subActivity) => {
                return {
                  title: `${subActivity.code} - ${subActivity.title}`,
                  value: subActivity.code,
                  key: subActivity.code,
                  children: subActivity?.businesses?.map((business) => {
                    return {
                      title: <Link to={`/business/${business.id}`}>{business.businessName} - {business.dni} </Link>,
                      value: business.dni,
                      key: business.dni,
                    }
                  })
                }
              })
            } else {
              children = activity?.businesses?.map((business) => {
                return {
                  title: <Link to={`/business/${business.id}`}>{business.businessName} - {business.dni} </Link>,
                  value: business.dni,
                  key: business.dni,
                }
              })
            }

            return {
              title: `${activity.code} - ${activity.title}`,
              value: activity.code,
              key: activity.code,
              children,
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