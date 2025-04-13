import { Test, TestingModule } from '@nestjs/testing';
import { OpenverseController } from './openverse.controller';
import { OpenverseService } from './services/openverse.service';
import { ImageSearchDto } from './dto/image-search.dto';
import { AudioSearchDto } from './dto/audio-search.dto';

describe('OpenverseController', () => {
  let controller: OpenverseController;
  let service: OpenverseService;

  const mockImageSearchResponse = {
    result_count: 2,
    page_count: 1,
    page_size: 20,
    page: 1,
    results: [
      {
        id: 'image1',
        title: 'Test Image 1',
        creator: 'Test Creator 1',
        url: 'http://example.com/image1.jpg',
        license: 'CC BY',
      },
      {
        id: 'image2',
        title: 'Test Image 2',
        creator: 'Test Creator 2',
        url: 'http://example.com/image2.jpg',
        license: 'CC BY-SA',
      },
    ],
  };

  const mockImageResponse = {
    id: 'image1',
    title: 'Test Image 1',
    creator: 'Test Creator 1',
    url: 'http://example.com/image1.jpg',
    license: 'CC BY',
  };

  const mockAudioSearchResponse = {
    result_count: 2,
    page_count: 1,
    page_size: 20,
    page: 1,
    results: [
      {
        id: 'audio1',
        title: 'Test Audio 1',
        creator: 'Test Creator 1',
        url: 'http://example.com/audio1.mp3',
        license: 'CC BY',
      },
      {
        id: 'audio2',
        title: 'Test Audio 2',
        creator: 'Test Creator 2',
        url: 'http://example.com/audio2.mp3',
        license: 'CC BY-SA',
      },
    ],
  };

  const mockAudioResponse = {
    id: 'audio1',
    title: 'Test Audio 1',
    creator: 'Test Creator 1',
    url: 'http://example.com/audio1.mp3',
    license: 'CC BY',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenverseController],
      providers: [
        {
          provide: OpenverseService,
          useValue: {
            searchImages: jest.fn().mockResolvedValue(mockImageSearchResponse),
            getImage: jest.fn().mockResolvedValue(mockImageResponse),
            searchAudio: jest.fn().mockResolvedValue(mockAudioSearchResponse),
            getAudio: jest.fn().mockResolvedValue(mockAudioResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<OpenverseController>(OpenverseController);
    service = module.get<OpenverseService>(OpenverseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchImages', () => {
    it('should return paginated image search results', async () => {
      const searchDto: ImageSearchDto = { q: 'nature' };
      
      const result = await controller.searchImages(searchDto);
      
      expect(service.searchImages).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockImageSearchResponse);
    });
  });

  describe('getImage', () => {
    it('should return a single image by ID', async () => {
      const imageId = 'image1';
      
      const result = await controller.getImage(imageId);
      
      expect(service.getImage).toHaveBeenCalledWith(imageId);
      expect(result).toEqual(mockImageResponse);
    });
  });

  describe('searchAudio', () => {
    it('should return paginated audio search results', async () => {
      const searchDto: AudioSearchDto = { q: 'music' };
      
      const result = await controller.searchAudio(searchDto);
      
      expect(service.searchAudio).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockAudioSearchResponse);
    });
  });

  describe('getAudio', () => {
    it('should return a single audio file by ID', async () => {
      const audioId = 'audio1';
      
      const result = await controller.getAudio(audioId);
      
      expect(service.getAudio).toHaveBeenCalledWith(audioId);
      expect(result).toEqual(mockAudioResponse);
    });
  });
});