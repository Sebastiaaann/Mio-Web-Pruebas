import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync } from 'fs';
import { join } from 'path';

let analyticsClient: BetaAnalyticsDataClient | null = null;
let propertyId: string = '';

export function initializeAnalyticsClient(): BetaAnalyticsDataClient {
  if (analyticsClient) {
    return analyticsClient;
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (credentialsPath) {
    // Usar archivo de credenciales JSON
    try {
      const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));
      analyticsClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
      });
      propertyId = process.env.GA_PROPERTY_ID || `properties/${credentials.project_id}`;
    } catch (error) {
      throw new Error(`Error loading credentials from ${credentialsPath}: ${error}`);
    }
  } else {
    // Usar variables de entorno
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    propertyId = process.env.GA_PROPERTY_ID || '';

    if (!clientEmail || !privateKey) {
      throw new Error('Missing Google Analytics credentials. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY');
    }

    analyticsClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }

  if (!propertyId) {
    throw new Error('Missing GA_PROPERTY_ID environment variable');
  }

  return analyticsClient;
}

export function getAnalyticsClient(): BetaAnalyticsDataClient {
  if (!analyticsClient) {
    return initializeAnalyticsClient();
  }
  return analyticsClient;
}

export function getPropertyId(): string {
  if (!propertyId) {
    propertyId = process.env.GA_PROPERTY_ID || '';
  }
  return propertyId;
}
