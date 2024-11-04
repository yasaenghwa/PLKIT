/* global WebSocket */

import React, { useState, useEffect, useRef } from "react";
import { Heading } from "@enact/sandstone/Heading";
import { Layout, Cell } from "@enact/ui/Layout";
import Image from "@enact/sandstone/Image";
import css from "./VideoStream.module.less";

const VideoStream = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const previousImageUrl = useRef();

  useEffect(() => {
    const ws = new WebSocket("ws://plkit.site/ws/video");
    ws.binaryType = "blob";

    ws.onmessage = (event) => {
      const blobUrl = URL.createObjectURL(event.data);
      setImageSrc(blobUrl);

      // 이전 Blob URL 해제하여 메모리 누수 방지
      if (previousImageUrl.current) {
        URL.revokeObjectURL(previousImageUrl.current);
      }
      previousImageUrl.current = blobUrl;
    };

    // 컴포넌트 언마운트 시 WebSocket 연결 해제 및 Blob URL 해제
    return () => {
      ws.close();
      if (previousImageUrl.current) {
        URL.revokeObjectURL(previousImageUrl.current);
      }
    };
  }, []);

  return (
    <Layout orientation="vertical" className={css.videoStream}>
      <Cell shrink>
        <Heading showLine>실시간 영상 스트리밍</Heading>
      </Cell>
      <Cell>
        <div className={css.imageContainer}>
          <Image src={imageSrc} alt="Video Stream" className={css.image} />
        </div>
      </Cell>
    </Layout>
  );
};

export default VideoStream;
