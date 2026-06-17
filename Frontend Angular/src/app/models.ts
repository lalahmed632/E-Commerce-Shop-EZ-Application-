export interface Product {
  id: number;
  productId?: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  category?: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface ToastMessage {
  id: number;
  text: string;
  categoryClass: string;
}

export interface AuthResponse {
  userId: number;
  name: string;
  email?: string;
  role: 'Admin' | 'Customer' | string;
  token: string;
  expiresAtUtc: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
}

export interface ProductUpsert {
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Order {
  orderId: number;
  userId: number;
  userEmail?: string;
  userName?: string;
  orderDate: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface ApiError {
  statusCode?: number;
  message?: string;
  errors?: Record<string, string[]>;
}
