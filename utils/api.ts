import axios, { AxiosResponse } from 'axios';

export default async function api<T = any>(
  path: string
): Promise<AxiosResponse<T>> {
  return axios.get<T>(process.env.NEXTAUTH_URL + path);
}
