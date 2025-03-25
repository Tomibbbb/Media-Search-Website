import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { ImageSearchDto } from '../dto/image-search.dto';
import { AudioSearchDto } from '../dto/audio-search.dto';
import { PaginatedImageList, Image } from '../interfaces/image.interface';
import { PaginatedAudioList, Audio } from '../interfaces/audio.interface';
import { OpenverseAuthResponse } from '../interfaces/auth.interface';

interface ErrorResponseData {
  detail?: string;
  [key: string]: any;
}

@Injectable()
export class OpenverseService {
  private readonly logger = new Logger(OpenverseService.name);
  private readonly baseUrl = 'https://api.openverse.org/v1';
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Authenticate with the Openverse API to get an access token
   */
  private async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('OPENVERSE_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'OPENVERSE_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      throw new HttpException(
        'Openverse API credentials not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const { data } = await firstValueFrom(
        this.httpService
          .post<OpenverseAuthResponse>(
            `${this.baseUrl}/auth_tokens/token/`,
            {
              client_id: clientId,
              client_secret: clientSecret,
              grant_type: 'client_credentials',
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Failed to authenticate with Openverse API: ${error.message}`,
                error.stack,
              );
              throw new HttpException(
                'Failed to authenticate with Openverse API',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      // Set token and expiration
      this.accessToken = data.access_token;
      const expiresIn = data.expires_in || 86400; // Default to 24 hours if not provided
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);

      return this.accessToken;
    } catch (error) {
      this.logger.error(`Authentication error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get authorization headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.authenticate();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Search for images using the Openverse API
   */
  async searchImages(searchDto: ImageSearchDto): Promise<PaginatedImageList> {
    try {
      const headers = await this.getAuthHeaders();

      // Build query parameters
      const params: Record<string, string> = {};
      Object.entries(searchDto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = String(value);
        }
      });

      const { data } = await firstValueFrom(
        this.httpService
          .get<PaginatedImageList>(`${this.baseUrl}/images/`, {
            headers,
            params,
          })
          .pipe(
            map((response) => response),
            catchError((error: AxiosError) => {
              this.logger.error(
                `Failed to search images: ${error.message}`,
                error.stack,
              );
              const responseData = error.response?.data as ErrorResponseData | undefined;
              throw new HttpException(
                responseData?.detail || 'Failed to search images',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      this.logger.error(`Image search error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get a specific image by ID
   */
  async getImage(id: string): Promise<Image> {
    try {
      const headers = await this.getAuthHeaders();

      const { data } = await firstValueFrom(
        this.httpService
          .get<Image>(`${this.baseUrl}/images/${id}/`, {
            headers,
          })
          .pipe(
            catchError((error: AxiosError) => {
              if (error.response?.status === 404) {
                throw new HttpException(
                  'Image not found',
                  HttpStatus.NOT_FOUND,
                );
              }
              this.logger.error(
                `Failed to get image: ${error.message}`,
                error.stack,
              );
              throw new HttpException(
                'Failed to get image',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      this.logger.error(`Get image error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Search for audio using the Openverse API
   */
  async searchAudio(searchDto: AudioSearchDto): Promise<PaginatedAudioList> {
    try {
      const headers = await this.getAuthHeaders();

      // Build query parameters
      const params: Record<string, string> = {};
      Object.entries(searchDto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params[key] = String(value);
        }
      });

      const { data } = await firstValueFrom(
        this.httpService
          .get<PaginatedAudioList>(`${this.baseUrl}/audio/`, {
            headers,
            params,
          })
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                `Failed to search audio: ${error.message}`,
                error.stack,
              );
              const responseData = error.response?.data as ErrorResponseData | undefined;
              throw new HttpException(
                responseData?.detail || 'Failed to search audio',
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      this.logger.error(`Audio search error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get a specific audio file by ID
   */
  async getAudio(id: string): Promise<Audio> {
    try {
      const headers = await this.getAuthHeaders();

      const { data } = await firstValueFrom(
        this.httpService
          .get<Audio>(`${this.baseUrl}/audio/${id}/`, {
            headers,
          })
          .pipe(
            catchError((error: AxiosError) => {
              if (error.response?.status === 404) {
                throw new HttpException(
                  'Audio not found',
                  HttpStatus.NOT_FOUND,
                );
              }
              this.logger.error(
                `Failed to get audio: ${error.message}`,
                error.stack,
              );
              throw new HttpException(
                'Failed to get audio',
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }),
          ),
      );

      return data;
    } catch (error) {
      this.logger.error(`Get audio error: ${(error as Error).message}`);
      throw error;
    }
  }
}