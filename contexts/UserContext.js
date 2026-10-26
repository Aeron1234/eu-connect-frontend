"use client";

import { createContext, useCallback, useContext, useState } from "react";

const UserContext = createContext(undefined);

const emptyUser = {
  id: null,
  email: null,
  role: null,
  course_name: null,
  department_code: null,
};

/**
 * Authenticated role/shared-page layouts seed this client state from the
 * server session. It supports UI decisions; backend guards authorize requests.
 * resetUser clears this context only, not the session cookies.
 */
export function UserProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser ?? emptyUser);

  const resetUser = useCallback(() => {
    setUser(emptyUser);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Read the current layout's client user state and its setters.
 * Role and academic fields originate from the session claims.
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
