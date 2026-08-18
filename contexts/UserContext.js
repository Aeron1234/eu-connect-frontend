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
 * Wrap your app with this once (root layout), seeding it with the session
 * you already fetch via getUserSession() on the server.
 */
export function UserProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser ?? emptyUser);

  const resetUser = useCallback(() => {
    setUser(emptyUser);
  }, []);

  console.log(user);

  return (
    <UserContext.Provider value={{ user, setUser, resetUser }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * const { user, setUser, resetUser } = useUser();
 * user.id / user.role / user.department_code / user.course_name / user.email
 */
export function useUser() {
  const ctx = useContext(UserContext);
  if (ctx === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}
