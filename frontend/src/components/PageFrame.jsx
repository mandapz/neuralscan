import Navbar from './Navbar';
import '../styles/Frame.css';
import './PageFrame.css';

export default function PageFrame({ children }) {
  return (
    <div className="frame">
      <div className="frame__box">
        <Navbar />
        <div className="pf__content">
          {children}
        </div>
      </div>
    </div>
  );
}
