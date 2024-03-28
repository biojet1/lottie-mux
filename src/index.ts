import { launch, Browser, LaunchOptions, BrowserLaunchArgumentOptions } from "puppeteer";
import path from "path";
import { fileURLToPath } from 'node:url';
import fs from "fs";
import { ffParams } from "./ffparams.js";
import { VideoOutParams, ffcmd } from "./ffmpeg.js";
import { spawn, StdioOptions } from 'child_process';
export async function render_lottie({
  uri, file, output, width, height, par, quality,
  puppeteer_options, type, browser, video_params = {}

}: {
  uri?: string,
  file?: string,
  output: string,
  width?: number,
  height?: number,
  par?: string,
  quality?: number,
  type?: 'mp4' | 'webm',
  puppeteer_options?: BrowserLaunchArgumentOptions & LaunchOptions,
  browser?: Browser,
  video_params?: {
    codec?: string,
    suffix?: string,
    pix_fmt?: string,
    alpha?: false,
    acodec?: string,
    preset?: string,
    crf?: number,
  },
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
      container: document.getElementById("root"),
      loop: false,
      autoplay: false,
      animationData,
    });
    `);

    // let html = await page.content();
    // console.log(html);
    // fs.writeFileSync('/tmp/lot.html', html);
    const rootHandle = await page.mainFrame().$('#root')
    if (!rootHandle) {
      return;
    }
    const duration = parseFloat(await page.evaluate(`animation.getDuration()`) as string);
    const frames = parseInt(await page.evaluate(`animation.getDuration(true)`) as string);
    const frame_rate = parseFloat(await page.evaluate(`~~animationData.fr`) as string);
    const width = parseInt(await page.evaluate(`animationData.w`) as string);
    const height = parseInt(await page.evaluate(`animationData.h`) as string);
    const start_frame = 0;
    const end_frame = frames;
    console.log(`${frameTime(frames, frame_rate)}s ${frames} frames ${frame_rate} fps ${width}x${height}`);

    let ffproc = await ffcmd({}, [width, height], false, video_params, output, frame_rate).then((args) => {
      let [prog, ...rest] = args;
      console.log(`${prog}`, ...rest);
      return spawn(prog, rest, {
        stdio: ['pipe', 'inherit', 'inherit'],
      });
    });

    let sink = ffproc.stdin;
    // fs.openSync()

    // ffproc.
    for (let frame = start_frame; frame < end_frame; ++frame) {
      await page.evaluate(`animation.goToAndStop(${frame}, true)`);
      const screenshot = await rootHandle.screenshot({
        type: 'png',
        // clip: { x: 0, y: 0, width, height },

      });
      process.stdout.write(`\r${frame} ${screenshot.byteLength}`);
      // console.log(`\r${frame}`);
      sink.write(screenshot);
    }
    sink.end();
  } finally {
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