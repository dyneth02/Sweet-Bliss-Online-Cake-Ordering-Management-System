import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styled from 'styled-components';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

const LoyaltyContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #fdf6f0;

  h1 {
    font-family: 'Playfair Display', serif;
    background: linear-gradient(45deg, #ff7088, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
    position: relative;
    padding-bottom: 1rem;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #ff7088, transparent);
    }
  }
`;

const WheelContainer = styled.div`
  position: relative;
  width: 400px;
  height: 400px;
  margin: 2rem 0;
  filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
`;

const CanvasContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const WheelPointer = styled.div`
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ffd700, #ffa07a);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  z-index: 3;
  filter: drop-shadow(0 3px 5px rgba(0,0,0,0.2));
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 24px;
    background: linear-gradient(45deg, rgba(255,255,255,0.4), transparent);
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  }
`;

const SpinButton = styled.button`
  padding: 1rem 2.5rem;
  font-size: 1.3rem;
  background: linear-gradient(45deg, #ff7088, #ff9eaf);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 0.2rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255,112,136,0.3);
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;

  &:hover {
    background: linear-gradient(45deg, #ff9eaf, #ff7088);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255,112,136,0.4);
  }

  &:disabled {
    background: linear-gradient(45deg, #ccc, #ddd);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #fff 0%, #fdf6f0 100%);
  padding: 3rem;
  border-radius: 20px;
  text-align: center;
  max-width: 450px;
  width: 100%;
  box-shadow: 
    0 10px 25px rgba(0,0,0,0.2),
    0 0 0 1px rgba(255,255,255,0.5) inset;
  animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #ff7088, #ffd700);
  }

  @keyframes modalPop {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  h2 {
    font-family: 'Playfair Display', serif;
    color: #ff7088;
    margin-bottom: 1.5rem;
    font-size: 2rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(255,112,136,0.1);
  }

  p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1.5rem;
    font-weight: 500;
  }

  .promo-code {
    font-size: 2rem;
    font-weight: bold;
    padding: 1.5rem;
    background: linear-gradient(45deg, #fff, #fdf6f0);
    border-radius: 12px;
    margin: 1.5rem 0;
    letter-spacing: 3px;
    border: 2px dashed #ff9eaf;
    box-shadow: 
      0 4px 15px rgba(255,158,175,0.1),
      0 0 0 4px #fff,
      0 0 0 5px #ff9eaf;
    color: #ff7088;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 6px 20px rgba(255,158,175,0.15),
        0 0 0 4px #fff,
        0 0 0 5px #ff9eaf;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8rem;
      color: #666;
      opacity: 0.8;
      font-weight: normal;
    }
  }

  .buttons-container {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }

  .copy-btn {
    background: linear-gradient(45deg, #ff9eaf, #ffb6c1);
    color: white;
    flex: 1;
    max-width: 200px;
    position: relative;
    overflow: hidden;

    &.copying {
      animation: copyPulse 0.5s ease-out;
    }

    @keyframes copyPulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(0.95);
      }
      100% {
        transform: scale(1);
      }
    }

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover::before {
      opacity: 1;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  button {
    margin: 0.5rem;
    padding: 1rem 2rem;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 1px;

    &.cart-btn {
      background: linear-gradient(45deg, #ff7088, #ff8da1);
      color: white;
      flex: 1;
      max-width: 200px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(255,112,136,0.4);
      }
    }
  }
`;

const generatePromoCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const LoyaltyPage = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [copyStatus, setCopyStatus] = useState('Copy Code');
  const [copyAnimation, setCopyAnimation] = useState(false);
  const wheelRef = useRef(null);
  const chartInstance = useRef(null);

  const discounts = [5, 10, 15, 5, 10, 15];
  const colors = [
    'rgba(255, 112, 136, 1)', // #ff7088
    'rgba(255, 158, 175, 1)', // #ff9eaf
    'rgba(255, 112, 136, 1)',
    'rgba(255, 158, 175, 1)',
    'rgba(255, 112, 136, 1)',
    'rgba(255, 158, 175, 1)'
  ];

  useEffect(() => {
    if (wheelRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(wheelRef.current, {
        plugins: [ChartDataLabels],
        type: 'pie',
        data: {
          labels: discounts.map(d => `${d}%`),
          datasets: [{
            data: Array(6).fill(1),
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          rotation: 0,
          animation: {
            duration: 0
          },
          plugins: {
            tooltip: { enabled: false },
            legend: { display: false },
            datalabels: {
              color: '#fff',
              formatter: (_, context) => context.chart.data.labels[context.dataIndex],
              font: {
                size: 20,
                weight: 'bold',
                family: 'Arial Rounded MT Bold'
              },
              textShadow: '2px 2px 2px rgba(0,0,0,0.2)',
              textStrokeWidth: 2,
              textStrokeColor: 'rgba(0,0,0,0.1)'
            }
          }
        }
      });
    }
  }, []);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    const spinDegrees = 1800 + Math.floor(Math.random() * 360);
    let currentRotation = chartInstance.current.options.rotation || 0;
    let targetRotation = currentRotation + spinDegrees;
    let startTime = null;
    const duration = 4000;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const easing = 1 - Math.pow(1 - progress, 3);
      const currentDegree = currentRotation + (spinDegrees * easing);
      
      chartInstance.current.options.rotation = currentDegree % 360;
      chartInstance.current.update('none');

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalRotation = currentDegree % 360;
        const sectionSize = 360 / 6;
        const sectionIndex = Math.floor((360 - (finalRotation % 360)) / sectionSize);
        setSelectedDiscount(discounts[sectionIndex]);
        
        const newPromoCode = generatePromoCode();
        setPromoCode(newPromoCode);
        localStorage.setItem('promo', JSON.stringify({
          code: newPromoCode,
          discount: discounts[sectionIndex],
          used: false
        }));
        
        setIsSpinning(false);
        setShowModal(true);
      }
    };

    requestAnimationFrame(animate);
  };

  const copyPromoCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopyAnimation(true);
      setCopyStatus('Copied! ✓');
      
      // Reset animation state after animation completes
      setTimeout(() => {
        setCopyAnimation(false);
      }, 500);
      
      // Reset button text after 2 seconds
      setTimeout(() => {
        setCopyStatus('Copy Code');
      }, 2000);
    } catch (err) {
      setCopyStatus('Failed to copy');
      setTimeout(() => {
        setCopyStatus('Copy Code');
      }, 2000);
    }
  };

  return (
    <LoyaltyContainer>
      <Header />
      <MainContent className="mt-16 font-extrabold text-4xl">
        <h1>✨ Wheel of Loyalty ✨</h1>
        <WheelContainer>
          <WheelPointer />
          <CanvasContainer>
            <canvas ref={wheelRef}></canvas>
          </CanvasContainer>
        </WheelContainer>
        <SpinButton className="mt-0"
          onClick={spinWheel}
          disabled={isSpinning || showModal}
        >
          {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
        </SpinButton>

        {showModal && (
          <Modal>
            <ModalContent>
              <h2>✨ Congratulations! 🎉</h2>
              <p>You've won an exclusive discount of</p>
              <h2 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>{selectedDiscount}% OFF</h2>
              <p>Use this special code at checkout:</p>
              <div className="promo-code" onClick={copyPromoCode}>
                {promoCode}
              </div>
              <div className="buttons-container">
                <button 
                  className={`copy-btn ${copyAnimation ? 'copying' : ''}`}
                  onClick={copyPromoCode}
                  style={{
                    background: copyStatus === 'Copied! ✓' 
                      ? 'linear-gradient(45deg, #4CAF50, #45a049)'
                      : 'linear-gradient(45deg, #ff9eaf, #ffb6c1)'
                  }}
                >
                  {copyStatus}
                </button>
                <button className="cart-btn" onClick={() => window.location.href = '/cartview'}>
                  Go to Cart
                </button>
              </div>
            </ModalContent>
          </Modal>
        )}
      </MainContent>
      <Footer />
    </LoyaltyContainer>
  );
};

export default LoyaltyPage; 