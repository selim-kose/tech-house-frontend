import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../common/product';
import { Observable, map } from 'rxjs';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {


  private baseUrl: string = environment.techHouseBaseUrl + "/products"
  private categoryUrl: string = environment.techHouseBaseUrl + "/product-category"

  constructor(private httpClient: HttpClient) { }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  getProduct(productId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${productId}`
    return this.httpClient.get<Product>(productUrl);
  }

  searchProductsPaginate(page: number, pageSize: number, searchKeyword: string): Observable<GetResponseProducts> {
    const url = `${this.baseUrl}/search/findByNameContaining?name=${searchKeyword}`
      + `&page=${page}&size=${pageSize}`
    return this.httpClient.get<GetResponseProducts>(url);
  }

  getProductsPaginate(page: number, pageSize: number, categoryId: number): Observable<GetResponseProducts> {
    const url = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`
      + `&page=${page}&size=${pageSize}`
    return this.httpClient.get<GetResponseProducts>(url);
  }

  getProductsByCatagoryId(categoryId: number): Observable<Product[]> {
    const url = `${this.baseUrl}/search/findByCategoryId?id=${categoryId}`
    return this.getProducts(url)
  }

  searchProducts(searchKeyword: string): Observable<Product[]> {
    const url = `${this.baseUrl}/search/findByNameContaining?name=${searchKeyword}`
    return this.getProducts(url)
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    )
  }

}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalpages: number,
    number: number
  }
}
interface GetResponseCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}
