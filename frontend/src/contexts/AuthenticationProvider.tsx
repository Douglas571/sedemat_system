// AuthenticationProvider.jsx
import React, { createContext, useState } from "react";
import { useLocalStorage } from "@uidotdev/usehooks";

import { IUser } from "../util/types";

interface IUserAuth { 
  token?: string, 
  user?: IUser
}

export interface IAuthContext {
  userAuth: IUserAuth,
  setUserAuth: (userAuthData: IUserAuth) => void

}

export const AuthenticationContext = createContext<IAuthContext | null>(null);

interface AuthProviderProps {
  children: JSX.Element
}
export function AuthenticationProvider(props: AuthProviderProps) {
  const { children } = props
  const [userAuth, setUserAuth] = useLocalStorage<IUserAuth>("userAuth", {}); // Initialize to null for unauthenticated state

  return (
    <AuthenticationContext.Provider value={{ userAuth, setUserAuth }}>
      {children}
    </AuthenticationContext.Provider>
  );
}
export default AuthenticationProvider;