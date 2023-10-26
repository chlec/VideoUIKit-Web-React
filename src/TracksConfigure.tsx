import React, { useState, useEffect, useRef, PropsWithChildren } from 'react'
import { RtcPropsInterface, mediaStore } from './PropsContext'
import {
  ILocalVideoTrack,
  ILocalAudioTrack,
  createMicrophoneAndCameraTracks,
  createMicrophoneAudioTrack
} from 'agora-rtc-react'
import { TracksProvider } from './TracksContext'

const useAudioTrack = createMicrophoneAudioTrack({ encoderConfig: {} })

const useTracks = createMicrophoneAndCameraTracks(
  { encoderConfig: {} },
  { encoderConfig: {} }
)
/**
 * React component that create local camera and microphone tracks and assigns them to the child components
 */
const TracksConfigure: React.FC<
  PropsWithChildren<Partial<RtcPropsInterface>>
> = (props) => {
  const [ready, setReady] = useState<boolean>(false)
  const [localVideoTrack, setLocalVideoTrack] =
    useState<ILocalVideoTrack | null>(null)
  const [localAudioTrack, setLocalAudioTrack] =
    useState<ILocalAudioTrack | null>(null)
  const tracksData = (props.enableVideo ? useTracks : useAudioTrack)()
  const mediaStore = useRef<mediaStore>({})

  useEffect(() => {
    if ('tracks' in tracksData && tracksData.tracks !== null) {
      const tracks = tracksData.tracks

      setLocalAudioTrack(tracks[0])
      setLocalVideoTrack(tracks[1])
      mediaStore.current[0] = {
        audioTrack: tracks[0],
        videoTrack: tracks[1]
      }
      setReady(true)
    } else if ('track' in tracksData && tracksData.track !== null) {
      const track = tracksData.track

      setLocalAudioTrack(track)
      mediaStore.current[0] = {
        audioTrack: track
      }
      setReady(true)
    } else if (tracksData.error) {
      console.error(tracksData.error)
      setReady(false)
    }
    return () => {
      if ('tracks' in tracksData && tracksData.tracks) {
        const tracks = tracksData.tracks
        // eslint-disable-next-line no-unused-expressions
        tracks[0]?.close()
        // eslint-disable-next-line no-unused-expressions
        tracks[1]?.close()
      } else if ('track' in tracksData && tracksData.track) {
        tracksData.track?.close()
      }
    }
  }, [tracksData.ready, tracksData.error]) //, ready])

  return (
    <TracksProvider
      value={{
        localVideoTrack: localVideoTrack,
        localAudioTrack: localAudioTrack
      }}
    >
      {ready ? props.children : null}
    </TracksProvider>
  )
}

export default TracksConfigure
