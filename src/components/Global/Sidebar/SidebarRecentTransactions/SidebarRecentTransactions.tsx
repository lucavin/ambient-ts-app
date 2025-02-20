// START: Import React and Dongles
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { SidebarContext } from '../../../../contexts/SidebarContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';

// START: Import Local Files
import { TransactionIF } from '../../../../utils/interfaces/exports';
import styles from './SidebarRecentTransactions.module.css';

// START: Import JSX Components
import SidebarRecentTransactionsCard from './SidebarRecentTransactionsCard';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../utils/hooks/useLinkGen';

interface propsIF {
    mostRecentTransactions: TransactionIF[];
}

export default function SidebarRecentTransactions(props: propsIF) {
    const { mostRecentTransactions } = props;

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        setCurrentTxActiveInTransactions,
        setShowAllData,
        setOutsideControl,
        setSelectedOutsideTab,
    } = useContext(TradeTableContext);
    const {
        sidebar: { close: closeSidebar },
    } = useContext(SidebarContext);

    const location = useLocation();

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenAccount: linkGenMethodsIF = useLinkGen('account');

    const onTradeRoute = location.pathname.includes('trade');
    const onAccountRoute = location.pathname.includes('account');

    const tabToSwitchToBasedOnRoute = onTradeRoute ? 0 : onAccountRoute ? 0 : 0;

    // TODO: should this redirect with a <Navigate /> element?
    function redirectBasedOnRoute() {
        if (onAccountRoute) return;
        linkGenAccount.navigate();
    }

    const handleCardClick = (tx: TransactionIF): void => {
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        setShowAllData(false);
        setCurrentTxActiveInTransactions(tx.txId);
        linkGenMarket.navigate({
            chain: chainId,
            tokenA: tx.base,
            tokenB: tx.quote,
        });
    };

    const handleViewMoreClick = (): void => {
        redirectBasedOnRoute();
        setOutsideControl(true);
        setSelectedOutsideTab(tabToSwitchToBasedOnRoute);
        closeSidebar();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>Pool</div>
                <div>Type</div>
                <div>Value</div>
            </header>
            <div className={styles.content}>
                {mostRecentTransactions.map((tx: TransactionIF) => (
                    <SidebarRecentTransactionsCard
                        key={
                            'Sidebar-Recent-Transactions-Card-' +
                            JSON.stringify(tx)
                        }
                        tx={tx}
                        handleClick={handleCardClick}
                    />
                ))}
            </div>
            {isUserConnected && (
                <div className={styles.view_more} onClick={handleViewMoreClick}>
                    View More
                </div>
            )}
        </div>
    );
}
