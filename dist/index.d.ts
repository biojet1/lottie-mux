import { Browser, LaunchOptions, BrowserLaunchArgumentOptions } from "puppeteer";
export declare function render_lottie({ uri, file, output, width, height, par, quality, puppeteer_options, type, browser, video_params }: {
    uri?: string;
    file?: string;
    output: string;
    width?: number;
    height?: number;
    par?: string;
    quality?: number;
    type?: 'mp4' | 'webm';
    puppeteer_options?: BrowserLaunchArgumentOptions & LaunchOptions;
    browser?: Browser;
    video_params?: {
        codec?: string;
        suffix?: string;
        pix_fmt?: string;
        alpha?: false;
        acodec?: string;
        preset?: string;
        crf?: number;
    };
}): Promise<void>;
export declare function frameTime(N: number, fps: number): string;
