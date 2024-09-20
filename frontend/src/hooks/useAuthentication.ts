import { createContext, useState } from "react";

export const AuthenticationContext = createContext({});

export function AuthenticationProvider({ children }) {
    const [userAuth, setUserAuth] = useState(null); // Initialize to null for unauthenticated state

    return (
        <AuthenticationContext.Provider value= {{ userAuth, setUserAuth }
}>
    { children }
    </AuthenticationContext.Provider>
  );
}
export default AuthenticationProvider;