import API from "../services/api";

export const createUser = (data) => {
  return API.post("/users/create", data);
};