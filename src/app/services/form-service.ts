import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { City } from '../common/city';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private countriesUrl = environment.techHouseBaseUrl + '/countries'
  private citiesUrl = environment.techHouseBaseUrl + '/cities'

  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    )
  }

  getCities(countryCode: string): Observable<City[]> {

    let searchCityUrl = `${this.citiesUrl}/search/findByCountryCode?code=${countryCode}`


    return this.httpClient.get<GetResponseCities>(searchCityUrl).pipe(
      map(response => response._embedded.cities)
    );
  }

  getCrediCardMonths(startMonth: number): Observable<number[]> {

    let data: number[] = [];

    for (let month = startMonth; month <= 12; month++) {
      data.push(month)
    }
    return of(data)
  }

  getCreditCardYears(): Observable<number[]> {
    let data: number[] = [];

    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear + 10;

    for (let year = startYear; year <= endYear; year++) {
      data.push(year);
    }
    return of(data);
  }


}

interface GetResponseCountries {
  _embedded: {
    countries: Country[];
  }

}
interface GetResponseCities {
  _embedded: {
    cities: City[];
  }
}