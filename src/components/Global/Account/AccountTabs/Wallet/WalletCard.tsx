import { testTokenMap } from '../../../../../utils/data/testTokenMap';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import styles from './WalletCard.module.css';
import { useContext, useEffect, useState } from 'react';
import { ETH_ICON_URL, ZERO_ADDRESS } from '../../../../../constants';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../../../contexts/TokenContext';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import TokenIcon from '../../../TokenIcon/TokenIcon';

interface propsIF {
    token?: TokenIF;
    cachedFetchTokenPrice: TokenPriceFn;
}

export default function WalletCard(props: propsIF) {
    const { token, cachedFetchTokenPrice } = props;
    const {
        tokens: { getTokenByAddress },
    } = useContext(TokenContext);
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const tokenMapKey = token?.address?.toLowerCase() + '_' + chainId;

    const tokenFromMap = token?.address
        ? getTokenByAddress(token.address)
        : null;

    const [tokenPrice, setTokenPrice] = useState<{
        nativePrice?:
            | {
                  value: string;
                  decimals: number;
                  name: string;
                  symbol: string;
              }
            | undefined;
        usdPrice: number;
        exchangeAddress?: string | undefined;
        exchangeName?: string | undefined;
    }>();

    useEffect(() => {
        (async () => {
            try {
                const tokenAddress = tokenMapKey.split('_')[0];
                const chain = tokenMapKey.split('_')[1];
                const isChainMainnet = chain === '0x1';
                const mainnetAddress =
                    isChainMainnet && tokenAddress !== ZERO_ADDRESS
                        ? tokenMapKey.split('_')[0]
                        : testTokenMap.get(tokenMapKey)?.split('_')[0];
                if (mainnetAddress) {
                    const price = await cachedFetchTokenPrice(
                        mainnetAddress,
                        '0x1',
                    );
                    if (price) setTokenPrice(price);
                }
            } catch (err) {
                console.error(err);
            }
        })();
    }, [tokenMapKey]);

    const tokenUsdPrice = tokenPrice?.usdPrice ?? 0;

    const walletBalanceNum = token?.walletBalanceDisplay
        ? parseFloat(token?.walletBalanceDisplay)
        : 0;

    const walletBalanceTruncated =
        token && token.walletBalanceDisplayTruncated && walletBalanceNum !== 0
            ? token.walletBalanceDisplayTruncated
            : '0';

    const tokenImageSrc =
        tokenFromMap?.logoURI ?? token?.logoURI ?? ETH_ICON_URL;
    const tokenImageAlt = tokenFromMap?.symbol ?? token?.symbol ?? '???';

    const iconAndSymbolWithTooltip = (
        <DefaultTooltip
            interactive
            title={`${tokenFromMap?.symbol}: ${tokenFromMap?.address}`}
            disableHoverListener={tokenFromMap?.address === ZERO_ADDRESS}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.token_icon}>
                <TokenIcon src={tokenImageSrc} alt={tokenImageAlt} size='2xl' />
                <p className={styles.token_key}>{tokenImageAlt}</p>
            </div>
        </DefaultTooltip>
    );

    const tokenInfo = (
        <div className={styles.token_info}>
            {iconAndSymbolWithTooltip}
            <p>
                {tokenFromMap?.name
                    ? tokenFromMap?.name
                    : token?.name
                    ? token?.name
                    : '???'}
            </p>
        </div>
    );

    if (
        !token ||
        !tokenFromMap ||
        (token?.address !== ZERO_ADDRESS &&
            (!token.walletBalance || token.walletBalance === '0'))
    )
        return <></>;

    return (
        <div className={styles.wallet_row}>
            {tokenInfo}
            <p className={styles.value}>
                $
                {(tokenUsdPrice * walletBalanceNum).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </p>
            <p className={styles.amount}>{walletBalanceTruncated}</p>
        </div>
    );
}
