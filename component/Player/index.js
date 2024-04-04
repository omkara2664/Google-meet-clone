import ReactPlayer from 'react-player';

const Player = (props) => {
    const { playerId, url, muted, playing } = props;
    console.log("stream", url, playerId);
    return (
        <div>
            <ReactPlayer
                key={playerId}
                url={url}
                muted={muted}
                playing={playing}
            />
        </div>
    )
}

export default Player