import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeApi } from '../../../api/homeApi';
import { useLanguage } from '../../../common/i18n/LanguageContext';
import styles from './ReferBanner.module.css';

function ReferBanner() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState(window.location.origin);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

  useEffect(() => {
    const loadReferralLink = async () => {
      const token = localStorage.getItem('ibhakt_token');
      if (!token) return;

      try {
        const data = await homeApi.getReferralCode();
        const code = data?.code;
        const link =
          data?.referral_link ||
          (code ? `${window.location.origin}/signup?ref=${code}` : window.location.origin);
        setShareUrl(link);
      } catch (error) {
        // Silent fallback to generic homepage link for guest/non-auth states
      }
    };

    loadReferralLink();
  }, []);

  const ensureLoggedIn = () => {
    const token = localStorage.getItem('ibhakt_token');
    if (token) return true;
    alert('Please login to use referral sharing.');
    navigate('/login');
    return false;
  };

  const handleInvite = async () => {
    if (!ensureLoggedIn()) return;
    setShowInviteModal(true);
  };

  const handleCopyLink = async () => {
    if (!ensureLoggedIn()) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(`Copied: ${shareUrl}`);
      setTimeout(() => setCopyFeedback(''), 2500);
    } catch (error) {
      alert('Unable to copy. Please copy manually.');
    }
  };

  const handleShare = async () => {
    const shareText =
      'Check out iBhakt - Generate your Kundli, manifest your desires, and track your karma journey!';

    // Try sharing QR image file first (supported on modern mobile browsers/apps)
    if (navigator.share) {
      try {
        const qrResponse = await fetch(qrImageUrl);
        if (qrResponse.ok) {
          const qrBlob = await qrResponse.blob();
          const qrFile = new File([qrBlob], 'ibhakt-referral-qr.png', { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [qrFile] })) {
            await navigator.share({
              title: 'iBhakt Referral',
              text: `${shareText}\n${shareUrl}`,
              files: [qrFile],
            });
            return;
          }
        }
      } catch (error) {
        // Ignore image-share failure and fallback below
      }

      try {
        await navigator.share({ title: 'iBhakt', text: shareText, url: shareUrl });
        return;
      } catch (error) {
        // User canceled share dialog or device unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(`Link copied (share fallback): ${shareUrl}`);
      setTimeout(() => setCopyFeedback(''), 2500);
    } catch (error) {
      alert('Sharing is not supported on this device.');
    }
  };

  return (
    <section className={styles.referSection}>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className={`card ${styles.referCard}`}>
              <div className="card-body p-4 p-md-5 text-center">
                <div className={styles.icon}>🎁</div>
                <h2 className="page-hero-heading page-hero-heading--compact fw-bold mb-3">{t('refer.title')}</h2>
                <p className="lead mb-4">
                  {t('refer.subtitle')}
                </p>
                <div className={styles.linkPreview}>{shareUrl}</div>
                <div className={styles.actions}>
                  <button onClick={handleInvite} className="btn btn-cosmic btn-lg rounded-pill px-4">
                    {t('refer.inviteNow')}
                  </button>
                  <button onClick={handleCopyLink} className="btn btn-outline-light btn-lg rounded-pill px-4">
                    {t('refer.copyLink')}
                  </button>
                </div>
                {copyFeedback && <div className={styles.copyToast}>{copyFeedback}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h4 className={styles.modalTitle}>Invite Friends</h4>
            <p className={styles.modalSubtitle}>Share this referral link using QR, copy, or native share.</p>
            <img className={styles.qrImage} src={qrImageUrl} alt="Referral QR code" />
            <div className={styles.linkPreview}>{shareUrl}</div>
            <div className={styles.actions}>
              <button onClick={handleCopyLink} className="btn btn-outline-light rounded-pill px-4">
                {t('refer.copyLink')}
              </button>
              <button onClick={handleShare} className="btn btn-cosmic rounded-pill px-4">
                Share
              </button>
            </div>
            {copyFeedback && <div className={styles.copyToast}>{copyFeedback}</div>}
            <button
              type="button"
              className="btn btn-link text-light mt-2"
              onClick={() => setShowInviteModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReferBanner;
