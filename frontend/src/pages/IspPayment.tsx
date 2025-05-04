import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Phone, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  CheckSquare,
  ExternalLink
} from 'lucide-react';
import { request } from "../build/request.ts";

// Define TypeScript interfaces
interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface InvoiceDetails {
  invoiceNumber: string;
  amount: number;
  items: InvoiceItem[];
  currency: string;
  loading: boolean;
  error: string | null;
}

interface StatusMessage {
  type: 'error' | 'success' | 'loading' | null;
  message: string;
}

type PaymentMethod = 'mpesa' | 'card' | null;

export default function PaymentPage() {
  // ===== STATES =====
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: '#INV-1746276042',
    amount: 500.00,
    items: [{ name: 'Minimum Payment', price: 500, quantity: 1, total: 500 }],
    currency: 'KES',
    loading: true,
    error: null
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({ type: null, message: '' });
  const [showPaymentSummary, setShowPaymentSummary] = useState<boolean>(false);

  // ===== EFFECTS =====
  useEffect(() => {
    // Load invoice details
    setTimeout(() => {
      setInvoiceDetails({
        invoiceNumber: '#INV-1746276042',
        amount: 500.00,
        items: [{ name: 'Minimum Payment', price: 500, quantity: 1, total: 500 }],
        currency: 'KES',
        loading: false,
        error: null
      });
    }, 1500);
    
    // Check for payment status in URL parameters (for return from payment processor)
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
   
    
    if (status === 'success') {
      setStatusMessage({ 
        type: 'success', 
        message: 'Payment completed successfully!' 
      });
      setIsProcessing(false);
    } else if (status === 'failed') {
      setStatusMessage({ 
        type: 'error', 
        message: 'Payment failed. Please try again.' 
      });
      setIsProcessing(false);
    } else if (status === 'cancelled') {
      setStatusMessage({ 
        type: 'error', 
        message: 'Payment was cancelled.' 
      });
      setIsProcessing(false);
    }
    
    // Check for IntaSend specific status
    const intasendStatus = urlParams.get('intasend_status');
    
    if (intasendStatus === 'CANCELLED') {
      setStatusMessage({ 
        type: 'error', 
        message: 'Payment was cancelled.' 
      });
      setIsProcessing(false);
    }
    
    // Add a listener for the postMessage API - IntaSend might use this to communicate payment results
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin to ensure messages only come from IntaSend
      if (event.origin === 'https://payment.intasend.com' || event.origin === 'https://sandbox.intasend.com') {
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          
          if (data.type === 'PAYMENT_STATUS') {
            if (data.status === 'COMPLETED') {
              setStatusMessage({
                type: 'success',
                message: 'Payment completed successfully!'
              });
              setIsProcessing(false);
            } else if (data.status === 'FAILED' || data.status === 'CANCELLED' || data.status === 'DECLINED') {
              setStatusMessage({
                type: 'error',
                message: `Payment ${data.status.toLowerCase()}. Please try again.`
              });
              setIsProcessing(false);
            }
          }
        } catch (error) {
          console.error('Error processing message from IntaSend:', error);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Add another effect to check payment status periodically

  // ===== HANDLERS =====
  const handlePaymentMethodSelect = (method: PaymentMethod): void => {
    setPaymentMethod(method);
    // Reset any previous error messages when switching payment methods
    if (statusMessage.type === 'error') {
      setStatusMessage({ type: null, message: '' });
    }
  };

  const initiatePayment = async (): Promise<void> => {
    if (!paymentMethod) {
      setStatusMessage({ 
        type: 'error', 
        message: 'Please select a payment method' 
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({
      type: 'loading',
      message: 'Initializing payment, please wait...'
    });
    
    try {
      // Call backend to initiate payment
      const response = await request.post('/api/initiate-payment/', {
        payment_method: paymentMethod,
        amount: invoiceDetails.amount,
        currency: invoiceDetails.currency,
        invoice_number: invoiceDetails.invoiceNumber,
        // Add a return_url that includes a cancel parameter
        return_url: `${window.location.origin}${window.location.pathname}?status=processed`,
        cancel_url: `${window.location.origin}${window.location.pathname}?status=cancelled`
      });
      
      if (response.data.status === 'success' && response.data.payment_url) {
        // Save payment ID for status checking
      
        // For M-Pesa, open in the same window - IntaSend will handle the prompt
        if (paymentMethod === 'mpesa') {
          window.location.href = response.data.payment_url;
        } 
        // For card payments, open in a new tab/popup to maintain the current page state
        else if (paymentMethod === 'card') {
          const newWindow = window.open(response.data.payment_url, '_blank');
          
          // If popup is blocked, fall back to redirecting in the same window
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            window.location.href = response.data.payment_url;
          }
        }
      } else {
        throw new Error('Failed to get payment URL');
      }
    } catch (error) {
      setIsProcessing(false);
      setStatusMessage({
        type: 'error',
        message: error instanceof Error 
          ? error.message 
          : 'An error occurred while initializing payment'
      });
    }
  };

  // Add a manual cancel handler
  const handleCancelPayment = () => {
    if (isProcessing) {
      setIsProcessing(false);
      setStatusMessage({
        type: 'error',
        message: 'Payment cancelled by user'
      });
      
     
    }
  };

  // ===== LOADING STATE =====
  if (invoiceDetails.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-indigo-600 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-indigo-600 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-auto">
      <div className="flex-grow flex flex-col justify-center px-4 py-8 sm:px-6 md:px-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600">
              Complete Your Payment
            </h1>
            <p className="mt-2 text-gray-600 text-sm md:text-base">
              Fast, secure, and reliable payment processing
            </p>
          </div>

          {/* Status Messages */}
          {statusMessage.type && (
            <div className={`mb-6 px-4 py-3 rounded-lg text-sm md:text-base ${
              statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 
              statusMessage.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
              'bg-indigo-50 text-indigo-600 border border-indigo-200'
            } flex items-center`}>
              {statusMessage.type === 'error' && <AlertCircle className="mr-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-red-600" />}
              {statusMessage.type === 'success' && <CheckCircle className="mr-2 h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-green-600" />}
              {statusMessage.type === 'loading' && (
                <div className="mr-2 w-4 h-4 md:w-5 md:h-5 border-2 border-t-indigo-600 border-indigo-200 rounded-full animate-spin flex-shrink-0"></div>
              )}
              <span className="font-medium">{statusMessage.message}</span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              {/* Left Panel - Invoice Details */}
              <div className="md:w-2/5 bg-gray-50 p-4 md:p-6">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-indigo-600">Invoice Details</h2>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <dl className="divide-y divide-gray-200">
                      {invoiceDetails.items.map((item, index) => (
                        <div key={index} className="py-2 flex justify-between">
                          <dt className="text-xs md:text-sm text-gray-600">
                            {item.name} <span className="text-gray-400">x{item.quantity}</span>
                          </dt>
                          <dd className="text-xs md:text-sm font-medium text-indigo-600">
                            {invoiceDetails.currency} {item.total.toFixed(2)}
                          </dd>
                        </div>
                      ))}
                      <div className="py-3 flex justify-between">
                        <dt className="text-sm md:text-base font-bold text-gray-600">Total Amount</dt>
                        <dd className="text-sm md:text-base font-bold text-indigo-600">
                          {invoiceDetails.currency} {invoiceDetails.amount.toFixed(2)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                      <div className="ml-2 md:ml-3">
                        <h3 className="text-xs md:text-sm font-medium text-gray-600">Payment Timeline</h3>
                        <p className="text-xs text-gray-600 mt-1">Complete payment within 15 minutes.</p>
                      </div>
                    </div>
                  </div>

                  {/* Secure Payment Badge */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                      <div className="ml-2 md:ml-3">
                        <h3 className="text-xs md:text-sm font-medium text-gray-600">Secure Payments</h3>
                        <p className="text-xs text-gray-600 mt-1">All transactions are secure and encrypted</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary Toggle (Mobile Only) */}
                  <div className="md:hidden">
                    <button 
                      onClick={() => setShowPaymentSummary(!showPaymentSummary)}
                      className="flex items-center justify-between w-full px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {showPaymentSummary ? 'Hide Order Summary' : 'View Order Summary'}
                      </span>
                      <ChevronRight className={`h-4 w-4 text-indigo-600 transform transition-transform ${showPaymentSummary ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {showPaymentSummary && (
                      <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <h3 className="text-xs font-medium text-indigo-600">Order Summary</h3>
                        <div className="mt-2 space-y-2">
                          {invoiceDetails.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="text-gray-600">{item.name}</span>
                              <span className="text-indigo-600">{invoiceDetails.currency} {item.total.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
                            <span className="text-gray-600">Total</span>
                            <span className="text-indigo-600">{invoiceDetails.currency} {invoiceDetails.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Payment Methods */}
              <div className="md:w-3/5 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-indigo-600 mb-4 md:mb-6">Select Payment Method</h2>

                <div className="space-y-3 md:space-y-4">
                  {/* M-Pesa Option */}
                  <div 
                    className={`relative border rounded-lg p-3 md:p-4 cursor-pointer transition-all ${
                      paymentMethod === 'mpesa' 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePaymentMethodSelect('mpesa')}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Phone className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                      </div>
                      <div className="ml-3 md:ml-4 flex-1">
                        <h3 className="text-sm md:text-base font-medium text-gray-600">M-Pesa</h3>
                        <p className="text-xs md:text-sm text-gray-600">Pay instantly via mobile money</p>
                      </div>
                      <div className="ml-2 md:ml-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-500">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Recommended
                        </span>
                      </div>
                      {paymentMethod === 'mpesa' && (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4">
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    
                    {paymentMethod === 'mpesa' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs md:text-sm text-gray-600">
                          <p>You'll receive an M-Pesa prompt on your phone to complete the payment.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Payment Option */}
                  <div 
                    className={`relative border rounded-lg p-3 md:p-4 cursor-pointer transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                        : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePaymentMethodSelect('card')}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                      </div>
                      <div className="ml-3 md:ml-4 flex-1">
                        <h3 className="text-sm md:text-base font-medium text-gray-600">Card Payment</h3>
                        <p className="text-xs md:text-sm text-gray-600">Pay with Visa, Mastercard, or American Express</p>
                      </div>
                      {paymentMethod === 'card' && (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4">
                          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    
                    {paymentMethod === 'card' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs md:text-sm text-gray-600">
                          <p>You'll be redirected to a secure payment page to enter your card details.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                    {/* Proceed Button */}
                    <button
                      onClick={initiatePayment}
                      disabled={isProcessing || !paymentMethod}
                      className={`w-full px-4 py-3 md:py-4 flex items-center justify-center rounded-lg transition-all flex-1 ${
                        isProcessing || !paymentMethod 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'
                      } text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="mr-2 md:mr-3 w-4 h-4 md:w-5 md:h-5 border-2 border-t-white border-white/30 rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          {paymentMethod === 'mpesa' 
                            ? 'Pay with M-Pesa' 
                            : paymentMethod === 'card' 
                              ? 'Pay with Card'  
                              : 'Proceed to Payment'}
                          <ExternalLink className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                        </>
                      )}
                    </button>
                    
                    {/* Cancel Button - Only show when processing */}
                    {isProcessing && (
                      <button
                        onClick={handleCancelPayment}
                        className="w-full sm:w-auto px-4 py-3 md:py-4 flex items-center justify-center rounded-lg transition-all border border-red-300 bg-white hover:bg-red-50 text-red-600 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {/* Back Button */}
                  <div className="text-center mt-3 md:mt-4">
                    <button 
                      className="inline-flex items-center text-xs md:text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                      onClick={() => window.history.back()}
                    >
                      <ArrowLeft className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                      Return to store
                    </button>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                  {/* Security Info */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
                      </div>
                      <div className="ml-2 md:ml-3">
                        <h3 className="text-xs md:text-sm font-medium text-gray-600">Your payment is secure</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Your payment information is securely processed and encrypted. 
                          We never store your payment details on our servers.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* IntaSend Processing Info - Only show when processing */}
                  {isProcessing && (
                    <div className="mt-4 bg-blue-50 p-3 md:p-4 rounded-lg border border-blue-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                        </div>
                        <div className="ml-2 md:ml-3">
                          <h3 className="text-xs md:text-sm font-medium text-blue-600">Payment in Progress</h3>
                          <p className="text-xs text-blue-600 mt-1">
                            If you've already responded to the M-Pesa prompt or canceled the request, but the status hasn't updated, 
                            please click the Cancel button above and try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Customer Support */}
                  <div className="mt-4 md:mt-6 text-center">
                    <p className="text-xs md:text-sm text-gray-500">
                      Having trouble with your payment?{' '}
                      <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                        Contact our support team
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-4 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
        <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Refunds</a>
        </div>
      </div>
    </div>
  );
}