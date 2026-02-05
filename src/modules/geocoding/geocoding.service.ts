import { Injectable } from '@nestjs/common';

interface NominatimResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
  display_name?: string;
}

interface GeocodingResult {
  city: string | null;
  region: string | null;
  country: string | null;
  displayName: string | null;
}

@Injectable()
export class GeocodingService {
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/reverse';

  async getCityFromCoordinates(
    latitude: string | number,
    longitude: string | number,
  ): Promise<GeocodingResult> {
    try {
      const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
      const lon = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

      const url = `${this.nominatimUrl}?lat=${lat}&lon=${lon}&format=json&accept-language=ru`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Swipee Dating App/1.0',
        },
      });

      if (!response.ok) {
        console.error('Nominatim API error:', response.status);
        return { city: null, region: null, country: null, displayName: null };
      }

      const data: NominatimResponse = await response.json();

      // Nominatim возвращает city, town, village или municipality в зависимости от размера населенного пункта
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.municipality ||
        null;

      return {
        city,
        region: data.address?.state || null,
        country: data.address?.country || null,
        displayName: data.display_name || null,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { city: null, region: null, country: null, displayName: null };
    }
  }
}
