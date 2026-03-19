export class CreateUserDto {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  role_id: number;
  password: string;
}
