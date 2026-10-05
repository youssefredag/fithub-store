import { useState } from 'react';
import PropTypes from 'prop-types';
import './ConsultationModal.css';

export default function ConsultationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goal: '',
    budget: '',
  });

  const handleChange = (event) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Thank you! We will get back to you soon at ${formData.email}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button" aria-label="Close consultation form">✕</button>

        <h2>Quick Consultation</h2>
        <p>Tell us about your goal and we&apos;ll recommend the right gear</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Training Goal</label>
            <select
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
            >
              <option value="">Select a goal...</option>
              <option value="strength">Build Strength</option>
              <option value="home-gym">Home Gym Setup</option>
              <option value="cardio">Cardio Training</option>
              <option value="general">General Fitness</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Budget Range</label>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
            >
              <option value="">Select a range...</option>
              <option value="0-100">Under $100</option>
              <option value="100-500">$100 - $500</option>
              <option value="500+">$500+</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">Send Request</button>
        </form>
      </div>
    </div>
  );
}

ConsultationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
