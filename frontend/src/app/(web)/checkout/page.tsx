// app/web/checkout/page.tsx
import { useState } from 'react';

export default function CheckoutPage() {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit');

  const handleCheckout = () => {
    // Logic xử lý thanh toán và tạo đơn hàng
    alert(`Đặt hàng thành công! Địa chỉ giao hàng: ${address}`);
  };

  return (
    <div>
      <h1>Thanh Toán</h1>
      <div className="checkout-form">
        <label>
          Địa chỉ giao hàng:
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Phương thức thanh toán:
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="credit">Thẻ tín dụng</option>
            <option value="cash">Tiền mặt</option>
          </select>
        </label>
        <button onClick={handleCheckout}>Đặt hàng</button>
      </div>
    </div>
  );
}
