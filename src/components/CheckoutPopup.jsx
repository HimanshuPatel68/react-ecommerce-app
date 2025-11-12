import React, { useState } from 'react';
import axios from 'axios';
import {
  Modal,
  Button,
  Form,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '' });
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

  const convertBase64ToDataURL = (base64, mimeType = 'image/jpeg') => {
    if (!base64) return '/placeholder.jpg'; // fallback image
    if (base64.startsWith('data:') || base64.startsWith('http')) return base64;
    return `data:${mimeType};base64,${base64}`;
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);

    const orderItems = cartItems.map(({ id, quantity }) => ({ productId: id, quantity }));
    const payload = {
      customerName: formData.name,
      email: formData.email,
      items: orderItems
    };

    try {
      await axios.post(`${baseUrl}/api/orders/place`, payload);
      showToast('Order placed successfully!', 'success');
      localStorage.removeItem('cart');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Order failed:', error);
      showToast('Failed to place order. Please try again.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Form noValidate validated={validated} onSubmit={handleConfirm}>
          <Modal.Header closeButton>
            <Modal.Title>Checkout</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {cartItems.map(item => (
              <div key={item.id} className="d-flex mb-3 border-bottom pb-3">
                <img
                  src={convertBase64ToDataURL(item.imageData)}
                  alt={item.name}
                  className="me-3 rounded"
                  style={{ width: 80, height: 80, objectFit: 'cover' }}
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1">{item.name}</h6>
                  <p className="small mb-1">Quantity: {item.quantity}</p>
                  <p className="small mb-0">Price: ₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}

            <div className="text-center my-4">
              <h5 className="fw-bold">Total: ₹{totalPrice.toFixed(2)}</h5>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide your name.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : 'Confirm Purchase'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
        <Toast
          show={toast.show}
          bg={toast.variant}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Order Status</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === 'success' ? 'text-white' : ''}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default CheckoutPopup;
