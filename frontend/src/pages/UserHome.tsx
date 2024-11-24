import { Typography, Table, Card, Button, Space, Popconfirm } from "antd"
import { EditOutlined, EyeOutlined } from "@ant-design/icons"
import React, { useEffect } from "react"

import { Link } from "react-router-dom"

import dayjs from "dayjs"
import _ from "lodash"


import * as paymentService from "../util/paymentsApi"
import * as grossIncomeService from "../util/grossIncomeApi"
import grossIncomeInvoiceService from "../services/GrossIncomesInvoiceService"
import useAuthentication from "../hooks/useAuthentication"

import ROLES from "../util/roles"


import { formatBolivares } from "util/currency"
import { completeUrl } from "util"
import { IGrossIncome, INewGrossIncome, Payment } from "../util/types"

const UserHome: React.FC = () => {

    let { userAuth } = useAuthentication()
    let { user } = userAuth

	return (
		<div>
            {/* <Typography.Title>Bienvenido {user?.person?.id 
                ? `${user?.person?.firstName} ${user?.person?.lastName}` 
                : user?.username || "Usuario"}</Typography.Title> */}
		</div>
	)
}

export default UserHome