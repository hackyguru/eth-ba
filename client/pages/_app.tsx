import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Providers from "../components/Providers";
import { WakuProvider } from "../hooks/useWaku";
import { ChatProvider } from "../hooks/useChat";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <WakuProvider>
        <ChatProvider>
          <Component {...pageProps} />
        </ChatProvider>
      </WakuProvider>
    </Providers>
  );
}
