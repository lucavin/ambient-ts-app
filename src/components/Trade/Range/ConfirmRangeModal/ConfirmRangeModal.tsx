import Divider from '../../../Global/Divider/Divider';
import RangeStatus from '../../../Global/RangeStatus/RangeStatus';
import styles from './ConfirmRangeModal.module.css';
import SelectedRange from './SelectedRange/SelectedRange';
import { useState } from 'react';

interface ConfirmRangeModalProps {
    sendTransaction: () => void;
    onClose: () => void;
    // newSwapTransactionHash: string;
    // setNewSwapTransactionHash: React.Dispatch<React.SetStateAction<string>>;
}

export default function ConfirmRangeModal(props: ConfirmRangeModalProps) {
    const [confirmDetails, setConfirmDetails] = useState(true);
    const [transactionApproved, setTransactionApproved] = useState(false);

    const dataTokenA = {
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png',
        altText: 'Ethereum',
        shortName: 'ETH',
        qty: 0.0001,
    };
    const dataTokenB = {
        icon: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
        altText: 'dai',
        shortName: 'DAI',
        qty: 0.0898121212,
    };
    // RANGE HEADER DISPLAY

    const rangeHeader = (
        <section className={styles.position_display}>
            <div className={styles.token_display}>
                <div className={styles.tokens}>
                    <img src={dataTokenA.icon} alt={dataTokenA.altText} />
                    <img src={dataTokenB.icon} alt={dataTokenB.altText} />
                </div>
                <span className={styles.token_symbol}>
                    {dataTokenA.shortName}/{dataTokenB.shortName}
                </span>
            </div>
            <RangeStatus isInRange />
        </section>
    );
    // FEE TIER DISPLAY

    const feeTierDisplay = (
        <section className={styles.fee_tier_display}>
            <div className={styles.fee_tier_container}>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenA.icon} alt={dataTokenA.altText} />
                        <span>{dataTokenA.shortName}</span>
                    </div>
                    <span>{dataTokenA.qty}</span>
                </div>
                <div className={styles.detail_line}>
                    <div>
                        <img src={dataTokenB.icon} alt={dataTokenB.altText} />
                        <span>{dataTokenB.shortName}</span>
                    </div>
                    <span>{dataTokenB.qty}</span>
                </div>
                <Divider />
                <div className={styles.detail_line}>
                    <span>CURRENT FEE TIER</span>

                    <span>{0.05}%</span>
                </div>
            </div>
        </section>
    );

    return (
        <div className={styles.confirm_range_modal_container}>
            {rangeHeader}
            {feeTierDisplay}
            <SelectedRange />
        </div>
    );
}
