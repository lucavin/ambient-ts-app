import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import {
    setTokenA,
    setTokenB,
    setIsTokenAPrimary,
    setPrimaryQuantity,
} from '../../../utils/state/tradeDataSlice';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import TokensArrow from '../../Global/TokensArrow/TokensArrow';
import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { calcImpact } from '../../../App/functions/calcImpact';
interface CurrencyConverterPropsIF {
    provider: ethers.providers.Provider | undefined;
    slippageTolerancePercentage: number;
    isSellTokenBase: boolean;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    isLiq: boolean;
    poolPriceDisplay: number | undefined;
    isTokenAPrimary: boolean;
    nativeBalance: string;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    tokenAInputQty: string;
    tokenBInputQty: string;
    setTokenAInputQty: Dispatch<SetStateAction<string>>;
    setTokenBInputQty: Dispatch<SetStateAction<string>>;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    setSwapAllowed: Dispatch<SetStateAction<boolean>>;
    setSwapButtonErrorMessage: Dispatch<SetStateAction<string>>;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

export default function CurrencyConverter(props: CurrencyConverterPropsIF) {
    const {
        provider,
        slippageTolerancePercentage,
        tokenPair,
        // isSellTokenBase,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        isLiq,
        poolPriceDisplay,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        setSwapAllowed,
        baseTokenBalance,
        quoteTokenBalance,
        setSwapButtonErrorMessage,
        setTokenAInputQty,
        setTokenBInputQty,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
    } = props;

    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isSellTokenBase = tradeData.baseToken.address === tradeData.tokenA.address;

    const [isTokenAPrimaryLocal, setIsTokenAPrimaryLocal] = useState<boolean>(
        tradeData.isTokenAPrimary,
    );
    const [tokenAQtyLocal, setTokenAQtyLocal] = useState<string>(
        isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );
    const [tokenBQtyLocal, setTokenBQtyLocal] = useState<string>(
        !isTokenAPrimaryLocal ? tradeData?.primaryQuantity : '',
    );

    const tokenABalance = isSellTokenBase ? baseTokenBalance : quoteTokenBalance;
    const tokenBBalance = isSellTokenBase ? quoteTokenBalance : baseTokenBalance;

    // const tokenADecimals = tokenPair.dataTokenA.decimals;
    // const tokenBDecimals = tokenPair.dataTokenB.decimals;

    useEffect(() => {
        if (tradeData) {
            if (tradeData.isTokenAPrimary) {
                setTokenAQtyLocal(tradeData.primaryQuantity);
                setTokenAInputQty(tradeData.primaryQuantity);
                const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
                if (sellQtyField) {
                    sellQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            } else {
                setTokenBQtyLocal(tradeData.primaryQuantity);
                const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
                if (buyQtyField) {
                    buyQtyField.value =
                        tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                }
            }
        }
    }, []);

    const handleArrowClick = (): void => {
        reverseTokens();
    };

    const reverseTokens = (): void => {
        if (tokenPair) {
            dispatch(setTokenA(tokenPair.dataTokenB));
            dispatch(setTokenB(tokenPair.dataTokenA));
        }
        if (!isTokenAPrimaryLocal) {
            setTokenAQtyLocal(tokenBQtyLocal);
            setTokenAInputQty(tokenBQtyLocal);
            const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
            if (sellQtyField) {
                sellQtyField.value = tokenBQtyLocal === 'NaN' ? '' : tokenBQtyLocal;
            }
        } else {
            setTokenBQtyLocal(tokenAQtyLocal);
            setTokenBInputQty(tokenAQtyLocal);
            const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
            if (buyQtyField) {
                buyQtyField.value = tokenAQtyLocal === 'NaN' ? '' : tokenAQtyLocal;
            }
        }
        setIsTokenAPrimaryLocal(!isTokenAPrimaryLocal);
        dispatch(setIsTokenAPrimary(!isTokenAPrimaryLocal));
    };

    useEffect(() => {
        isTokenAPrimaryLocal ? handleTokenAChangeEvent() : handleTokenBChangeEvent();
    }, [poolPriceDisplay, isSellTokenBase, isTokenAPrimaryLocal, tokenABalance]);

    const handleSwapButtonMessage = (tokenAAmount: number) => {
        if (poolPriceDisplay === 0 || poolPriceDisplay === Infinity) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Invalid Token Pair');
        } else if (tokenAAmount > parseFloat(tokenABalance)) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage(
                `${tokenPair.dataTokenA.symbol} Amount Exceeds Wallet Balance`,
            );
        }
        // else if (parseInt(tokenAAllowance) < tokenAAmount) {
        //     setSwapAllowed(false);
        //     setSwapButtonErrorMessage(`${tokenPair.dataTokenA.symbol} Amount Exceeds Allowance`);
        // }
        else if (isNaN(tokenAAmount) || tokenAAmount <= 0) {
            setSwapAllowed(false);
            setSwapButtonErrorMessage('Enter an Amount');
        } else {
            setSwapAllowed(true);
        }
    };

    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();

    useEffect(() => {
        (async () => {
            if (!provider) {
                return;
            } else {
                setCrocEnv(new CrocEnv(provider));
            }
        })();
    }, [provider]);

    const handleTokenAChangeEvent = async (evt?: ChangeEvent<HTMLInputElement>) => {
        if (!poolPriceDisplay) return;
        if (!crocEnv) return;
        let rawTokenBQty;

        if (evt) {
            const input = evt.target.value;
            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));

            const impact =
                input !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          input,
                      )
                    : undefined;

            // console.log({ impact });

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;

            // rawTokenBQty = isSellTokenBase
            //     ? (1 / poolPriceDisplay) * parseFloat(input)
            //     : poolPriceDisplay * parseFloat(input);
        } else {
            handleSwapButtonMessage(parseFloat(tokenAQtyLocal));

            const impact =
                tokenAQtyLocal !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          tokenAQtyLocal,
                      )
                    : undefined;

            // console.log({ impact });

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;

            // rawTokenBQty = isSellTokenBase
            //     ? (1 / poolPriceDisplay) * parseFloat(tokenAQtyLocal)
            //     : poolPriceDisplay * parseFloat(tokenAQtyLocal);
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 100000
                ? rawTokenBQty.toPrecision(6)
                : truncateDecimals(rawTokenBQty, 0)
            : '';
        // const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        setTokenBQtyLocal(truncatedTokenBQty);
        setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
    };

    const handleTokenAChangeClick = async (value: string) => {
        if (!poolPriceDisplay) return;
        if (!crocEnv) return;
        let rawTokenBQty;
        const tokenAInputField = document.getElementById('sell-quantity');
        if (tokenAInputField) {
            (tokenAInputField as HTMLInputElement).value = value;
        }
        if (value) {
            const input = value;
            setTokenAQtyLocal(input);
            setTokenAInputQty(input);
            setIsTokenAPrimaryLocal(true);
            dispatch(setIsTokenAPrimary(true));
            dispatch(setPrimaryQuantity(input));
            handleSwapButtonMessage(parseFloat(input));

            const impact =
                input !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          input,
                      )
                    : undefined;

            // console.log({ impact });

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;

            // rawTokenBQty = isSellTokenBase
            //     ? (1 / poolPriceDisplay) * parseFloat(input)
            //     : poolPriceDisplay * parseFloat(input);
        } else {
            handleSwapButtonMessage(parseFloat(tokenAQtyLocal));

            const impact =
                tokenAQtyLocal !== ''
                    ? await calcImpact(
                          true,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          tokenAQtyLocal,
                      )
                    : undefined;

            // console.log({ impact });

            rawTokenBQty = impact ? parseFloat(impact.buyQty) : undefined;

            // rawTokenBQty = isSellTokenBase
            //     ? (1 / poolPriceDisplay) * parseFloat(tokenAQtyLocal)
            //     : poolPriceDisplay * parseFloat(tokenAQtyLocal);
        }
        const truncatedTokenBQty = rawTokenBQty
            ? rawTokenBQty < 100000
                ? rawTokenBQty.toPrecision(6)
                : truncateDecimals(rawTokenBQty, 0)
            : '';
        // const truncatedTokenBQty = truncateDecimals(rawTokenBQty, tokenBDecimals).toString();

        setTokenBQtyLocal(truncatedTokenBQty);
        setTokenBInputQty(truncatedTokenBQty);
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;

        if (buyQtyField) {
            buyQtyField.value = truncatedTokenBQty === 'NaN' ? '' : truncatedTokenBQty;
        }
    };

    const handleTokenBChangeEvent = async (evt?: ChangeEvent<HTMLInputElement>) => {
        if (!poolPriceDisplay) return;
        if (!crocEnv) return;

        let rawTokenAQty;

        if (evt) {
            const input = evt.target.value;
            setTokenBQtyLocal(input);
            setTokenBInputQty(input);
            setIsTokenAPrimaryLocal(false);
            dispatch(setIsTokenAPrimary(false));
            dispatch(setPrimaryQuantity(input));

            const impact =
                input !== ''
                    ? await calcImpact(
                          false,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          input,
                      )
                    : undefined;

            // console.log({ impact });

            rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;

            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;
            // rawTokenAQty = isSellTokenBase
            //     ? poolPriceDisplay * parseFloat(input)
            //     : (1 / poolPriceDisplay) * parseFloat(input);
        } else {
            const impact =
                tokenBQtyLocal !== ''
                    ? await calcImpact(
                          false,
                          crocEnv,
                          tokenPair.dataTokenA.address,
                          tokenPair.dataTokenB.address,
                          slippageTolerancePercentage,
                          tokenBQtyLocal,
                      )
                    : undefined;

            // console.log({ impact });

            rawTokenAQty = impact ? parseFloat(impact.sellQty) : undefined;
            rawTokenAQty ? handleSwapButtonMessage(rawTokenAQty) : null;

            // rawTokenAQty = isSellTokenBase
            //     ? poolPriceDisplay * parseFloat(tokenBQtyLocal)
            //     : (1 / poolPriceDisplay) * parseFloat(tokenBQtyLocal);
        }

        const truncatedTokenAQty = rawTokenAQty
            ? rawTokenAQty < 100000
                ? rawTokenAQty.toPrecision(6)
                : truncateDecimals(rawTokenAQty, 0)
            : '';
        // const truncatedTokenAQty = truncateDecimals(rawTokenAQty, tokenADecimals).toString();

        setTokenAQtyLocal(truncatedTokenAQty);
        setTokenAInputQty(truncatedTokenAQty);
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
        }
    };

    // const handleTokenBChangeClick =async (value: string) => {
    //     if (!poolPriceDisplay) return;

    //     let rawTokenAQty;
    //     const tokenBInputField = document.getElementById('buy-quantity');
    //     if (tokenBInputField) {
    //         (tokenBInputField as HTMLInputElement).value = value;
    //     }
    //     if (value) {
    //         const input = value;
    //         setTokenBQtyLocal(input);
    //         setTokenBInputQty(input);
    //         setIsTokenAPrimaryLocal(false);
    //         dispatch(setIsTokenAPrimary(false));
    //         dispatch(setPrimaryQuantity(input));

    //         rawTokenAQty = isSellTokenBase
    //             ? poolPriceDisplay * parseFloat(input)
    //             : (1 / poolPriceDisplay) * parseFloat(input);
    //     } else {
    //         rawTokenAQty = isSellTokenBase
    //             ? poolPriceDisplay * parseFloat(tokenBQtyLocal)
    //             : (1 / poolPriceDisplay) * parseFloat(tokenBQtyLocal);
    //     }
    //     handleSwapButtonMessage(rawTokenAQty);

    //     const truncatedTokenAQty =
    //         rawTokenAQty < 100000 ? rawTokenAQty.toPrecision(6) : truncateDecimals(rawTokenAQty, 0);

    //     // const truncatedTokenAQty = truncateDecimals(rawTokenAQty, tokenADecimals).toString();

    //     setTokenAQtyLocal(truncatedTokenAQty);
    //     setTokenAInputQty(truncatedTokenAQty);
    //     const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
    //     if (sellQtyField) {
    //         sellQtyField.value = truncatedTokenAQty === 'NaN' ? '' : truncatedTokenAQty;
    //     }
    // };

    return (
        <section className={styles.currency_converter}>
            <CurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                searchableTokens={searchableTokens}
                setImportedTokens={setImportedTokens}
                chainId={chainId}
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                sellToken
                handleChangeEvent={handleTokenAChangeEvent}
                handleChangeClick={handleTokenAChangeClick}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                reverseTokens={reverseTokens}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />
            <div className={styles.arrow_container} onClick={handleArrowClick}>
                {/* <img src={tokensArrowImage} alt="arrow pointing down" /> */}
                {/* {isLiq ? null : <span className={styles.arrow} />} */}
                {isLiq ? null : <TokensArrow />}
            </div>
            <CurrencySelector
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                searchableTokens={searchableTokens}
                chainId={chainId}
                direction={isLiq ? '' : 'To:'}
                fieldId='buy'
                handleChangeEvent={handleTokenBChangeEvent}
                // handleChangeClick={handleTokenBChangeClick}
                nativeBalance={props.nativeBalance}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                isWithdrawFromDexChecked={isWithdrawFromDexChecked}
                setIsWithdrawFromDexChecked={setIsWithdrawFromDexChecked}
                isSaveAsDexSurplusChecked={isSaveAsDexSurplusChecked}
                reverseTokens={reverseTokens}
                setIsSaveAsDexSurplusChecked={setIsSaveAsDexSurplusChecked}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />
        </section>
    );
}
