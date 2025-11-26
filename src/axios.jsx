import axios from "axios";

const API = axios.create({
  baseURL: "https://spring-ecommerce-backend-production.up.railway.app",
});
delete API.defaults.headers.common["Authorization"];
export default API;
