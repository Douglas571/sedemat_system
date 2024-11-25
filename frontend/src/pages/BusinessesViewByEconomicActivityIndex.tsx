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

    let children = []
    let businessCount0 = 0

    children =sector.economicActivities.map((economicActivity) => {

      let children = []
      let businessCount1 = 0
      
      if (economicActivity.economicActivities) {
        children = economicActivity.economicActivities.map((activity) => {
          let children = []

          let businessCount2 = 0

          if (activity.economicActivities) {
            

            children = activity.economicActivities.map((subActivity) => {
              let businessCount3 = 0
              businessCount3 = subActivity?.businesses?.length

              businessCount2 += businessCount3
              
              // businessCount2 += businessCount3

              return {
                title: <Typography.Text style={{ fontWeight: businessCount3 > 0 ? 'bold' : 'normal'}}>{`${subActivity.code} - ${subActivity.title} (${businessCount3})`}</Typography.Text>,
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

            businessCount1 += businessCount2
          } else {
            children = activity?.businesses?.map((business) => {
              return {
                title: <Link to={`/business/${business.id}`}>{business.businessName} - {business.dni} </Link>,
                value: business.dni,
                key: business.dni,
              }
            })

            businessCount2 += activity.businesses.length
            businessCount1 += businessCount2
          }

          return {
            title: <Typography.Text style={{ fontWeight: businessCount2 > 0 ? 'bold' : 'normal'}}>{`${activity.code} - ${activity.title} (${businessCount2})`}</Typography.Text>,
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

        businessCount1 = economicActivity.businesses.length
      }

      businessCount0 += businessCount1

      return {
        title: <Typography.Text style={{ fontWeight: businessCount1 > 0 ? 'bold' : 'normal'}}>{`${economicActivity.code} - ${economicActivity.title} (${businessCount1})`}</Typography.Text>,
        value: economicActivity.code,
        key: economicActivity.code,
        children: children
      }
    })

    let formattedSector = {
      title: <Typography.Text style={{ fontWeight: businessCount0 > 0 ? 'bold' : 'normal'}}>{`${sector.code} - ${sector.title} (${businessCount0})`}</Typography.Text>,
      value: sector.code,
      key: sector.code,

      children
    }

    return formattedSector
  })

  return <Card>
    <Typography.Title level={1}>Indice de empresas por actividad economica</Typography.Title>
    <Tree
      showLine
      
      treeData={mappedTreeData}
    />
  </Card>
}

export default BusinessesViewByEconomicActivityIndex;