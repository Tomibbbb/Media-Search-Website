import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { OpenverseService } from './services/openverse.service';
import { HttpException } from '@nestjs/common';

describe('OpenverseService', () => {
  let service: OpenverseService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule.forRoot()],
      providers: [
        OpenverseService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'OPENVERSE_CLIENT_ID') return 'test-client-id';
              if (key === 'OPENVERSE_CLIENT_SECRET')
                return 'test-client-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OpenverseService>(OpenverseService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchImages', () => {
    it('should return paginated image list on successful API call', async () => {
      // Mock authentication response
      jest.spyOn(httpService, 'post').mockImplementationOnce(() =>
        of({
          data: {
            access_token: 'test-token',
            expires_in: 86400,
            token_type: 'Bearer',
            scope: 'read',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'test-url' } as any,
        }),
      );

      // Mock image search response
      jest.spyOn(httpService, 'get').mockImplementationOnce(() =>
        of({
          data: {
            result_count: 2,
            page_count: 1,
            page_size: 20,
            page: 1,
            results: [
              {
                id: 'image1',
                title: 'Test Image 1',
                url: 'http://example.com/image1.jpg',
                width: 800,
                height: 600,
                license: 'CC BY',
                license_url: 'http://example.com/license',
                license_version: '4.0',
                foreign_landing_url: 'http://example.com/source1',
                thumbnail: 'http://example.com/thumb1.jpg',
                source: 'test-source',
              },
              {
                id: 'image2',
                title: 'Test Image 2',
                url: 'http://example.com/image2.jpg',
                width: 1024,
                height: 768,
                license: 'CC BY-SA',
                license_url: 'http://example.com/license',
                license_version: '4.0',
                foreign_landing_url: 'http://example.com/source2',
                thumbnail: 'http://example.com/thumb2.jpg',
                source: 'test-source',
              },
            ],
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'test-url' } as any,
        }),
      );

      const result = await service.searchImages({
        q: 'test',
        page_size: 20,
        page: 1,
      });

      expect(result).toBeDefined();
      expect(result.result_count).toBe(2);
      expect(result.results.length).toBe(2);
      expect(result.results[0].id).toBe('image1');
      expect(result.results[1].id).toBe('image2');
    });

    it('should throw an exception when API call fails', async () => {
      // Mock authentication response
      jest.spyOn(httpService, 'post').mockImplementationOnce(() =>
        of({
          data: {
            access_token: 'test-token',
            expires_in: 86400,
            token_type: 'Bearer',
            scope: 'read',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'test-url' } as any,
        }),
      );

      // Mock image search error
      jest.spyOn(httpService, 'get').mockImplementationOnce(() =>
        throwError(() => ({
          response: {
            status: 400,
            data: {
              detail: 'Bad request',
            },
          },
        })),
      );

      await expect(service.searchImages({ q: 'test' })).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getImage', () => {
    it('should return an image when API call is successful', async () => {
      // Mock authentication response
      jest.spyOn(httpService, 'post').mockImplementationOnce(() =>
        of({
          data: {
            access_token: 'test-token',
            expires_in: 86400,
            token_type: 'Bearer',
            scope: 'read',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'test-url' } as any,
        }),
      );

      // Mock get image response
      jest.spyOn(httpService, 'get').mockImplementationOnce(() =>
        of({
          data: {
            id: 'image1',
            title: 'Test Image 1',
            url: 'http://example.com/image1.jpg',
            width: 800,
            height: 600,
            license: 'CC BY',
            license_url: 'http://example.com/license',
            license_version: '4.0',
            foreign_landing_url: 'http://example.com/source1',
            thumbnail: 'http://example.com/thumb1.jpg',
            source: 'test-source',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'test-url' } as any,
        }),
      );

      const result = await service.getImage('image1');

      expect(result).toBeDefined();
      expect(result.id).toBe('image1');
      expect(result.title).toBe('Test Image 1');
    });

    it('should throw a not found exception when image does not exist', async () => {
      // Mock authentication response
      jest.spyOn(httpService, 'post').mockImplementationOnce(() =>
        of({
          data: {
            access_token: 'test-token',
            expires_in: 86400,
            token_type: 'Bearer',
            scope: 'read',
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'test-url' } as any,
        }),
      );

      // Mock get image not found error
      jest.spyOn(httpService, 'get').mockImplementationOnce(() =>
        throwError(() => ({
          response: {
            status: 404,
            data: {
              detail: 'Not found',
            },
          },
        })),
      );

      await expect(service.getImage('nonexistent')).rejects.toThrow(
        'Image not found',
      );
    });
  });
});
