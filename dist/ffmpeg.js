import { ffParams } from "./ffparams.js";
export async function ffcmd(input_params, size, alpha, output_params, output_file, fps) {
    let output = {
        args: Array.from((function* () {
            let { suffix, pix_fmt, codec, acodec, preset, crf } = output_params;
            if (!codec) {
                if (alpha) {
                    codec = 'qtrle';
                }
                else {
                    codec = 'libx264';
                }
            }
            if (!pix_fmt) {
                if (codec == 'libx264' && size[0] % 2 === 0 && size[1] % 2 === 0) {
                    pix_fmt = 'yuv420p';
                }
            }
            if (suffix) {
            }
            else if (codec.indexOf('vpx') >= 0) {
                suffix = 'webm';
            }
            else if (codec.indexOf('qtrle') >= 0) {
                suffix = 'mov';
            }
            else {
                suffix = 'mp4';
            }
            // if (acodec) {
            //   yield ['acodec', acodec];
            // }
            if (codec)
                yield ['vcodec', codec];
            if (codec.indexOf('264') >= 0 || codec.indexOf('av1') >= 0) {
                if (preset)
                    yield ['preset', preset];
                if (crf)
                    yield ['crf', crf];
            }
            else if (codec.indexOf('vpx') >= 0) {
                // yield ['lossless', '1'];
            }
            if (pix_fmt)
                yield ['pix_fmt', pix_fmt];
            // if (tune) yield ['tune', tune];
            // if (bitrate) yield ['b', bitrate];
            // if (threads) yield ['threads', threads];
        })()),
        path: output_file
    };
    let input = {
        args: [
            ['f', 'image2pipe'],
            ['s', `${size[0]}x${size[1]}`],
            ['vcodec', 'png'],
            ['r', `${fps}`],
            '-an',
        ],
        path: '-'
    };
    return ffParams({
        bin: 'ffmpeg',
        args: ['-hide_banner',
            '-v', 'warning',
            '-stats',
            '-y'],
        output, input
    });
}
