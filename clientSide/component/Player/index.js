import ReactPlayer from 'react-player';
import cx from "classnames";
import styles from "@/component/Player/index.module.css";
import { MicOff, Mic, UserSquare2 } from "lucide-react";


const Player = (props) => {
    const { url, muted, playing, isActive } = props;
    // console.log("stream", url, playerId);
    return (
        <div className={cx(
            styles.playerContainer, {
            [styles.notActive]: !isActive,
            [styles.isActive]: isActive,
            [styles.notPlaying]: !playing,  // This is for disable video streaming
        }
        )}>
            {playing ?
                <ReactPlayer
                    url={url}
                    muted={muted}
                    playing={playing}
                    width="100%"
                    height="100%"
                />
                : <UserSquare2 className={styles.user} size={isActive ? 400 : 150} />
            }
            {!isActive ? (
                muted ? <MicOff className={styles.icon} size={20} /> : <Mic className={styles.icon} size={20} />
            ) : undefined}
        </div>
    )
}

export default Player