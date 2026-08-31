import { PaymentMethod, PaymentStatus } from '../types';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentStatus: PaymentStatus;
  message: string;
  paymentMethod: PaymentMethod;
  paidAt?: string;
}

/**
 * Payment Service Abstraction for TEFFEIN food-tech architecture.
 * Supports UPI (GPay, PhonePe, Paytm, QR), Cards, NetBanking, and Cash On Delivery.
 */
class PaymentService {
  /**
   * Initiates payment flow
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    return new Promise((resolve) => {
      // Simulate network & payment gateway response time (600ms)
      setTimeout(() => {
        const txId = `TXN-GJ-${Math.floor(100000 + Math.random() * 900000)}`;
        const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        if (request.paymentMethod === 'CashOnDelivery') {
          resolve({
            success: true,
            transactionId: txId,
            paymentStatus: 'PENDING',
            message: 'Cash on Delivery selected. Please pay cash or scan delivery partner UPI QR upon meal arrival.',
            paymentMethod: request.paymentMethod,
            paidAt: timestamp
          });
        } else {
          resolve({
            success: true,
            transactionId: txId,
            paymentStatus: 'PAID',
            message: `Payment of ₹${request.amount} successfully authorized via ${request.paymentMethod}.`,
            paymentMethod: request.paymentMethod,
            paidAt: timestamp
          });
        }
      }, 700);
    });
  }
}

export const paymentService = new PaymentService();
