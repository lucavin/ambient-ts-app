/* eslint-disable @typescript-eslint/no-explicit-any */
// START: Import React and Dongles
import { Dispatch, SetStateAction, ReactNode, useEffect, useState } from 'react';
import { useParams, Outlet, useOutletContext, Link, NavLink, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { ChainSpec, CrocEnv, CrocPoolView } from '@crocswap-libs/sdk';
import { VscClose } from 'react-icons/vsc';

// START: Import JSX Components
import TradeCharts from './TradeCharts/TradeCharts';
import TradeTabs2 from '../../components/Trade/TradeTabs/TradeTabs2';
// START: Import Local Files
import styles from './Trade.module.css';
import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
import {
    tradeData as TradeDataIF,
    setAdvancedMode
} from '../../utils/state/tradeDataSlice';
import { CandleData, CandlesByPoolAndDuration } from '../../utils/state/graphDataSlice';
import { PoolIF, TokenIF, TokenPairIF } from '../../utils/interfaces/exports';
import { useUrlParams } from './useUrlParams';
import NoTokenIcon from '../../components/Global/NoTokenIcon/NoTokenIcon';
import TradeSettingsColor from './TradeCharts/TradeSettings/TradeSettingsColor/TradeSettingsColor';
import { SpotPriceFn } from '../../App/functions/querySpotPrice';
import useMediaQuery from '../../utils/hooks/useMediaQuery';

// interface for React functional component props
interface propsIF {
    pool: CrocPoolView | undefined;
    // poolPriceTick: number | undefined;
    isUserLoggedIn: boolean | undefined;
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    candleData: CandlesByPoolAndDuration | undefined;
    baseTokenAddress: string;
    quoteTokenAddress: string;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    account: string;
    lastBlockNumber: number;
    isTokenABase: boolean;
    poolPriceDisplay?: number;
    tokenMap: Map<string, TokenIF>;
    tokenPair: TokenPairIF;
    chainId: string;
    chainData: ChainSpec;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    setLimitRate: Dispatch<SetStateAction<string>>;

    limitRate: string;
    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;

    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    openGlobalModal: (content: ReactNode) => void;
    closeGlobalModal: () => void;
    isInitialized: boolean;
    poolPriceNonDisplay: number | undefined;
    importedTokens: TokenIF[];
    poolExists: boolean | undefined;
    showSidebar: boolean;
    setTokenPairLocal: Dispatch<SetStateAction<string[] | null>>;
    handlePulseAnimation: (type: string) => void;
    // handleTxCopiedClick: () => void;
    // handleOrderCopiedClick: () => void;
    // handleRangeCopiedClick: () => void;
    isCandleSelected: boolean | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;

    fullScreenChart: boolean;
    setFullScreenChart: Dispatch<SetStateAction<boolean>>;
    cachedQuerySpotPrice: SpotPriceFn;
    fetchingCandle: boolean;
    setFetchingCandle: React.Dispatch<React.SetStateAction<boolean>>;
    isCandleDataNull: boolean;
    setIsCandleDataNull: React.Dispatch<React.SetStateAction<boolean>>;
    minPrice: number;
    maxPrice: number;
    rescaleRangeBoundariesWithSlider: boolean;
    seRescaleRangeBoundariesWithSlider: React.Dispatch<React.SetStateAction<boolean>>;
}

// React functional component
export default function Trade(props: propsIF) {
    const {
        pool,
        cachedQuerySpotPrice,
        // poolPriceTick,
        isUserLoggedIn,
        crocEnv,
        candleData,
        chainId,
        chainData,
        tokenMap,
        poolPriceDisplay,
        provider,
        lastBlockNumber,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        favePools,
        addPoolToFaves,
        removePoolFromFaves,
        isInitialized,
        importedTokens,
        expandTradeTable,
        setExpandTradeTable,
        isShowAllEnabled,
        setIsShowAllEnabled,
        isTokenABase,
        poolPriceNonDisplay,
        account,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        poolExists,
        setTokenPairLocal,
        showSidebar,
        handlePulseAnimation,
        // handleTxCopiedClick,
        // handleOrderCopiedClick,
        // handleRangeCopiedClick,

        setOutsideControl,
        setSelectedOutsideTab,
        isCandleSelected,
        setIsCandleSelected,

        fullScreenChart,
        setFullScreenChart,
        fetchingCandle,
        setFetchingCandle,
        isCandleDataNull,
        minPrice,
        maxPrice,
        rescaleRangeBoundariesWithSlider,
        seRescaleRangeBoundariesWithSlider,
    } = props;

    const dispatch = useAppDispatch();

    const [
        tokenPairFromParams,
        tickPairFromParams,
        limitTickFromParams
    ] = useUrlParams(chainId, isInitialized);

    console.log({tickPairFromParams});

    if (!tickPairFromParams.includes(0)) {
        dispatch(setAdvancedMode(true));
    }

    useEffect(() => {
        setTokenPairLocal && setTokenPairLocal(tokenPairFromParams);
    }, [tokenPairFromParams]);
    const { params } = useParams();

    const [transactionFilter, setTransactionFilter] = useState<CandleData>();
    const [isCandleArrived, setIsCandleDataArrived] = useState(false);

    const navigate = useNavigate();

    const routes = [
        {
            path: '/market',
            name: 'Market',
        },
        {
            path: '/limit',
            name: 'Limit',
        },
        {
            path: '/range',
            name: 'Range',
        },
    ];

    useEffect(() => {
        if (
            isCandleDataNull &&
            props.candleData !== undefined &&
            props.candleData.candles?.length > 0
        ) {
            console.log('Data arrived');
            setIsCandleDataArrived(false);
        }
    }, [props.candleData]);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const { tradeData, graphData } = useAppSelector((state) => state);
    const {
        isDenomBase,
        limitTick,
        advancedMode,
        simpleRangeWidth,
        activeChartPeriod,
        pinnedMaxPriceDisplayTruncated,
        pinnedMinPriceDisplayTruncated,
    } = tradeData;
    const baseTokenLogo = isDenomBase ? tradeData.baseToken.logoURI : tradeData.quoteToken.logoURI;
    const quoteTokenLogo = isDenomBase ? tradeData.quoteToken.logoURI : tradeData.baseToken.logoURI;

    const baseTokenSymbol = isDenomBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol;
    const quoteTokenSymbol = isDenomBase ? tradeData.quoteToken.symbol : tradeData.baseToken.symbol;

    const indexOfPoolInLiqData = graphData?.liquidityForAllPools.pools.findIndex(
        (pool) =>
            pool.pool.baseAddress.toLowerCase() === tradeData.baseToken.address.toLowerCase() &&
            pool.pool.quoteAddress.toLowerCase() === tradeData.quoteToken.address.toLowerCase() &&
            pool.pool.poolIdx === chainData.poolIndex &&
            pool.pool.chainId === chainData.chainId,
    );

    const activePoolLiquidityData = graphData?.liquidityForAllPools?.pools[indexOfPoolInLiqData];

    const [liquidityData, setLiquidityData] = useState<any>(activePoolLiquidityData?.liquidityData);
    //    const liquidityData = activePoolLiquidityData?.liquidityData;

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : 0;

    const navigationMenu = (
        <div className={styles.navigation_menu}>
            {routes.map((route, idx) => (
                <div className={`${styles.nav_container} trade_route`} key={idx}>
                    <NavLink to={`/trade${route.path}/${params}`}>{route.name}</NavLink>
                </div>
            ))}
        </div>
    );

    useEffect(() => {
        setLiquidityData(undefined);
    }, [pool?.baseToken, pool?.quoteToken]);

    useEffect(() => {
        setLiquidityData(activePoolLiquidityData?.liquidityData);
    }, [activePoolLiquidityData]);
    const [activeMobileComponent, setActiveMobileComponent] = useState('trade');

    const mainContent = (
        <div
            className={`${styles.right_col} ${
                activeMobileComponent !== 'trade' ? styles.hide : ''
            }`}
        >
            <Outlet
                context={{
                    tradeData: tradeData,
                    navigationMenu: navigationMenu,
                    tickPairFromParams: tickPairFromParams,
                    limitTickFromParams: limitTickFromParams
                }}
            />
        </div>
    );
    const expandGraphStyle = expandTradeTable ? styles.hide_graph : '';
    const fullScreenStyle = fullScreenChart ? styles.chart_full_screen : styles.main__chart;

    const [hasInitialized, setHasInitialized] = useState(false);

    const changeState = (isOpen: boolean | undefined, candleData: CandleData | undefined) => {
        setIsCandleSelected(isOpen);

        setHasInitialized(false);
        // if (isOpen && isShowAllEnabled) {
        //     setIsShowAllEnabled(false);
        // } else if (!isOpen && !isShowAllEnabled) {
        //     console.log('setting to show all');
        //     setIsShowAllEnabled(true);
        // }
        // setIsShowAllEnabled(!isOpen);
        setTransactionFilter(candleData);
        if (isOpen) {
            setOutsideControl(true);
            setSelectedOutsideTab(0);
        }
    };
    const [chartBg, setChartBg] = useState('transparent');

    const [upBodyColorPicker, setUpBodyColorPicker] = useState<boolean>(false);
    const [upBorderColorPicker, setUpBorderColorPicker] = useState<boolean>(false);
    const [downBodyColorPicker, setDownBodyColorPicker] = useState<boolean>(false);
    const [downBorderColorPicker, setDownBorderColorPicker] = useState<boolean>(false);

    // const [upBodyColor] = useState<string>('#CDC1FF');
    // const [upBorderColor] = useState<string>('#CDC1FF');
    // const [downBodyColor] = useState<string>('#171D27');
    // const [downBodyColor] = useState<string>('#24243e');
    // const [downBorderColor] = useState<string>('#7371FC');
    const [upBodyColor, setUpBodyColor] = useState<string>('#CDC1FF');
    const [upBorderColor, setUpBorderColor] = useState<string>('#CDC1FF');
    const [downBodyColor, setDownBodyColor] = useState<string>('#24243e');
    const [downBorderColor, setDownBorderColor] = useState<string>('#7371FC');
    const [upVolumeColor] = useState<string>('rgba(205,193,255, 0.8)');
    const [downVolumeColor] = useState<string>('rgba(115,113,252, 0.8)');

    // const [upBodyColor, setUpBodyColor] = useState<string>('#CDC1FF');
    // const [upBorderColor, setUpBorderColor] = useState<string>('#CDC1FF');
    // const [downBodyColor, setDownBodyColor] = useState<string>('#24243e');
    // const [downBorderColor, setDownBorderColor] = useState<string>('#7371FC');

    // console.log({ upBodyColor });
    // console.log({ upBorderColor });
    // console.log({ downBodyColor });
    // console.log({ downBorderColor });

    const handleChartBgColorPickerChange = (color: any) => {
        setChartBg(color.hex);
    };
    const handleBodyColorPickerChange = (color: any) => {
        setUpBodyColor(color.hex);
    };
    const handleBorderColorPickerChange = (color: any) => {
        setUpBorderColor(color.hex);
    };
    const handleDownBodyColorPickerChange = (color: any) => {
        setDownBodyColor(color.hex);
    };
    const handleDownBorderColorPickerChange = (color: any) => {
        setDownBorderColor(color.hex);
    };
    const tradeSettingsColorProps = {
        upBodyColorPicker: upBodyColorPicker,
        setUpBodyColorPicker: setUpBodyColorPicker,
        upBodyColor: upBodyColor,
        handleBodyColorPickerChange: handleBodyColorPickerChange,
        handleBorderColorPickerChange: handleBorderColorPickerChange,
        handleDownBodyColorPickerChange: handleDownBodyColorPickerChange,
        handleDownBorderColorPickerChange: handleDownBorderColorPickerChange,
        setUpBorderColorPicker: setUpBorderColorPicker,
        setDownBodyColorPicker: setDownBodyColorPicker,
        setDownBorderColorPicker: setDownBorderColorPicker,
        upBorderColor: upBorderColor,
        upBorderColorPicker: upBorderColorPicker,
        downBodyColor: downBodyColor,
        downBodyColorPicker: downBodyColorPicker,
        downBorderColor: downBorderColor,
        downBorderColorPicker: downBorderColorPicker,
        chartBg: chartBg,
        setChartBg: setChartBg,
        handleChartBgColorPickerChange: handleChartBgColorPickerChange,
    };

    // const [showChartAndNotTab, setShowChartAndNotTab] = useState(false);

    const mobileDataToggle = (
        <div className={styles.mobile_toggle_container}>
            <button
                onClick={() => setActiveMobileComponent('trade')}
                className={
                    activeMobileComponent === 'trade'
                        ? styles.active_button_mobile_toggle
                        : styles.non_active_button_mobile_toggle
                }
            >
                Trade
            </button>
            {!isCandleDataNull && (
                <button
                    onClick={() => setActiveMobileComponent('chart')}
                    className={
                        activeMobileComponent === 'chart'
                            ? styles.active_button_mobile_toggle
                            : styles.non_active_button_mobile_toggle
                    }
                >
                    Chart
                </button>
            )}
            <button
                onClick={() => setActiveMobileComponent('transactions')}
                className={
                    activeMobileComponent === 'transactions'
                        ? styles.active_button_mobile_toggle
                        : styles.non_active_button_mobile_toggle
                }
            >
                Transactions
            </button>
        </div>
    );

    const [activeTimeFrame, setActiveTimeFrame] = useState(
        activeChartPeriod === 60
            ? '1m'
            : activeChartPeriod === 300
            ? '5m'
            : activeChartPeriod === 900
            ? '15m'
            : activeChartPeriod === 3600
            ? '1h'
            : activeChartPeriod === 14400
            ? '4h'
            : '1d',
    );

    const unselectCandle = () => {
        setSelectedDate(undefined);
        changeState(false, undefined);
        setIsCandleSelected(false);
    };

    useEffect(() => {
        unselectCandle();
    }, [activeTimeFrame, tradeData.baseToken.name, tradeData.quoteToken.name]);

    const initLinkPath =
        '/initpool/chain=0x5&tokenA=' + baseTokenAddress + '&tokenB=' + quoteTokenAddress;

    const poolNotInitializedContent =
        poolExists === false ? (
            <div className={styles.pool_not_initialialized_container}>
                <div className={styles.pool_not_initialialized_content}>
                    <div className={styles.close_init} onClick={() => navigate(-1)}>
                        <VscClose size={25} />
                    </div>
                    <h2>This pool has not been initialized.</h2>
                    <h3>Do you want to initialize it?</h3>
                    <Link to={initLinkPath} className={styles.initialize_link}>
                        Initialize Pool
                        {baseTokenLogo ? (
                            <img src={baseTokenLogo} alt={baseTokenSymbol} />
                        ) : (
                            <NoTokenIcon tokenInitial={baseTokenSymbol.charAt(0)} width='20px' />
                        )}
                        {quoteTokenLogo ? (
                            <img src={quoteTokenLogo} alt={quoteTokenSymbol} />
                        ) : (
                            <NoTokenIcon tokenInitial={quoteTokenSymbol.charAt(0)} width='20px' />
                        )}
                    </Link>
                    <button className={styles.no_thanks} onClick={() => navigate(-1)}>
                        No, take me back.
                    </button>
                </div>
            </div>
        ) : null;

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<string | undefined>();
    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<boolean>(true);

    // const expandTableHeightStyle = expandTradeTable ? styles.full_height : styles.min_height;

    const showActiveMobileComponent = useMediaQuery('(max-width: 1200px)');

    const tradeChartsProps = {
        isUserLoggedIn: isUserLoggedIn,
        pool: pool,
        chainData: chainData,
        poolPriceDisplay: poolPriceDisplayWithDenom,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        isTokenABase: isTokenABase,
        fullScreenChart: fullScreenChart,
        setFullScreenChart: setFullScreenChart,
        changeState: changeState,
        candleData: candleData,
        liquidityData: liquidityData,
        lastBlockNumber: lastBlockNumber,
        chainId: chainId,
        limitTick: limitTick,
        favePools: favePools,
        addPoolToFaves: addPoolToFaves,
        removePoolFromFaves: removePoolFromFaves,
        isAdvancedModeActive: advancedMode,
        simpleRangeWidth: simpleRangeWidth,
        pinnedMinPriceDisplayTruncated: pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated: pinnedMaxPriceDisplayTruncated,
        upBodyColor: upBodyColor,
        upBorderColor: upBorderColor,
        downBodyColor: downBodyColor,
        downBorderColor: downBorderColor,
        upVolumeColor: upVolumeColor,
        downVolumeColor: downVolumeColor,
        baseTokenAddress: baseTokenAddress,
        poolPriceNonDisplay: poolPriceNonDisplay,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        activeTimeFrame: activeTimeFrame,
        setActiveTimeFrame: setActiveTimeFrame,
        handlePulseAnimation: handlePulseAnimation,
        poolPriceChangePercent: poolPriceChangePercent,
        setPoolPriceChangePercent: setPoolPriceChangePercent,
        isPoolPriceChangePositive: isPoolPriceChangePositive,
        setIsPoolPriceChangePositive: setIsPoolPriceChangePositive,
        fetchingCandle: fetchingCandle,
        setFetchingCandle: setFetchingCandle,
        minPrice: minPrice,
        maxPrice: maxPrice,
        rescaleRangeBoundariesWithSlider: rescaleRangeBoundariesWithSlider,
        seRescaleRangeBoundariesWithSlider: seRescaleRangeBoundariesWithSlider,
        TradeSettingsColor: <TradeSettingsColor {...tradeSettingsColorProps} />,
    };

    const tradeTabsProps = {
        cachedQuerySpotPrice: cachedQuerySpotPrice,
        isUserLoggedIn: isUserLoggedIn,
        isTokenABase: isTokenABase,
        crocEnv: crocEnv,
        provider: provider,
        account: account,
        lastBlockNumber: lastBlockNumber,
        chainId: chainId,
        chainData: chainData,
        currentTxActiveInTransactions: currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        isShowAllEnabled: isShowAllEnabled,
        setIsShowAllEnabled: setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        tokenMap: tokenMap,
        isCandleSelected: isCandleSelected,
        setIsCandleSelected: setIsCandleSelected,
        filter: transactionFilter,
        setTransactionFilter: setTransactionFilter,
        selectedOutsideTab: props.selectedOutsideTab,
        setSelectedOutsideTab: props.setSelectedOutsideTab,
        outsideControl: props.outsideControl,
        setOutsideControl: props.setOutsideControl,
        currentPositionActive: props.currentPositionActive,
        setCurrentPositionActive: props.setCurrentPositionActive,
        openGlobalModal: props.openGlobalModal,
        closeGlobalModal: props.closeGlobalModal,
        importedTokens: importedTokens,
        showSidebar: showSidebar,
        handlePulseAnimation: handlePulseAnimation,
        changeState: changeState,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        hasInitialized: hasInitialized,
        setHasInitialized: setHasInitialized,
        activeTimeFrame: activeTimeFrame,
        unselectCandle: unselectCandle,
        favePools: favePools,
        addPoolToFaves: addPoolToFaves,
        removePoolFromFaves: removePoolFromFaves,
        poolPriceDisplay: poolPriceDisplayWithDenom,
        poolPriceChangePercent: poolPriceChangePercent,
        setPoolPriceChangePercent: setPoolPriceChangePercent,
        isPoolPriceChangePositive: isPoolPriceChangePositive,
        setIsPoolPriceChangePositive: setIsPoolPriceChangePositive,

        isCandleDataNull: isCandleDataNull,
        isCandleArrived: isCandleArrived,
        setIsCandleDataArrived: setIsCandleDataArrived,
    };

    const mobileTrade = (
        <section
            className={styles.main_layout_mobile}
            style={{
                height: 'calc(100vh - 8rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
            }}
        >
            {poolNotInitializedContent}
            {mobileDataToggle}
            {activeMobileComponent === 'chart' && (
                <div className={` ${fullScreenStyle}`} style={{ marginLeft: '2rem' }}>
                    {!isCandleDataNull && (
                        <TradeCharts
                            // poolPriceTick={poolPriceTick}
                            {...tradeChartsProps}
                        />
                    )}
                </div>
            )}

            {activeMobileComponent === 'transactions' && (
                <div className={styles.full_table_height} style={{ marginLeft: '2rem' }}>
                    <TradeTabs2 {...tradeTabsProps} />
                </div>
            )}

            {activeMobileComponent === 'trade' && (
                <Outlet context={{ tradeData: tradeData, navigationMenu: navigationMenu }} />
            )}
        </section>
    );
    if (showActiveMobileComponent) return mobileTrade;

    return (
        <section className={styles.main_layout}>
            <div className={`${styles.middle_col} ${expandTradeTable ? styles.flex_column : ''}`}>
                {poolNotInitializedContent}
                {/* {mobileDataToggle} */}
                <div
                    className={` ${expandGraphStyle} ${
                        activeMobileComponent !== 'chart' ? styles.hide : ''
                    } ${fullScreenStyle}`}
                    style={{
                        background: chartBg,
                    }}
                >
                    <div className={styles.main__chart_container}>
                        {!isCandleDataNull && (
                            <TradeCharts
                                // poolPriceTick={poolPriceTick}
                                {...tradeChartsProps}
                            />
                        )}
                    </div>
                </div>

                <motion.div
                    className={
                        expandTradeTable ? styles.full_table_height : styles.min_table_height
                    }
                >
                    <div className={activeMobileComponent !== 'transactions' ? styles.hide : ''}>
                        <TradeTabs2 {...tradeTabsProps} />
                    </div>
                </motion.div>
            </div>
            {mainContent}
        </section>
    );
}

type ContextType = {
    tradeData: TradeDataIF;
    navigationMenu: JSX.Element;
    tickPairFromParams: Array<number|null>;
    limitTickFromParams: number|null;
};

export function useTradeData() {
    return useOutletContext<ContextType>();
}
