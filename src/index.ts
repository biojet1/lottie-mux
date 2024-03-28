import { launch, Browser, LaunchOptions, ScreenshotOptions, BrowserLaunchArgumentOptions } from "puppeteer";
import path from "path";
import { fileURLToPath } from 'node:url';
import { Writable } from 'stream';
import fs from "fs";
import { ffParams } from "./ffparams.js";
import { VideoOutParams, ffcmd } from "./ffmpeg.js";
import { spawn, StdioOptions } from 'child_process';
export async function render_lottie({
  uri, file, output, width = 0, height, par, quality,
  puppeteer_options, browser, video_params = {}, sink,
  bgcolor, fps
}: {
  uri?: string,
  file?: string,
  output: string,
  width?: number,
  height?: number,
  par?: string,
  quality?: number,
  alpha?: boolean,
  fps?: number,
  puppeteer_options?: BrowserLaunchArgumentOptions & LaunchOptions,
  browser?: Browser,
  bgcolor?: string,
  video_params?: {
    codec?: string,
    suffix?: string,
    pix_fmt?: string,
    acodec?: string,
    preset?: string,
    crf?: number,
  },
  sink?: Writable,
}) {

  let html_file = import.meta.resolve('../lottie.html');
  let lottie_file = import.meta.resolve('../lottie.5.12.2.min.js');
  let lottie_data = file ? fs.readFileSync(file).toString() : null;

  if (!browser) {
    if (!puppeteer_options) {
      puppeteer_options = {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        timeout: 10000,
      };
    }
    browser = await launch(puppeteer_options);
  }

  // return;

  try {

    const page = await browser.newPage();
    await page.goto(html_file);
    await page.addScriptTag({ path: fileURLToPath(lottie_file) });
    await page.evaluate(`
    const animationData = ${lottie_data};
    let animation = lottie.loadAnimation({
      container: document.body,
      loop: false,
      autoplay: false,
      animationData,
    });
    const {w, h, fr} = animationData;
    `);

    if (bgcolor) {
      page.evaluate(`document.body.style.backgroundColor = '${bgcolor}'`);
    }
    const div = await page.mainFrame().$('body')
    if (!div) {
      return;
    }
    const frames = parseInt(await page.evaluate(`animation.getDuration(true)`) as string);
    const frame_rate = parseFloat(await page.evaluate(`~~animationData.fr`) as string);
    const W = parseInt(await page.evaluate(`animationData.w`) as string);
    const H = parseInt(await page.evaluate(`animationData.h`) as string);
    if (!fps) {
      fps = frame_rate;
    }
    {// Size
      if (!width) {
        if (height) {
          width = (height * W) / H;
        } else {
          width = W;
          height = H;
        }
      } else if (!height) {
        if (width) {
          height = (width * H) / W;
        } else {
          width = W;
          height = H;
        }
      }
      await page.evaluate(`document.body.style.height = "${height}px"`);
      await page.evaluate(`document.body.style.width = "${width}px"`);
    }

    const start_frame = 0;
    const end_frame = frames;
    console.log(`${frameTime(frames, frame_rate)}s ${frames} frames ${frame_rate} fps ${W}x${H} -> ${width}x${height}`);

    {
      let html = await page.content();
      // console.log(html);
      fs.writeFileSync('/tmp/lot.html', html);
    }

    if (!sink) {
      let ffproc = await ffcmd(fps, [width, height], false, output, video_params).then((cmd) => {
        let [bin, ...args] = cmd;
        console.log(`${bin}`, ...args);
        return spawn(bin, args, {
          stdio: ['pipe', 'inherit', 'inherit'],
        });
      });
      sink = ffproc.stdin;
    }
    if (!sink) {
      return;
    }
    const sso: ScreenshotOptions = {
      type: 'png',
      omitBackground: bgcolor ? false : true,
      // clip: { x: 0, y: 0, width, height },
    };

    if (fps == frame_rate) {
      for (let frame = start_frame; frame < end_frame; ++frame) {
        await page.evaluate(`animation.goToAndStop(${frame}, true)`);
        const screenshot = await div.screenshot(sso);
        process.stdout.write(`\r${frame} ${screenshot.byteLength}`);
        sink.write(screenshot);
      }
    } else {
      const S = Math.round(start_frame * fps / frame_rate);
      const E = Math.round(end_frame * fps / frame_rate);
      for (let f = S; f < E; ++f) {
        let frame = Math.round(f * frame_rate / fps);
        await page.evaluate(`animation.goToAndStop(${frame}, true)`);
        const screenshot = await div.screenshot(sso);
        process.stdout.write(`\r${f} ${frame} ${screenshot.byteLength}`);
        sink.write(screenshot);
      }
    }
  } finally {
    if (sink) {
      sink.end();
    }
    browser.close();
  }
}

export function frameTime(N: number, fps: number) {
  if (N === Infinity || N === -Infinity) {
    return 'IN:FI:NIT';
  }
  const u = floor((N * 1000) / fps); // miliseconds
  const [h, a] = [floor(u / (3600 * 1000)), u % (3600 * 1000)];
  const [m, b] = [floor(a / (60 * 1000)), a % (60 * 1000)];
  const [s, z] = [floor(b / 1000), b % 1000];
  return (
    `${h > 0 ? `${h > 9 ? '' : '0'}${h}:` : ''}` +
    `${m < 10 ? '0' : ''}${m}:` +
    `${s < 10 ? '0' : ''}${s}` +
    `${z <= 0
      ? '    '
      : z < 10
        ? '.00' + z
        : z < 100
          ? '.0' + z
          : ('.' + z).replace(/0+$/, ' ')
    }`
  );
}
const { max, round, floor } = Math;