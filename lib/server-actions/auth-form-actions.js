"use server";

import { login, forgotPassword, setPassword } from "./auth";

// React's useActionState passes (previousState, formData). Keep that form
// protocol at this boundary while the underlying actions take only their data.
export async function loginFormAction(_previousState, formData) {
  return login(formData);
}

export async function forgotPasswordFormAction(_previousState, formData) {
  return forgotPassword(formData);
}

export async function setPasswordFormAction(_previousState, formData) {
  return setPassword(formData);
}
