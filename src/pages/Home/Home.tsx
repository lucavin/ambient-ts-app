import { CrocEnv } from '@crocswap-libs/sdk';
import DividerDark from '../../components/Global/DividerDark/DividerDark';
import HomeSlider from '../../components/Home/Landing/HomeSlider';
import Stats from '../../components/Home/Stats/AmbientStats';
import TopPools from '../../components/Home/TopPools/TopPools';
import { TokenIF } from '../../utils/interfaces/exports';
import styles from './Home.module.css';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';
import Home1 from '../../components/Home/Landing/Home1';
import { topPoolsMethodsIF } from '../../App/hooks/useTopPools';

interface propsIF {
    isServerEnabled: boolean;
    crocEnv?: CrocEnv;
    cachedQuerySpotPrice: SpotPriceFn;
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    chainId: string;
    topPools: topPoolsMethodsIF;
}
export default function Home(props: propsIF) {
    const {
        isServerEnabled,
        tokenMap,
        lastBlockNumber,
        crocEnv,
        chainId,
        cachedQuerySpotPrice,
        topPools,
    } = props;

    const tradeData = useAppSelector((state) => state.tradeData);
    const userData = useAppSelector((state) => state.userData);

    return (
        <section data-testid={'home'} className={styles.home_container}>
            <HomeSlider />
            <div className={styles.pools_container}>
                <TopPools
                    isServerEnabled={isServerEnabled}
                    tradeData={tradeData}
                    userData={userData}
                    crocEnv={crocEnv}
                    cachedQuerySpotPrice={cachedQuerySpotPrice}
                    tokenMap={tokenMap}
                    lastBlockNumber={lastBlockNumber}
                    chainId={chainId}
                    topPools={topPools}
                />
                <DividerDark />
                <Stats
                    isServerEnabled={isServerEnabled}
                    lastBlockNumber={lastBlockNumber}
                    userData={userData}
                />
            </div>
            <DividerDark />
            <Home1 />
        </section>
    );
}
