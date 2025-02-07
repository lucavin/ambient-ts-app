import TooltipComponent from '../../TooltipComponent/TooltipComponent';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import { RiExternalLinkLine } from 'react-icons/ri';

import styles from './TransactionDetailsSimplify.module.css';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';
import moment from 'moment';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface TransactionDetailsSimplifyPropsIF {
    tx: TransactionIF;
    isAccountView: boolean;
}
export default function TransactionDetailsSimplify(
    props: TransactionDetailsSimplifyPropsIF,
) {
    const { tx, isAccountView } = props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const {
        userNameToDisplay,
        txHashTruncated,
        txHash,
        blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        txUsdValueLocaleString,
        isDenomBase,
        baseQuantityDisplayLong,
        quoteQuantityDisplayLong,
        baseTokenAddress,
        quoteTokenAddress,

        truncatedLowDisplayPrice,
        truncatedHighDisplayPrice,
        truncatedDisplayPrice,
        truncatedLowDisplayPriceDenomByMoneyness,
        truncatedHighDisplayPriceDenomByMoneyness,
        truncatedDisplayPriceDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
    } = useProcessTransaction(tx, userAddress);

    const { chainData } = useContext(CrocEnvContext);

    const isAmbient = tx.positionType === 'ambient';

    const isBuy = tx.isBid || tx.isBuy;

    const isSwap = tx.entityType === 'swap' || tx.entityType === 'limitOrder';

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount
            ? '/account'
            : `/account/${ownerId}`;
        window.open(walletUrl);
    }
    function handleOpenExplorer() {
        if (txHash && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${txHash}`;
            window.open(explorerUrl);
        }
    }
    function handleOpenBaseAddress() {
        if (txHash && blockExplorer) {
            const adressUrl =
                baseTokenAddress === ZERO_ADDRESS
                    ? `${blockExplorer}address/${chainData.addrs.dex}`
                    : `${blockExplorer}token/${baseTokenAddress}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (txHash && blockExplorer) {
            const adressUrl = `${blockExplorer}token/${quoteTokenAddress}`;
            window.open(adressUrl);
        }
    }
    const txContent = (
        <div
            className={styles.link_row}
            onClick={handleOpenExplorer}
            style={{ cursor: 'pointer' }}
        >
            <p>{txHashTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    const walletContent = (
        <div
            className={styles.link_row}
            onClick={handleOpenWallet}
            style={{ cursor: 'pointer' }}
        >
            <p>{userNameToDisplay}</p>
            <RiExternalLinkLine />
        </div>
    );

    const baseAddressContent = (
        <div
            onClick={handleOpenBaseAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{baseTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );
    const quoteAddressContent = (
        <div
            onClick={handleOpenQuoteAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{quoteTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    IS_LOCAL_ENV && console.debug({ tx });
    const changeType = tx.changeType;
    const positionType = tx.positionType;
    const entityType = tx.entityType;

    const changeTypeDisplay =
        changeType === 'mint'
            ? entityType === 'limitOrder'
                ? 'Add to Limit'
                : positionType === 'concentrated'
                ? 'Add to Range Position'
                : 'Add to Ambient Position'
            : changeType === 'burn'
            ? entityType === 'limitOrder'
                ? 'Remove from Limit'
                : positionType === 'concentrated'
                ? 'Removal from Range Position'
                : positionType === 'ambient'
                ? 'Removal from Ambient Position'
                : 'Market'
            : changeType === 'recover'
            ? 'Claim from Limit'
            : 'Market';

    // Create a data array for the info and map through it here
    const infoContent = [
        {
            title: 'Transaction Type ',
            content: (
                <div style={{ cursor: 'default' }}>{changeTypeDisplay}</div>
            ),
            explanation: 'Transaction type explanation',
        },

        {
            title: 'Wallet ',
            content: walletContent,
            explanation: 'The account of the transaction owner',
        },

        {
            title: 'Transaction ',
            content: txContent,
            explanation: 'The transaction hash',
        },

        {
            title: 'Time ',
            content: (
                <div style={{ cursor: 'default' }}>
                    {moment(tx.txTime * 1000).format('MM/DD/YYYY HH:mm')}
                </div>
            ),
            explanation: 'The transaction confirmation time',
        },

        {
            title: isSwap ? 'From Token ' : 'Token 1 ',
            content: (
                <div style={{ cursor: 'default' }}>
                    {isBuy ? baseTokenSymbol : quoteTokenSymbol}
                </div>
            ),
            explanation: 'The symbol (short name) of the sell token',
        },

        {
            title: isSwap ? 'From Address ' : 'Token 1 Address',
            content: isBuy ? baseAddressContent : quoteAddressContent,
            explanation: 'Address of the From/Sell Token',
        },

        {
            title: isSwap ? 'From Qty ' : 'Token 1 Qty',
            content: (
                <div style={{ cursor: 'default' }}>
                    {isBuy
                        ? `${baseQuantityDisplayLong}${baseTokenSymbol}`
                        : `${quoteQuantityDisplayLong}${quoteTokenSymbol}`}
                </div>
            ),
            explanation:
                'The quantity of the sell token (scaled by its decimals value)',
        },

        {
            title: isSwap ? 'To Token ' : 'Token 2 ',
            content: !isBuy ? baseTokenSymbol : quoteTokenSymbol,
            explanation: 'The symbol (short name) of the buy token',
        },

        {
            title: isSwap ? 'To Address ' : 'Token 2 Address',
            content: !isBuy ? baseAddressContent : quoteAddressContent,
            explanation: 'Address of the To/Buy Token',
        },

        {
            title: isSwap ? 'To Qty ' : 'Token 2 Qty ',
            content: (
                <div style={{ cursor: 'default' }}>
                    {!isBuy
                        ? `${baseQuantityDisplayLong} ${baseTokenSymbol}`
                        : `${quoteQuantityDisplayLong} ${quoteTokenSymbol}`}
                </div>
            ),
            explanation:
                'The quantity of the to/buy token (scaled by its decimals value)',
        },
        {
            title: isSwap ? 'Price ' : 'Low Price Boundary',
            content: (
                <div style={{ cursor: 'default' }}>
                    {isSwap
                        ? isAccountView
                            ? isBaseTokenMoneynessGreaterOrEqual
                                ? `1 ${quoteTokenSymbol} = ${truncatedDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                                : `1 ${baseTokenSymbol} = ${truncatedDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                            : isDenomBase
                            ? `1 ${baseTokenSymbol} = ${truncatedDisplayPrice} ${quoteTokenSymbol}`
                            : `1 ${quoteTokenSymbol} = ${truncatedDisplayPrice} ${baseTokenSymbol}`
                        : isAccountView
                        ? isBaseTokenMoneynessGreaterOrEqual
                            ? `1 ${quoteTokenSymbol} = ${truncatedLowDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                            : `1 ${baseTokenSymbol} = ${truncatedLowDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                        : isAmbient
                        ? '0.00'
                        : isDenomBase
                        ? `1 ${baseTokenSymbol} = ${truncatedLowDisplayPrice} ${quoteTokenSymbol}`
                        : `1 ${quoteTokenSymbol} = ${truncatedLowDisplayPrice} ${baseTokenSymbol}`}
                </div>
            ),
            explanation: isSwap
                ? 'The transaction price'
                : 'The low price boundary',
        },

        // {
        //     title: 'Liquidity Provider Fee ',
        //     content: 'liquidity fee',
        //     explanation: 'this is explanation',
        // },

        // { title: 'Network Fee ', content: 'network fee', explanation: 'this is explanation' },
    ];

    if (isSwap) {
        infoContent.push({
            title: 'Value ',
            content: (
                <div style={{ cursor: 'default' }}>
                    {txUsdValueLocaleString}
                </div>
            ),
            explanation: 'The appoximate US dollar value of the transaction',
        });
    } else {
        infoContent.push(
            {
                title: 'High Price Boundary',
                content: isAccountView
                    ? isBaseTokenMoneynessGreaterOrEqual
                        ? `1 ${quoteTokenSymbol} = ${truncatedHighDisplayPriceDenomByMoneyness} ${baseTokenSymbol}`
                        : `1 ${baseTokenSymbol} = ${truncatedHighDisplayPriceDenomByMoneyness} ${quoteTokenSymbol}`
                    : isAmbient
                    ? '∞'
                    : isDenomBase
                    ? `1 ${baseTokenSymbol} = ${truncatedHighDisplayPrice} ${quoteTokenSymbol}`
                    : `1 ${quoteTokenSymbol} = ${truncatedHighDisplayPrice} ${baseTokenSymbol}`,
                explanation: 'The high price boundary',
            },
            {
                title: 'Value ',
                content: (
                    <div style={{ cursor: 'default' }}>
                        {txUsdValueLocaleString}
                    </div>
                ),
                explanation:
                    'The appoximate US dollar value of the transaction',
            },
        );
    }

    function InfoRow(props: ItemRowPropsIF) {
        const { title, content, explanation } = props;

        return (
            <div className={styles.info_row_container}>
                <div className={styles.title_container}>
                    <p>{title}</p>
                    <TooltipComponent title={explanation} placement={'right'} />
                </div>

                <div>{content}</div>
            </div>
        );
    }

    return (
        <div className={styles.tx_details_container}>
            <div className={styles.info_content}>
                {infoContent.map((info, idx) => (
                    <InfoRow
                        key={info.title + idx}
                        title={info.title}
                        content={info.content}
                        explanation={info.explanation}
                    />
                ))}
            </div>
        </div>
    );
}
