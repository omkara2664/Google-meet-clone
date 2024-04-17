import {
    Mic,
    Video,
    PhoneOff,
    MicOff,
    VideoOff
} from "lucide-react";
import styles from "@/component/Bottom/index.module.css";
import cx from 'classnames';


const Bottom = (props) => {
    const { muted, playing, toggleAudio, toggleVideo, leaveRoom } = props;
    return (
        <div className={styles.bottomMenu}>
            {muted ? (<MicOff className={cx(styles.icon, styles.active)} onClick={toggleAudio} size={55} />) : (<Mic className={styles.icon} onClick={toggleAudio} size={55} />)}
            {playing ? (<Video className={styles.icon} onClick={toggleVideo} size={55} />) : (<VideoOff className={cx(styles.icon, styles.active)} onClick={toggleVideo} size={55} />)}
            <PhoneOff size={55} className={styles.icon} onClick={leaveRoom} />
        </div>
    )
}

export default Bottom;