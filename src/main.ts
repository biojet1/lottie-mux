import { render_lottie } from './index.js';
export function main() {
    const args = process.argv.slice(2);
    return import('yargs')
        .then((yargs) => yargs.default(args)).then((yinst) => {
            return yinst
                .usage('$0 <input> <output>', 'Lottie json to video file using pupetter')
                .strict()
                .help()
                .version()
                .demand(1)
                .options({
                    width: {
                        describe: 'set width',
                        type: 'number',
                    },
                    height: {
                        describe: 'set height',
                        type: 'number',
                    },
                    // par: {
                    //     describe: 'set preserveAspectRatio',
                    //     type: 'string',
                    // },
                    fps: {
                        describe: 'video frame rate',
                        type: 'number',
                    },
                    bgcolor: {
                        describe: `set background color`,
                        type: 'string',
                    },

                }).argv;
        }).then((opt) => {
            const { bgcolor, width, height, fps } = opt;

            let src = opt.input as string;
            // console.log(opt);
            let uri = undefined;
            let file = undefined;
            let output = opt.output as string;
            if (src.indexOf('://') < 0) {
                file = src;
            } else {
                uri = src;
            }
            return render_lottie({
                uri, file, fps,
                output, bgcolor, width, height

            })
        })
        ;
}
