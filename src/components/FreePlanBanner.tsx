import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface FreePlanBannerProps {
  onUpgrade?: () => void;
}

const FreePlanBanner: React.FC<FreePlanBannerProps> = ({ onUpgrade }) => {
  const { t } = useLanguage();

  return (
    <div className="cosmic-card-glass mb-4 border-gradient animate-fade-up" 
         style={{ 
           background: 'linear-gradient(135deg, rgba(123, 47, 247, 0.1) 0%, rgba(79, 172, 254, 0.1) 100%)',
           border: '2px solid',
           borderImage: 'linear-gradient(135deg, #7b2ff7, #4facfe, #f6c86e) 1',
         }}>
      <div className="row align-items-center">
        <div className="col-md-8">
          <div className="d-flex align-items-center gap-3 mb-2">
            <i className="bi bi-lock-fill" style={{ fontSize: '2rem', color: '#f6c86e' }}></i>
            <div>
              <h5 className="mb-1 fw-bold">{t('plan.freePlan')}</h5>
              <p className="mb-0 text-muted">{t('plan.unlockFeatures')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 text-md-end">
          <Link to="/pricing" className="btn btn-cosmic">
            <i className="bi bi-star-fill me-2"></i>
            {t('plan.upgradePlan')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FreePlanBanner;







