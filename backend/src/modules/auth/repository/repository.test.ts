import { DataSource, Repository } from 'typeorm';
import { UserRepository } from './repository';
import { User } from '../entities/user';

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({ getRepository: jest.fn() })),
    Repository: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }))
  };
});

describe('UserRepository', () => {
  let dataSource: any;
  let repository: any;
  let userRepository: UserRepository;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    dataSource = { getRepository: jest.fn().mockReturnValue(repository) };
    userRepository = new UserRepository(dataSource as unknown as DataSource);
  });

  it('should create a user', async () => {
    const userData = { email: 'test@mail.com', password: '123' };
    const createdUser = { ...userData, id: 1 };
    repository.create.mockReturnValue(createdUser);
    repository.save.mockResolvedValue(createdUser);
    const result = await userRepository.create(userData);
    expect(repository.create).toHaveBeenCalledWith(userData);
    expect(repository.save).toHaveBeenCalledWith(createdUser);
    expect(result).toEqual(createdUser);
  });

  it('should save a user', async () => {
    const user = { id: 1, email: 'test@mail.com', password: '123' };
    repository.save.mockResolvedValue(undefined);
    await userRepository.save(user as User);
    expect(repository.save).toHaveBeenCalledWith(user);
  });

  it('should find user by id', async () => {
    const user = { id: 1, email: 'test@mail.com', password: '123' };
    repository.findOneBy.mockResolvedValue(user);
    const result = await userRepository.findOneById(1);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(user);
  });

  it('should find user by email', async () => {
    const user = { id: 1, email: 'test@mail.com', password: '123' };
    repository.findOneBy.mockResolvedValue(user);
    const result = await userRepository.findOneByEmail('test@mail.com');
    expect(repository.findOneBy).toHaveBeenCalledWith({ email: 'test@mail.com' });
    expect(result).toEqual(user);
  });

  it('should find user by option', async () => {
    const user = { id: 1, email: 'test@mail.com', password: '123' };
    repository.findOneBy.mockResolvedValue(user);
    const result = await userRepository.findOne({ email: 'test@mail.com' });
    expect(repository.findOneBy).toHaveBeenCalledWith({ email: 'test@mail.com' });
    expect(result).toEqual(user);
  });

  it('should return all users', async () => {
    const users = [{ id: 1, email: 'test@mail.com', password: '123' }];
    repository.find.mockResolvedValue(users);
    const result = await userRepository.findAll();
    expect(repository.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should update a user if exists', async () => {
    const id = 1;
    const oldUser = { id, email: 'test@mail.com', password: '123' };
    const updatedUser = { ...oldUser, email: 'new@mail.com' };
    userRepository.findOneById = jest.fn()
      .mockResolvedValueOnce(oldUser)
      .mockResolvedValueOnce(updatedUser);
    repository.update.mockResolvedValue(undefined);
    const result = await userRepository.update(id, { email: 'new@mail.com' });
    expect(userRepository.findOneById).toHaveBeenCalledWith(id);
    expect(repository.update).toHaveBeenCalledWith(id, { email: 'new@mail.com' });
    expect(userRepository.findOneById).toHaveBeenCalledTimes(2);
    expect(result).toEqual(updatedUser);
  });

  it('should return null when updating non-existing user', async () => {
    const id = 999;
    userRepository.findOneById = jest.fn().mockResolvedValue(null);
    const result = await userRepository.update(id, { email: 'no@mail.com' });
    expect(userRepository.findOneById).toHaveBeenCalledWith(id);
    expect(result).toBeNull();
  });

  it('should delete a user and return true if affected', async () => {
    repository.delete.mockResolvedValue({ affected: 1 });
    const result = await userRepository.delete(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });

  it('should delete a user and return false if not affected', async () => {
    repository.delete.mockResolvedValue({ affected: 0 });
    const result = await userRepository.delete(2);
    expect(repository.delete).toHaveBeenCalledWith(2);
    expect(result).toBe(false);
  });
}); 