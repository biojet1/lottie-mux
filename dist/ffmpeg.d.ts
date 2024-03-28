export interface VideoOutParams {
    codec?: string;
    suffix?: string;
    pix_fmt?: string;
    alpha?: false;
    acodec?: string;
    preset?: string;
    crf?: number;
}
export declare function ffcmd(input_params: any, size: [number, number], alpha: boolean, output_params: VideoOutParams, output_file: string, fps: number): Promise<string[]>;
