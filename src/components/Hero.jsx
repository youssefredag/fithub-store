import { useState } from 'react';
import { Link } from 'react-router-dom';
import ConsultationModal from './ConsultationModal';

function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
    <br /> <br />
      <section className="hero">
        <div className="hero-text">
          <h1>Set up a home gym that works for you.</h1>
          <p>Dumbbells, benches, racks, and the everyday essentials. Find the right gear for the space you have and the way you train.</p>
          <div className="cta-btns">
            <Link to="/products" className="btn btn-primary">Shop equipment</Link>
            <button className="btn" onClick={() => setIsModalOpen(true)}>Ask us a question</button>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop" alt="Hero gym image" />
      </section>

      <ConsultationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

export default Hero
