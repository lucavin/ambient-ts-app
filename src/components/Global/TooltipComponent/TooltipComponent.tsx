import styles from './TooltipComponent.module.css';
import { Tooltip } from '@mui/material';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

interface TooltipComponentProps {
    title: string;
    placement?:
        | 'right'
        | 'bottom-end'
        | 'bottom-start'
        | 'bottom'
        | 'left-end'
        | 'left-start'
        | 'left'
        | 'right-end'
        | 'right-start'
        | 'top-end'
        | 'top-start'
        | 'top'
        | undefined;
}

export default function TooltipComponent(props: TooltipComponentProps) {
    return (
        <Tooltip
            title='Tooltip title'
            placement={props.placement ? props.placement : 'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <div className={styles.icon}>
                <AiOutlineQuestionCircle size={18} />
            </div>
        </Tooltip>
    );
}
