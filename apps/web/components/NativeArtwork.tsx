"use client";
import { Component, type ReactNode } from "react";
import { nativeWorks } from "../lib/works.generated";

class ArtworkBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="artwork-notice" role="alert">
          <p>작품을 실행하지 못했어요.</p>
          <button onClick={() => this.setState({ failed: false })}>
            다시 시도
          </button>
        </div>
      );
    return this.props.children;
  }
}
export function NativeArtwork({ slug }: { slug: string }) {
  const Work = nativeWorks[slug];
  if (!Work)
    return (
      <div className="artwork-notice" role="alert">
        작품을 불러올 수 없습니다. 페이지를 새로고침해 주세요.
      </div>
    );
  return (
    <ArtworkBoundary key={slug}>
      <Work />
    </ArtworkBoundary>
  );
}
