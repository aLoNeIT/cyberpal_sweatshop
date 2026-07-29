/**
 * pi-gateway JWT 认证模块
 *
 * 使用 Web Crypto API（crypto.subtle）校验 JWT token，
 * 支持 HS256/HS384/HS512 算法，不引入外部依赖。
 *
 * @module auth
 */

import type { GatewayConfig } from "./types.ts";
import { Logger } from "./logger.ts";
import { ErrorCode } from "./errors.ts";

/** JWT payload 结构 */
export interface JWTPayload {
  service_id: string;
  iat: number;   // 签发时间
  exp: number;   // 过期时间
  [key: string]: unknown;
}

/** JWT 校验结果 */
export interface AuthResult {
  valid: boolean;
  service_id?: string;
  error?: string;
}

/**
 * JWT 校验工具。
 *
 * 使用 Web Crypto API（HMAC-SHA256/384/512）实现，不依赖外部库。
 * Bun 环境原生支持 crypto.subtle。
 */
export class Auth {
  private secret: string;
  private algorithm: string;
  private logger: Logger;
  private keyPromise: Promise<CryptoKey> | null = null;

  /**
   * 创建 Auth 实例。
   *
   * @param config 网关配置（使用 config.jwt_secret 和 config.jwt_algorithm）
   * @param logger 日志工具
   */
  constructor(config: GatewayConfig, logger: Logger) {
    this.secret = config.jwt_secret;
    this.algorithm = config.jwt_algorithm;
    this.logger = logger;
  }

  /**
   * 获取 HMAC CryptoKey（惰性初始化，使用 SHA-256/384/512）。
   *
   * @returns HMAC CryptoKey
   */
  private async getKey(): Promise<CryptoKey> {
    if (!this.keyPromise) {
      const keyData = new TextEncoder().encode(this.secret);
      const hashAlg = `SHA-${this.algorithm.slice(-3)}` as "SHA-256" | "SHA-384" | "SHA-512";
      this.keyPromise = crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: { name: hashAlg } },
        false,
        ["sign", "verify"]
      );
    }
    return this.keyPromise;
  }

  /**
   * 校验 JWT token。
   *
   * 流程：
   * 1. 解析三段式 token（header.payload.signature）
   * 2. Base64URL 解码 payload
   * 3. 检查过期时间（exp）
   * 4. HMAC 验证签名
   *
   * @param token JWT 字符串（格式：header.payload.signature）
   * @returns 校验结果，包含 service_id 或错误信息
   */
  async verify(token: string): Promise<AuthResult> {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return { valid: false, error: ErrorCode.AUTH_INVALID_TOKEN };
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      // 解码 payload（Base64URL → JSON）
      const payloadJson = this.base64UrlDecodeStr(payloadB64);
      const payload: JWTPayload = JSON.parse(payloadJson);

      // 检查过期
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        this.logger.warn("JWT expired", { service_id: payload.service_id, exp: payload.exp, now });
        return { valid: false, error: ErrorCode.AUTH_INVALID_TOKEN };
      }

      // 验证签名
      const key = await this.getKey();
      const signData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
      const signature = this.base64UrlDecode(signatureB64);
      const valid = await crypto.subtle.verify(
        { name: "HMAC" },
        key,
        signature,
        signData
      );

      if (!valid) {
        return { valid: false, error: ErrorCode.AUTH_INVALID_TOKEN };
      }

      return { valid: true, service_id: payload.service_id };
    } catch (e) {
      this.logger.warn("JWT verification failed", { error: String(e) });
      return { valid: false, error: ErrorCode.AUTH_INVALID_TOKEN };
    }
  }

  /**
   * Base64URL 字符串解码为 UTF-8 字符串。
   *
   * @param b64 Base64URL 编码的字符串
   * @returns 解码后的 UTF-8 字符串
   */
  private base64UrlDecodeStr(b64: string): string {
    return atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  }

  /**
   * Base64URL 字符串解码为 ArrayBuffer（用于签名验证）。
   *
   * @param b64 Base64URL 编码的字符串
   * @returns 解码后的 ArrayBuffer
   */
  private base64UrlDecode(b64: string): ArrayBuffer {
    const raw = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    const buf = new ArrayBuffer(raw.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < raw.length; i++) {
      view[i] = raw.charCodeAt(i);
    }
    return buf;
  }
}
