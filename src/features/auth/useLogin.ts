import { useNavigate } from 'react-router-dom';
import { useSession } from './sessionStore';
import { requestJson } from '../../api/client/httpClient';
import { authSessionSchema } from '../../api/schemas/authSchemas';

interface LoginPayload {
  email: string;
  password: string;
}

export function useLogin() {
  const navigate = useNavigate();
  const { setSession } = useSession();

  const login = async (payload: LoginPayload): Promise<void> => {
    const response = await requestJson('/api/v1/login', {
      method: 'POST',
      body: payload
    });
    const session = authSessionSchema.parse(response);
    setSession(session);
    navigate('/');
  };

  return { login };
}
