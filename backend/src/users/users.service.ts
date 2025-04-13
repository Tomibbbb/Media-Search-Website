import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, SavedSearch } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel
      .findOne({ email: createUserDto.email })
      .exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  
  async addSavedSearch(userId: string, savedSearch: SavedSearch): Promise<SavedSearch[]> {
    const user = await this.findById(userId);
    
    const newSavedSearch = {
      ...savedSearch,
      createdAt: new Date()
    };
    
    await this.userModel.updateOne(
      { _id: userId },
      { $push: { savedSearches: newSavedSearch } }
    );
    
    const updatedUser = await this.findById(userId);
    return updatedUser.savedSearches;
  }
  
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    const user = await this.findById(userId);
    return user.savedSearches || [];
  }
  
  async deleteSavedSearch(userId: string, searchIndex: number): Promise<SavedSearch[]> {
    const user = await this.findById(userId);
    
    if (searchIndex < 0 || !user.savedSearches || searchIndex >= user.savedSearches.length) {
      throw new NotFoundException('Saved search not found');
    }
    
    const updatedSearches = user.savedSearches.filter((_, index) => index !== searchIndex);
    
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { savedSearches: updatedSearches } }
    );
    
    return updatedSearches;
  }
}
