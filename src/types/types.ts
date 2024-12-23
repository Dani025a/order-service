

export interface Order {
    id?: string;
    userid: number; 
    status?: string;
    totalPrice: number;
    totalDiscountedPrice: number;
    totalItems: number;
    orderDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    currency: string;
    products: OrderProduct[];
  }
  
export interface OrderProduct {
    product: Product;
}

export enum OrderStatus {
    PENDING = "PENDING",
    AWAITING_PAYMENT = "AWAITING_PAYMENT",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
  }
  
  export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
  }
  
  export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    stock: number;
    createdAt?: Date;
    updatedAt?: Date;
    discountId?: number;
    discount?: Discount;
    brand: string;
    weight: number;
    length: number;
    width: number;
    height: number;
    status: Status;
    seoTitle: string;
    seoDescription: string;
    metaKeywords: string;
    subSubCategoryId?: number;
    subSubCategory?: SubSubCategory;
    images?: Image[];
    reviews?: Review[];
    filters?: FilterOption[];
  }
  
  export interface Discount {
    id: number;
    percentage: number;
    startDate: Date;
    endDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
    description: string;
    products?: Product[];
  }
  
  export interface MainCategory {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    subCategories?: SubCategory[];
  }
  
  export interface SubCategory {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    mainCategoryId: number;
    mainCategory?: MainCategory;
    subSubCategories?: SubSubCategory[];
  }
  
  export interface SubSubCategory {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    subCategoryId: number;
    subCategory?: SubCategory;
    products?: Product[];
  }
  
  export enum FilterType {
    CHECKBOX = 'checkbox',
    DROPDOWN = 'dropdown',
    SLIDER = 'slider'
  }
  
  export interface FilterValue {
    id: number;
    value: string;
  }
  
  export interface FilterOption {
    id: number;
    name: string;
    type: FilterType;
    filterValues: FilterValue[];
  }
  
  export interface ProductFilter {
    filterOptionId: number;
    id: number;
    productId: number;
    filterValueId: number;
  }
  
  export interface Image {
    id: number;
    url: string;
    createdAt?: Date;
    updatedAt?: Date;
    productId: number;
    product?: Product;
  }
  
  export interface Review {
    id: number;
    rating: number;
    comment: string;
    createdAt?: Date;
    updatedAt?: Date;
    productId: number;
    product?: Product;
  }

  
  export interface ApiError {
    message: string;
  }
  

  