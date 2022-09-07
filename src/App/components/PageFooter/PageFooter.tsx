import styles from './PageFooter.module.css';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium } from 'react-icons/bs';
import { AiFillTwitterCircle } from 'react-icons/ai';
import ChatPanel from '../../../components/Chat/ChatPanel';
import { Dispatch, SetStateAction, useState } from 'react';
import { PoolIF } from '../../../utils/interfaces/PoolIF';
// import { useLocation} from 'react-router-dom'

interface IFooterProps {
    lastBlockNumber: number;
    userIsOnline: boolean;
    favePools: PoolIF[];
    chatStatus: boolean;
    setChatStatus: Dispatch<SetStateAction<boolean>>;
}

const pageBlockSign = <div className={styles.page_block_sign}></div>;

export default function PageFooter(props: IFooterProps) {
    const { userIsOnline, lastBlockNumber, favePools } = props;
    return (
        <footer data-testid={'page-footer'} className={styles.footer}>
            {userIsOnline ? '' : 'Offline'}

            <a onClick={() => props.setChatStatus(!props.chatStatus)}>Chat</a>
            <a href='#'>
                <AiFillTwitterCircle size={15} />
                {/* <span>Twitter</span> */}
            </a>
            <a href='#'>
                <FaDiscord size={15} />
                {/* <span>Discord</span> */}
            </a>
            <a href='#'>
                <BsMedium size={15} />
                {/* <span>Medium</span> */}
            </a>
            <a href='#'>
                <FaGithub size={15} />
                {/* <span>Github</span> */}
            </a>
            <a href='#'>
                <span>Docs</span>
            </a>
            {/* {location.pathname !== '/' && ( */}

            <a href='#'>
                {pageBlockSign}
                <span>{lastBlockNumber}</span>
            </a>
            {/* // )} */}
        </footer>
    );
}
