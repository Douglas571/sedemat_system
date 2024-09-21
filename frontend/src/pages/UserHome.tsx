import { Typography } from "antd"
import useAuthentication from "../hooks/useAuthentication"
import React from "react"

const UserHome: React.FC = () => {

    let { userAuth } = useAuthentication()
    let {user} = userAuth

    console.log({userAuth})

	return (
		<div>
            <Typography.Title>Bienvenido {user?.username || "Usuario"}</Typography.Title>
		</div>
	)
}

export default UserHome