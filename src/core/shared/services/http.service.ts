import axios, { AxiosError } from 'axios';
import { LoggerService } from './logger.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CorrelationIdService } from './correlation-id.service';

@Injectable()
export class AppHttpService implements OnModuleInit {
  private readonly _axiosInstance = axios.create({});
  constructor(
    private readonly loggerService: LoggerService,
    private readonly correlationIdService: CorrelationIdService,
  ) {}
  onModuleInit() {
    this._axiosInstance.interceptors.request.use((config) => {
      config.headers['startTime'] = Date.now();
      config.headers['x-correlation-id'] =
        this.correlationIdService.correlationId;
      return config;
    });

    this._axiosInstance.interceptors.response.use(
      (response) => {
        const config = response.config!;
        const urlEncodedPayload =
          config?.headers['Content-Type'] ===
          'application/x-www-form-urlencoded';
        const formattedData = config?.headers['Content-Type']
          ?.toString()
          ?.startsWith('multipart/form-data');
        const request = {
          method: config.method,
          url: config.url,
          ...(!formattedData && {
            body: !urlEncodedPayload
              ? JSON.parse(config?.data || null)
              : config?.data,
          }),
          params: config.params,
          headers: config?.headers,
        };
        const elapsed = Date.now() - Number(config?.headers['startTime']);
        this.loggerService.log('debug', 'http_success', {
          request,
          response: {
            status: response.status,
            data: response.data,
          },
          elapsed,
        });
        return Promise.resolve(response);
      },
      (e: AxiosError) => {
        const config = e.config!;
        const urlEncodedPayload =
          config?.headers['Content-Type'] ===
          'application/x-www-form-urlencoded';
        const formattedData = config?.headers['Content-Type']
          ?.toString()
          ?.startsWith('multipart/form-data');
        const request = {
          method: config?.method,
          url: config?.url,
          ...(!formattedData && {
            body: !urlEncodedPayload
              ? JSON.parse(config?.data || null)
              : config?.data,
          }),
          params: config?.params,
          headers: config?.headers,
        };
        const elapsed = Date.now() - Number(config?.headers['startTime']);
        if (e.response) {
          this.loggerService.log('error', 'http_error_response', {
            request,
            response: {
              status: e.response.status,
              data: e.response.data,
            },
            elapsed,
          });
        } else {
          this.loggerService.log('error', 'http_network_error', {
            request,
            response: {
              status: e.code,
              message: e.message,
            },
            elapsed,
          });
        }
        return Promise.reject(
          e.response ? e : new Error(`تعذر الاتصال ، يرجى المحاولة مرة أخرى`),
        );
      },
    );
  }

  get axiosInstance() {
    return this._axiosInstance;
  }
}
