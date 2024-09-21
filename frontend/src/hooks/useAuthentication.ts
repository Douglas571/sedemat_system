// useAuthentication.jsx
import { useContext } from "react";
import { AuthenticationContext, IAuthContext } from "../contexts/AuthenticationProvider";
import { IUser } from "../util/types";

const useAuthentication = () => {
    return useContext(AuthenticationContext) as IAuthContext;
};

export default useAuthentication;