import authService from '../auth.service';
import AuthDto from '../dto/auth.dto';

type LoginData = {
  email: string;
  password: string;
};

const login = async (data: LoginData) => {
  const user = await authService.getUserByEmail(data.email);
  await authService.checkPassword(data.password, user.password);

  return AuthDto.toLoginResponse({ user });
};

export default login;
