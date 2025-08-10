// apps/web/lib/services/secrets-manager.server.ts
// This file should only be imported in server-side code (API routes, server components)
import 'server-only' // This will throw an error if imported client-side

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

/**
 * SecretManager class for handling Google Cloud Secret Manager operations
 * This provides a secure way to access secrets in production environments
 * 
 * IMPORTANT: This is a server-only module and should never be imported in client components
 */
export class SecretManager {
  private static client: SecretManagerServiceClient | null = null;
  private static cache: Map<string, { value: string; expiry: number }> = new Map();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  /**
   * Initialize the Secret Manager client
   * In production, this uses Application Default Credentials (ADC)
   * which can be set via:
   * 1. GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account key
   * 2. Workload Identity (GKE)
   * 3. Service Account attached to GCE/Cloud Run/Cloud Functions
   */
  private static getClient(): SecretManagerServiceClient {
    if (!this.client) {
      this.client = new SecretManagerServiceClient();
    }
    return this.client;
  }

  /**
   * Get a secret value from Google Cloud Secret Manager
   * Falls back to environment variables in development
   */
  static async getSecret(secretName: string): Promise<string | null> {
    // In development, use environment variables
    if (process.env.NODE_ENV === 'development') {
      return this.getFromEnvironment(secretName);
    }

    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    try {
      // Get project ID from environment or metadata server
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || 
                       process.env.GCP_PROJECT || 
                       await this.getProjectIdFromMetadata();
      
      if (!projectId) {
        console.error('No GCP project ID found. Falling back to environment variables.');
        return this.getFromEnvironment(secretName);
      }

      const client = this.getClient();
      
      // Build the resource name
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      
      // Access the secret
      const [version] = await client.accessSecretVersion({ name });
      
      if (!version.payload?.data) {
        console.error(`Secret ${secretName} has no data`);
        return null;
      }

      // Convert the payload to string
      const value = version.payload.data.toString();
      
      // Cache the value
      this.cache.set(secretName, {
        value,
        expiry: Date.now() + this.CACHE_TTL
      });
      
      return value;
    } catch (error) {
      console.error(`Failed to get secret ${secretName} from Secret Manager:`, error);
      // Fall back to environment variables
      return this.getFromEnvironment(secretName);
    }
  }

  /**
   * Get secret from environment variables (fallback/development)
   */
  private static getFromEnvironment(secretName: string): string | null {
    // Map secret names to environment variable names
    const envMapping: Record<string, string> = {
      'openweather-api-key': 'NEXT_PUBLIC_OPENWEATHER_API_KEY',
      'news-api-key': 'NEWS_API_KEY',
      'openai-api-key': 'OPENAI_API_KEY',
      'stripe-secret-key': 'STRIPE_SECRET_KEY',
      'supabase-service-role-key': 'SUPABASE_SERVICE_ROLE_KEY',
      'google-client-secret': 'GOOGLE_CLIENT_SECRET',
      'microsoft-client-secret': 'MICROSOFT_CLIENT_SECRET',
      'strava-client-secret': 'STRAVA_CLIENT_SECRET',
      'fitbit-client-secret': 'FITBIT_CLIENT_SECRET',
      'apple-health-client-secret': 'APPLE_HEALTH_CLIENT_SECRET',
      'movebank-password': 'MOVEBANK_PASS',
      'jwt-secret': 'JWT_SECRET'
    };

    const envVar = envMapping[secretName];
    if (!envVar) {
      console.warn(`No environment variable mapping for secret: ${secretName}`);
      return null;
    }

    return process.env[envVar] || null;
  }

  /**
   * Get GCP project ID from metadata server (for GCE/Cloud Run/GKE)
   */
  private static async getProjectIdFromMetadata(): Promise<string | null> {
    try {
      const response = await fetch(
        'http://metadata.google.internal/computeMetadata/v1/project/project-id',
        {
          headers: { 'Metadata-Flavor': 'Google' }
        }
      );
      
      if (response.ok) {
        return await response.text();
      }
    } catch {
      // Not running on GCP
    }
    return null;
  }

  /**
   * Clear the cache (useful for testing or when secrets are rotated)
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get multiple secrets at once (more efficient)
   */
  static async getSecrets(secretNames: string[]): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};
    
    // Use Promise.all for parallel fetching
    const promises = secretNames.map(async (name) => ({
      name,
      value: await this.getSecret(name)
    }));
    
    const values = await Promise.all(promises);
    
    for (const { name, value } of values) {
      results[name] = value;
    }
    
    return results;
  }
}

// Export specific secret getters for convenience
export const getOpenWeatherApiKey = () => SecretManager.getSecret('openweather-api-key');
export const getNewsApiKey = () => SecretManager.getSecret('news-api-key');
export const getOpenAIApiKey = () => SecretManager.getSecret('openai-api-key');
export const getStripeSecretKey = () => SecretManager.getSecret('stripe-secret-key');
export const getSupabaseServiceRoleKey = () => SecretManager.getSecret('supabase-service-role-key');