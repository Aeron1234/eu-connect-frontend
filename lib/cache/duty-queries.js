import { readDuty } from '../server-actions/duty-actions';
export const dutyKey = (userId) => ['dtr-duty', userId];
export function dutyOptions(userId, params = {}) { return { queryKey: [...dutyKey(userId), params], queryFn: async () => { const data = await readDuty(params); if (!data.success)
        throw new Error(data.error); return data; }, enabled: Boolean(userId), staleTime: 15000, refetchInterval: 30000 }; }
