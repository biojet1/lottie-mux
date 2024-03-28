import { render_lottie } from './index.js';
export function main() {
    const args = process.argv.slice(2);
    return import('yargs')
        .then((yargs) => yargs.default(args)).then((yinst) => {
        return yinst
            .usage('$0 <svg> <output>', 'Lottie json to video file using pupetter')
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
            // quality: {
            //     describe: 'Quality of the image, between 0-100. Not applicable to png images',
            //     type: 'number',
            // },
            // type: {
            //     describe: `image type if piping to stdout `,
            //     choices: ['png', 'jpeg', 'webp']
            // },
        }).argv;
    }).then((opt) => {
        let src = opt.svg;
        // console.log(opt);
        let uri = undefined;
        let file = undefined;
        let output = opt.output;
        if (src.indexOf('://') < 0) {
            file = src;
        }
        else {
            uri = src;
        }
        return render_lottie({
            uri, file,
            output,
        });
    });
}
