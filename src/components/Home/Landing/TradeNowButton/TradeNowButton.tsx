import styles from './TradeNowButton.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
interface Props {
    inNav?: boolean;
}
export default function TradeNowButton(props: Props) {
    const { inNav } = props;
    const { t } = useTranslation();

    return (
        <Link
            to={'/trade/market'}
            tabIndex={0}
            aria-label='Go to trade page button'
            className={`${styles.action_button} ${
                inNav && styles.nav_action_button
            }`}
        >
            <div className={styles.content_container}>
                <p
                    className={`${styles.button_text} ${
                        inNav && styles.nav_button_text
                    }`}
                >
                    {t('marketCTA')}
                </p>
            </div>
        </Link>
    );
}
