import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, UserDocument, SavedSearch } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;

  const mockUser = {
    _id: 'user-id',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    savedSearches: [],
  };
  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
    exec: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    };

    it('should create a new user if email is not taken', async () => {
      // Mock no existing user found
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock successful save
      mockUserModel.save = jest.fn().mockResolvedValue(mockUser);

      // Create a spy on the userModel constructor
      jest.spyOn(userModel, 'constructor').mockImplementation(() => ({
        ...mockUser,
        save: () => Promise.resolve(mockUser),
      } as any));

      const result = await service.create(createUserDto);

      // Verify the result
      expect(result).toEqual(mockUser);
      
      // Verify password was hashed
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 'salt');
    });

    it('should throw ConflictException if email already exists', async () => {
      // Mock existing user found
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Verify it throws the expected exception
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      // Mock user found
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('john.doe@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Mock no user found
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return a user if found by id', async () => {
      // Mock user found
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      // Mock no user found
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('savedSearches', () => {
    const mockSearches: SavedSearch[] = [
      { type: 'image', query: 'nature', createdAt: new Date() },
      { type: 'audio', query: 'music', createdAt: new Date() },
    ];

    const mockUserWithSearches = {
      ...mockUser,
      savedSearches: mockSearches,
    };

    beforeEach(() => {
      // Reset mocks
      jest.clearAllMocks();
    });

    describe('addSavedSearch', () => {
      it('should add a new saved search to a user', async () => {
        // Mock initial user
        mockUserModel.findById.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockUser),
        });

        // Mock updateOne operation
        mockUserModel.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

        // Mock finding updated user
        mockUserModel.findById.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockUserWithSearches),
        });

        const newSearch: SavedSearch = { type: 'image', query: 'nature' } as SavedSearch;
        const result = await service.addSavedSearch('user-id', newSearch);

        // Check that the user was updated correctly
        expect(mockUserModel.updateOne).toHaveBeenCalledWith(
          { _id: 'user-id' },
          { $push: { savedSearches: expect.objectContaining({
            type: 'image',
            query: 'nature',
            createdAt: expect.any(Date),
          }) } }
        );

        // Check returned searches
        expect(result).toEqual(mockSearches);
      });
    });

    describe('getSavedSearches', () => {
      it('should return user saved searches', async () => {
        // Mock user with searches
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUserWithSearches),
        });

        const result = await service.getSavedSearches('user-id');
        expect(result).toEqual(mockSearches);
      });

      it('should return empty array when user has no saved searches', async () => {
        // Mock user without searches
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockUser,
            savedSearches: undefined,
          }),
        });

        const result = await service.getSavedSearches('user-id');
        expect(result).toEqual([]);
      });
    });

    describe('deleteSavedSearch', () => {
      it('should delete saved search at specified index', async () => {
        // Mock finding user with searches
        mockUserModel.findById.mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue(mockUserWithSearches),
        });

        // Mock update operation
        mockUserModel.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

        const result = await service.deleteSavedSearch('user-id', 0);

        // Check only one search should remain (the second one)
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockSearches[1]);
        
        // Verify the update operation was called with correct parameters
        expect(mockUserModel.updateOne).toHaveBeenCalledWith(
          { _id: 'user-id' },
          { $set: { savedSearches: [mockSearches[1]] } }
        );
      });

      it('should throw NotFoundException for invalid index', async () => {
        // Mock finding user with searches
        mockUserModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUserWithSearches),
        });

        // Try to delete a search with invalid index
        await expect(service.deleteSavedSearch('user-id', 5)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.deleteSavedSearch('user-id', 5)).rejects.toThrow(
          'Saved search not found',
        );
      });
    });
  });
});