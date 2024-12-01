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

    setEconomicActivityIndex(index)
  }

  useEffect(() => {
    loadIndex()
  }, [])

  function mapEconomicActivityBusinessIndex(treeNode) {      
    let children = []
    let businessCount = 0

    // if it has economic activities 
    if (treeNode.economicActivities) {
      children = treeNode.economicActivities.map((activity) => mapEconomicActivityBusinessIndex(activity)).sort((a, b) => a.value.localeCompare(b.value))
      businessCount = children.reduce((sum, curr) => sum + curr.businessCount, 0)
    }

    // if it don't have business or economicActivities 
    if (treeNode.businesses) {
      children = treeNode.businesses.map((activity) => mapEconomicActivityBusinessIndex(activity)).sort((a, b) => a.value.localeCompare(b.value))
      businessCount = treeNode.businesses.length
    }

    if (treeNode.businessName) {
      return {
        title: <Link to={`/business/${treeNode.id}`}>{treeNode.businessName} - {treeNode.dni} </Link>,
        value: treeNode.businessName,
        key: treeNode.dni,
      }
    }

    return {
      title: <Typography.Text style={{ fontWeight: businessCount > 0 ? 'bold' : 'normal'}}>{`${treeNode.code} - ${treeNode.title} (${businessCount})`}</Typography.Text>,
      value: treeNode.code,
      key: treeNode.code,
      children,
      businessCount
    }
  }

  const mappedTreeData: TreeDataNode[] = economicActivityIndex?.map((sector) => mapEconomicActivityBusinessIndex(sector))

  return <Card>
    <Typography.Title level={1}>Indice de empresas por actividad economica</Typography.Title>
    <Tree
      showLine
      
      treeData={mappedTreeData}
    />
  </Card>
}

export default BusinessesViewByEconomicActivityIndex;