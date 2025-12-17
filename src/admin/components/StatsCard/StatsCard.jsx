import styles from './StatsCard.module.css';

function StatsCard({ title, value, change, changeType, icon, color = 'primary' }) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <div className={styles.info}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.value}>{value}</div>
          {change !== undefined && (
            <div className={`${styles.change} ${styles[changeType] || ''}`}>
              <i className={`bi ${changeType === 'positive' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
              <span>{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`${styles.icon} ${styles[color]}`}>
            <i className={`bi ${icon}`}></i>
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;



