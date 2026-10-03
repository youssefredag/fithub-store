
import './About.css'
import gymEquipmentImage from '../../image/photo_5_2026-08-12_23-24-33.jpg';

export default function About() {
  return (
    <div className="page-white">
    <section className="about">
      <h2 className="center-title">About FitHub</h2>
      <div className="about-content">
        <img src={gymEquipmentImage} alt="Gym equipment" />
        <div className="about-text">
          <p>
            FitHub started when Ahmed and I were frustrated finding solid gym equipment locally.
            Every time something broke or felt cheap, we'd think "there's gotta be better." So we started
            researching suppliers, testing things ourselves, and ordering what actually held up.
          </p>

          <p>
            That was 5 years ago. Now we work with a handful of reliable makers and only stock
            gear we'd use in our own workouts. We're not selling you marketing speak — just equipment
            that does what you need it to do, at fair prices.
          </p>

          <p>
            Most orders ship within 2-3 days. If you're not sure what you need, message or call us.
            We'll ask you about your space and goals, then give you an honest recommendation.
            Simple as that.
          </p>

          <p style={{marginTop:20}}>
            <strong>Ahmed & Sarah</strong><br/>
            FitHub Gym Store<br/>
            📧 hello@fithub.local / 📞 +1-555-0123
          </p>

        </div>
      </div>
    </section>
    </div>
  )
}
