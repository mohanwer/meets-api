import { Arg, Query, Resolver } from "type-graphql";
import { EventSearchResponse } from '../../entity'
import { searchEvents, SearchRequest } from '../../services/elastic';
import { InjectRepository } from "typeorm-typedi-extensions";
import { ZipCode } from "../../entity/ZipCode";
import { Repository } from "typeorm";
import { geocodeAddrStr } from "../../services/geocode";
import { EventSearchRequest } from './EventSearchRequest';

//Todo: Need to move this to a configuration file.
const DEFAULT_DISTANCE = "50miles";
const DEFAULT_SEARCH_SIZE = 10;

@Resolver()
export class SearchResolver {

  constructor(
    @InjectRepository(ZipCode) private readonly zipCodeRepo: Repository<ZipCode>
  ) {}

  @Query((returns) => [EventSearchResponse], { nullable: true })
  async searchEvents(
    @Arg("searchParams") searchParams: EventSearchRequest | null
  ): Promise<EventSearchResponse[]> {
    const searchRequest = await this.mapSearchParamsToRequest(searchParams)
    const searchResults = await searchEvents(searchRequest);
    // If we get nothing back from the search we can just terminate.
    // if (searchResults.length === 0) return null;
    const mappedResults: EventSearchResponse[] = searchResults.map(s => s)
    // Map this search object to the search response.
    return mappedResults;
  }

  // Helper Functions
  async getLatLngForZip(zipCode: string): Promise<ZipCode> {
    // Check db if zip code has been searched for before
    let searchResult = await this.zipCodeRepo.findOne({ postal: zipCode });
    if (searchResult) return searchResult;

    // If the zip hasn't been searched before geocode it, save, return new zip result.
    const geoCodedZip = await geocodeAddrStr(zipCode);
    const newZip = {
      postal: zipCode,
      lat: geoCodedZip.lat,
      lon: geoCodedZip.lng,
    };
    return await this.zipCodeRepo.create(newZip).save();
  }

  async mapSearchParamsToRequest(searchParams: EventSearchRequest): Promise<SearchRequest> {
    let searchRequest: SearchRequest = {
      size: searchParams?.size ?? DEFAULT_SEARCH_SIZE,
      from: searchParams?.from ?? 0,
    };

    if (searchParams?.eventName) searchRequest.name = searchParams.eventName;

    if (searchParams?.location?.lat && searchParams.location?.lng) {
      searchRequest.location = {
        lng: searchParams.location.lng,
        lat: searchParams.location.lat,
        distance: searchParams.location?.distance ?? DEFAULT_DISTANCE,
      };
    } else if (searchParams?.postal) {
      const zipSearchResult = await this.getLatLngForZip(searchParams.postal);
      searchRequest.location = {
        lat: zipSearchResult.lat,
        lng: zipSearchResult.lon,
        distance: searchParams.location?.distance ?? DEFAULT_DISTANCE,
      };
    }

    return searchRequest
  }
}
