import { PaymentMethod, PaymentStatus } from '../types';
export interface PaymentRequest {orderId:string;amount:number;customerName:string;customerPhone:string;paymentMethod:PaymentMethod;notes?:string;}
export interface PaymentResult {success:boolean;transactionId:string;paymentStatus:PaymentStatus;message:string;paymentMethod:PaymentMethod;paidAt?:string;}
export const paymentService={async processPayment(request:PaymentRequest):Promise<PaymentResult>{return{success:false,transactionId:'',paymentStatus:'PENDING',message:'Online payments are not enabled. Payment remains pending.',paymentMethod:request.paymentMethod};}};
