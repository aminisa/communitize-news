interface OpenCageResponse {
  results: Array<{
    components: {
      postcode?: string;
    };
  }>;
}

const openCageApiKey = process.env.REACT_APP_OPENCAGE_API_KEY;

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${openCageApiKey}`
    );

    const data: OpenCageResponse = await response.json();

    if (data.results && data.results.length > 0) {
      const addressComponents = data.results[0].components;
      return addressComponents.postcode || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching ZIP code:", error);
    return null;
  }
};

export const getUserLocation = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);

          const zipCode = await reverseGeocode(latitude, longitude);
          console.log("ZIP Code:", zipCode);
          resolve(zipCode);
        },
        (error) => {
          console.error("Error getting location: ", error);
          resolve(null);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      resolve(null);
    }
  });
};
