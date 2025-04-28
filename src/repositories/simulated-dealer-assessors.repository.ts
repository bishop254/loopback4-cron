import usersData from '../data/userData.json';

export interface User {
  id: number;
  information: {
    empname: string;
  };
  email: string;
}

export class SimulatedUserRepository {
  async findAllUsers(): Promise<User[]> {
    return usersData as User[];
  }

  async findUserById(id: number): Promise<User | undefined> {
    return (usersData as User[]).find(user => user.id === id);
  }

  async findUsersByIds(ids: number[]): Promise<User[]> {
    return (usersData as User[]).filter(user => ids.includes(user.id));
  }
}
