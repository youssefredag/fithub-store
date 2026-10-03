import { useState } from 'react';
import './ConsultationModal.css';

export default function ConsultationModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goal: '',
    budget: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Consultation request:', formData);
    alert(`Thank you! We'll get back to you soon at ${formData.email}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2>Quick Consultation</h2>
        <p>Tell us about your goal and we'll recommend the right gear</p>

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
