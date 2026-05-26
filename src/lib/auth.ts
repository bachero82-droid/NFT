export function getAuthToken() {
  return localStorage.getItem("vex_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("vex_token", token);
}

export function removeAuthToken() {
  localStorage.removeItem("vex_token");
}
